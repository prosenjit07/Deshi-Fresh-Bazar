import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// GET /api/admin/products/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const body = await request.json();
    const { name, description, price, image, categoryId, stock, slug } = body;

    // Validate required fields
    if (!name || !description || !price || !image || !categoryId || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        categoryId,
        stock: stock || 0,
        slug,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 