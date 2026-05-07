import { NextResponse } from 'next/server';
import prismaClient from '../../util';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prismaClient.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        shippingAddress: true,
        shippingCity: true,
        shippingPostalCode: true,
        shippingCountry: true,
        createdAt: true,
        totalAmount: true,
        courierTrackingCode: true,
        items: true,
      }
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 
