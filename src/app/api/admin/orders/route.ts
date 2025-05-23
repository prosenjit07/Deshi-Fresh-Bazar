import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prismaClient from '../../util';
import jwt from 'jsonwebtoken';

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const search = url.searchParams.get('search') || '';

    // Calculate skip value for pagination
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Build the where clause for search
    const where = search
      ? {
          OR: [
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalOrders = await prismaClient.order.count({ where });

    // Get orders for current page
    const orders = await prismaClient.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: ITEMS_PER_PAGE,
    });

    return NextResponse.json({
      orders,
      totalPages: Math.ceil(totalOrders / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Error fetching orders' },
      { status: 500 }
    );
  }
}