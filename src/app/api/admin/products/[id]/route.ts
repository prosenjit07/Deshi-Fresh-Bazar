import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// GET /api/admin/products/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      where: { id },
      include: { 
        category: true,
        packages: true
      },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { name, description, details, price, image, categoryId, stock, slug, packages } = body;

    // Validate required fields
    if (!name || !description || !price || !image || !categoryId || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start a transaction to handle both product and package updates
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Update the product
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          details,
          price: Number.parseFloat(price),
          image,
          categoryId,
          stock: Number.parseInt(stock) || 0,
          slug,
        },
        include: {
          packages: true,
          category: true
        }
      });

      // 2. Handle packages if they exist
      if (packages && packages.length > 0) {
        // Delete all existing packages
        await tx.package.deleteMany({
          where: { productId: id }
        });

        // Create new packages
        const validPackages = packages.filter(
          (pkg: { name?: string; price?: number | string }) =>
            Boolean(pkg.name) && pkg.price !== undefined && pkg.price !== null
        );
        if (validPackages.length > 0) {
          await tx.package.createMany({
            data: validPackages.map((pkg: { name: string; price: number | string }) => ({
              name: pkg.name,
              price: Number(pkg.price),
              productId: id
            }))
          });
        }
      }

      // 3. Return the updated product with packages
      return tx.product.findUnique({
        where: { id },
        include: {
          packages: true,
          category: true
        }
      });
    });

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('slug')
    ) {
      return NextResponse.json({ error: 'Slug must be unique.' }, { status: 400 });
    }
    console.error('!!!!Error updating product:!!!??', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Use a transaction to remove dependent records and delete the product
    await prisma.$transaction(async (tx) => {
      // 1. Remove cart items referencing this product (safe to cleanup)
      await tx.cartItem.deleteMany({
        where: { productId: id },
      });
 
      // 2. If any order items reference this product, block deletion to preserve order history
      const hasOrderItems = await tx.orderItem.findFirst({
        where: { productId: id },
        select: { id: true },
      });
      if (hasOrderItems) {
        throw new Error('PRODUCT_HAS_ORDERS');
      }
 
      // 3. Delete all packages associated with the product
      await tx.package.deleteMany({
        where: { productId: id },
      });
 
      // 4. Delete the product
      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'PRODUCT_HAS_ORDERS') {
      return NextResponse.json(
        { error: 'Cannot delete product because it is associated with existing orders' },
        { status: 409 }
      );
    }
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete product due to existing references' },
        { status: 409 }
      );
    }
    console.error('!!Error deleting product:!!', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
} 
