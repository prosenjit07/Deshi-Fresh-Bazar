import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ProductStatus } from '@/lib/product-status';

// GET /api/admin/products/[id]
export async function GET(
  _request: Request,
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
    const { name, description, details, price, image, categoryId, stock, slug, packages, status } = body;

    // Validate required fields
    if (!name || !description || !price || !image || !categoryId || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start a transaction to handle both product and package updates
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!existingProduct) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const normalizedStatus = status ?? existingProduct.status;

      if (!Object.values(ProductStatus).includes(normalizedStatus)) {
        throw new Error('INVALID_PRODUCT_STATUS');
      }

      // 1. Update the product
      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          details,
          price: Number.parseFloat(price),
          image,
          categoryId,
          stock: Number.parseInt(stock) || 0,
          status: normalizedStatus,
          archivedAt:
            normalizedStatus === ProductStatus.ARCHIVED
              ? existingProduct.status === ProductStatus.ARCHIVED
                ? undefined
                : new Date()
              : null,
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

    revalidateTag('products');

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message === 'INVALID_PRODUCT_STATUS') {
      return NextResponse.json({ error: 'Invalid product status' }, { status: 400 });
    }
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

// PATCH /api/admin/products/[id]
export async function PATCH(
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
    const { status } = body as { status?: ProductStatus };

    if (!status || !Object.values(ProductStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid product status' }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        status,
        archivedAt:
          status === ProductStatus.ARCHIVED
            ? existingProduct.status === ProductStatus.ARCHIVED
              ? undefined
              : new Date()
            : null,
        stock: status === ProductStatus.ARCHIVED ? 0 : undefined,
      },
      include: {
        category: true,
        packages: true,
      },
    });

    revalidateTag('products');

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _request: Request,
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

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        select: { id: true, status: true },
      });

      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const hasOrderItems = await tx.orderItem.findFirst({
        where: { productId: id },
        select: { id: true },
      });

      // Remove cart items in both archive and delete flows so the retired product
      // cannot remain in active carts.
      await tx.cartItem.deleteMany({
        where: { productId: id },
      });

      if (hasOrderItems) {
        await tx.product.update({
          where: { id },
          data: {
            status: ProductStatus.ARCHIVED,
            archivedAt: new Date(),
            stock: 0,
          },
        });

        return {
          action: 'archived' as const,
          message: 'Product archived because it exists in order history',
        };
      }

      if (product.status !== ProductStatus.ARCHIVED) {
        throw new Error('PRODUCT_MUST_BE_ARCHIVED_FIRST');
      }

      await tx.package.deleteMany({
        where: { productId: id },
      });

      await tx.product.delete({
        where: { id },
      });

      return {
        action: 'deleted' as const,
        message: 'Product deleted successfully',
      };
    });

    revalidateTag('products');

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    if (error instanceof Error && error.message === 'PRODUCT_MUST_BE_ARCHIVED_FIRST') {
      return NextResponse.json(
        { error: 'Archive the product before permanently deleting it' },
        { status: 400 }
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
