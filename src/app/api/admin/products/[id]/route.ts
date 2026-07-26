import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ProductStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const productUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().positive('Price must be positive')),
  image: z.string().min(1, 'Image path/URL is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative('Stock must be non-negative')),
  slug: z.string().min(1, 'Slug is required'),
  status: z.nativeEnum(ProductStatus).optional(),
  packages: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Package name is required'),
      price: z.preprocess((val) => Number(val), z.number().positive('Package price must be positive')),
    })
  ).optional().default([]),
});

// Helper for retrying transactions
async function withTransactionRetry<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  requestId: string,
  context: { operationType: string; payloadSummary: Record<string, unknown> },
  maxRetries = 3,
  delayMs = 100
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Validate transaction state
        await tx.$queryRawUnsafe('SELECT 1');
        return await operation(tx);
      }, {
        maxWait: 5000,
        timeout: 10000,
      });
    } catch (error: unknown) {
      attempt++;
      const err = error as Error & { code?: string };
      const isTransient = 
        err?.message?.includes('Transaction not found') || 
        err?.message?.includes('Transaction ID is invalid') || 
        err?.message?.includes('obtained before disconnecting') ||
        err?.code === 'P2028';

      if (isTransient && attempt < maxRetries) {
        console.warn(`[Transaction Retry] Request ${requestId} attempt ${attempt} failed with transient error: ${err.message}. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      console.error(`[Transaction Error] Request ${requestId} failed on attempt ${attempt}.`, {
        error: err.message,
        code: err.code,
        context
      });
      throw error;
    }
  }
  throw new Error('Transaction failed after retries');
}

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
    console.error('[GET /api/admin/products/[id]] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = await params;
    console.log(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Starting update...`);

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      console.error(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Authentication failed: No token`);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'ADMIN') {
      console.error(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Authorization failed: Role is ${decoded.role}`);
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    
    const body = await request.json();
    console.log(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Request body received. Keys:`, Object.keys(body));
    
    // Validate with Zod
    const parseResult = productUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Validation failed:`, parseResult.error.format());
      return NextResponse.json(
        { error: 'Invalid parameters', details: parseResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, description, details, price, image, categoryId, stock, slug, packages, status } = parseResult.data;

    // Start a transaction to handle both product and package updates
    console.log(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Starting Prisma transaction...`);
    
    const updatedProduct = await withTransactionRetry(async (tx) => {
      const existingProduct = await tx.product.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!existingProduct) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const normalizedStatus = status ?? existingProduct.status;

      // 1. Update the product
      console.log(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Updating product data...`);
      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          details,
          price,
          image,
          categoryId,
          stock,
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
        console.log(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Processing ${packages.length} packages...`);
        // Delete all existing packages
        await tx.package.deleteMany({
          where: { productId: id }
        });

        // Create new packages
        await tx.package.createMany({
          data: packages.map((pkg) => ({
            name: pkg.name,
            price: pkg.price,
            productId: id
          }))
        });
      } else {
        // If empty packages array passed, clear all existing packages
        await tx.package.deleteMany({
          where: { productId: id }
        });
      }

      // 3. Return the updated product with packages
      return tx.product.findUnique({
        where: { id },
        include: {
          packages: true,
          category: true
        }
      });
    }, requestId, { operationType: 'UPDATE_PRODUCT', payloadSummary: { id, name, price, stock, packagesCount: packages.length } });

    console.log(`[PUT /api/admin/products/${id}] [ReqID: ${requestId}] Update successful, revalidating cache...`);
    revalidateTag('products');

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error(`[PUT /api/admin/products/] Detailed Error:`, error);
    
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
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
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
    console.log(`[PATCH /api/admin/products/${id}] Starting status update...`);
    
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
    console.log(`[PATCH /api/admin/products/${id}] Update successful.`);
    return NextResponse.json(product);
  } catch (error) {
    console.error(`[PATCH /api/admin/products/] Detailed Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
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
    console.log(`[DELETE /api/admin/products/${id}] Starting delete process...`);
    
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

      if (hasOrderItems && product.status !== ProductStatus.ARCHIVED) {
        await tx.product.update({
          where: { id },
          data: {
            status: ProductStatus.ARCHIVED,
            archivedAt: new Date(),
            stock: 0,
          },
        });

        console.log(`[DELETE /api/admin/products/${id}] Product archived instead of deleted due to existing orders.`);
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

      // Preserve order history snapshots while allowing the product row to be removed.
      await tx.$executeRaw`
        UPDATE "OrderItem"
        SET "productId" = NULL
        WHERE "productId" = ${id}
      `;

      await tx.product.delete({
        where: { id },
      });

      console.log(`[DELETE /api/admin/products/${id}] Product deleted successfully.`);
      return {
        action: 'deleted' as const,
        message: 'Product deleted successfully',
      };
    });

    revalidateTag('products');

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[DELETE /api/admin/products/] Detailed Error:`, error);
    
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
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    );
  }
} 
