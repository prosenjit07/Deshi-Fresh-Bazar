import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@/lib/product-status';

// Type for JWT payload
interface JWTPayload {
  id: string;
  role: Role;
}

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    // Verify token and check admin role
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (!decoded.role || decoded.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    // Fetch dashboard statistics
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      activeProducts,
      inactiveProducts,
      archivedProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.product.count({
        where: {
          status: ProductStatus.ACTIVE,
        },
      }),
      prisma.product.count({
        where: {
          status: ProductStatus.INACTIVE,
        },
      }),
      prisma.product.count({
        where: {
          status: ProductStatus.ARCHIVED,
        },
      }),
    ]);

    return NextResponse.json({
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      activeProducts,
      inactiveProducts,
      archivedProducts,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { message: 'Error fetching statistics' },
      { status: 500 }
    );
  }
} 
