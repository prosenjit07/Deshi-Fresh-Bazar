import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query'); // orderId, invoice, trackingCode, or phone

    if (!query) {
      return NextResponse.json(
        { message: 'Tracking query is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: query },
          { courierInvoice: query },
          { courierTrackingCode: query },
          { customerPhone: query },
        ]
      },
      select: {
        id: true,
        status: true,
        customerName: true,
        courierTrackingCode: true,
        courierStatus: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            quantity: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
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
    console.error('Error fetching tracking info:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tracking info' },
      { status: 500 }
    );
  }
}
