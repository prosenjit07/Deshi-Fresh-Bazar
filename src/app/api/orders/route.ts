import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma as prismaClient } from '@/lib/prisma';
import { SteadfastService } from '@/lib/steadfast';
import { sendMetaCapiEvent } from '@/lib/meta-capi';

// Configure dynamic route handling
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret);
    return decoded as { id: string };
  } catch {
    return null;
  }
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  totalPrice: number;
  selectedPackage?: string;
}

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (token) {
    const decoded = await verifyToken(token);
    if (decoded?.id) return decoded.id;
  }
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      address, 
      city, 
      postalCode, 
      country,
      items,
      subtotal,
      shipping,
      total,
      paymentMethod 
    } = data;

    const userId = await getAuthenticatedUserId();

    let order = await prismaClient.order.create({
      data: {
        ...(userId ? { userId } : {}),
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        shippingCity: city,
        shippingPostalCode: postalCode,
        shippingCountry: country,
        subtotal: subtotal,
        shippingCost: shipping || 0,
        totalAmount: total,
        paymentMethod: paymentMethod,
        status: 'PENDING',
        items: {
          create: items.map((item: OrderItem) => ({
            productId: item.id,
            productName: item.name,
            productImage: item.image,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.totalPrice,
            packageType: item.selectedPackage
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Create Steadfast Shipment if COD
    if (paymentMethod === 'Cash on Delivery') {
      try {
        const itemDescriptions = items.map((i: OrderItem) => `${i.name} (x${i.quantity})`).join(', ');
        
        const steadfastRes = await SteadfastService.createOrder({
          invoice: order.id,
          recipient_name: fullName,
          recipient_phone: phone,
          recipient_address: `${address}, ${city}, ${postalCode}`,
          recipient_email: email,
          item_description: itemDescriptions,
          cod_amount: total,
          note: 'FreshBazar Order',
        });

        // Update local order with Steadfast details
        order = await prismaClient.order.update({
          where: { id: order.id },
          data: {
            courierProvider: 'Steadfast',
            courierInvoice: steadfastRes.invoice || order.id,
            courierConsignmentId: steadfastRes.consignment_id?.toString(),
            courierTrackingCode: steadfastRes.tracking_code,
            courierStatus: 'pending',
            courierStatusRaw: JSON.stringify(steadfastRes),
            courierShipmentCreatedAt: new Date(),
            courierLastSyncedAt: new Date(),
          },
          include: {
            items: true
          }
        });
      } catch (err: unknown) {
        console.error('Steadfast shipment creation failed:', err);
        // Log the error but do not fail the local order creation
        const errorMessage = err instanceof Error ? err.message : String(err);
        await prismaClient.order.update({
          where: { id: order.id },
          data: {
            courierProvider: 'Steadfast',
            courierError: errorMessage,
          }
        });
      }
    }

    // Trigger Meta CAPI Purchase event
    try {
      const cookieStore = await cookies();
      const fbp = cookieStore.get('_fbp')?.value;
      const fbc = cookieStore.get('_fbc')?.value;
      
      const clientIpAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
      const clientUserAgent = request.headers.get("user-agent") || undefined;

      await sendMetaCapiEvent({
        eventName: "Purchase",
        eventId: order.id,
        actionSource: "website",
        customData: {
          currency: "BDT",
          value: total,
          content_type: "product",
          content_ids: items.map((item: OrderItem) => item.id),
          contents: items.map((item: OrderItem) => ({
            id: item.id,
            quantity: item.quantity,
            item_price: item.price,
            title: item.name,
          })),
          num_items: items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0),
        },
        userData: {
          clientIpAddress,
          clientUserAgent,
          fbp,
          fbc,
          emails: email ? [email] : undefined,
          phones: phone ? [phone] : undefined,
          firstName: fullName,
          cities: city ? [city] : undefined,
          zipCodes: postalCode ? [postalCode] : undefined,
          countries: country ? [country] : undefined,
          externalId: userId || undefined,
        }
      });
    } catch (err) {
      console.error('Failed to send Meta CAPI Purchase event:', err);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    // Get orders using Prisma
    const orders = await prismaClient.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 
