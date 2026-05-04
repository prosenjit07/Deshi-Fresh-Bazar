import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Prisma } from '@prisma/client';
import { ProductStatus } from '@/lib/product-status';

interface ProductPackageInput {
  name?: string;
  price?: number | string;
}

// GET /api/admin/products
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const statusFilter = searchParams.get('status') || 'default';
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const where: Prisma.ProductWhereInput = {};

    if (statusFilter === 'all') {
      // No additional filter.
    } else if (statusFilter === ProductStatus.ACTIVE) {
      where.status = ProductStatus.ACTIVE;
    } else if (statusFilter === ProductStatus.INACTIVE) {
      where.status = ProductStatus.INACTIVE;
    } else if (statusFilter === ProductStatus.ARCHIVED) {
      where.status = ProductStatus.ARCHIVED;
    } else if (statusFilter === 'default') {
      where.status = {
        in: [ProductStatus.ACTIVE, ProductStatus.INACTIVE],
      };
    } else {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { 
          category: true,
          packages: true
        },
        orderBy: [
          { sequence: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);
    const totalPages = Math.ceil(total / pageSize);
    return NextResponse.json({ products, totalPages });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products
export async function POST(request: Request) {
  try {
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
    const { name, description, details, price, image, categoryId, stock, slug, packages, status } = body;

    // Validate required fields
    if (!name || !description || !price || !image || !categoryId || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price is a number
    const priceNum = Number.parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      );
    }

    // Validate stock is a number
    const stockNum = Number.parseInt(stock) || 0;
    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { error: 'Invalid stock quantity' },
        { status: 400 }
      );
    }

    const normalizedStatus =
      status === undefined || status === null || status === ''
        ? ProductStatus.ACTIVE
        : status;

    if (!Object.values(ProductStatus).includes(normalizedStatus)) {
      return NextResponse.json(
        { error: 'Invalid product status' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Create product and packages in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const lastProduct = await tx.product.findFirst({
        orderBy: { sequence: 'desc' },
        select: { sequence: true },
      });

      // 1. Create the product
      const newProduct = await tx.product.create({
        data: {
          name,
          description,
          details,
          price: priceNum,
          image,
          categoryId,
          stock: stockNum,
          status: normalizedStatus,
          archivedAt: normalizedStatus === ProductStatus.ARCHIVED ? new Date() : null,
          slug,
          sequence: (lastProduct?.sequence ?? -1) + 1,
        },
      });

      // 2. Create packages if they exist
      if (packages && packages.length > 0) {
        const validPackages = (packages as ProductPackageInput[]).filter(
          (pkg) => Boolean(pkg.name) && pkg.price !== undefined && pkg.price !== null,
        );
        if (validPackages.length > 0) {
          await tx.package.createMany({
            data: validPackages.map((pkg) => ({
              name: pkg.name as string,
              price: Number.parseFloat(String(pkg.price)),
              productId: newProduct.id
            }))
          });
        }
      }

      // 3. Return the product with packages
      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          packages: true
        },
      });
    });

    revalidateTag('products');

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 
