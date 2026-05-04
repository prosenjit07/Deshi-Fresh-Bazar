import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ProductStatus } from '@/lib/product-status';

interface ProductSequence {
  id: string;
  sequence: number;
}

export async function POST(request: Request) {
  try {
    // Check authentication using JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { products } = body as { products: ProductSequence[] };

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const hasInvalidPayload = products.some(
      ({ id, sequence }) =>
        typeof id !== 'string' ||
        !id ||
        typeof sequence !== 'number' ||
        !Number.isInteger(sequence) ||
        sequence < 0,
    );

    if (hasInvalidPayload) {
      return NextResponse.json({ error: 'Invalid product reorder payload' }, { status: 400 });
    }

    const activeProductsCount = await prisma.product.count({
      where: {
        id: { in: products.map(({ id }) => id) },
        status: ProductStatus.ACTIVE,
      },
    });

    if (activeProductsCount !== products.length) {
      return NextResponse.json(
        { error: 'Only active products can be reordered' },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      products.map(({ id, sequence }) =>
        prisma.product.update({
          where: { id },
          data: { sequence },
        }),
      ),
    );

    revalidateTag('products');

    return NextResponse.json({ message: 'Products reordered successfully' });
  } catch (error) {
    console.error('Error reordering products:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 
