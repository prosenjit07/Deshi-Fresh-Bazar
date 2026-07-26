import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import type { Metadata, ResolvingMetadata } from 'next';
import RootLayout from "@/components/layout/RootLayout";
import ProductClient from "./ProductClient";
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@/lib/product-status';

export const revalidate = 300;

const getProduct = unstable_cache(
  async (id: string) => {
    try {
      const product = await prisma.product.findFirst({
        where: { id, status: ProductStatus.ACTIVE },
        select: {
          id: true,
          name: true,
          description: true,
          details: true,
          price: true,
          image: true,
          stock: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          packages: {
            select: {
              id: true,
              name: true,
              price: true,
              productId: true,
            },
            orderBy: {
              price: 'asc',
            },
          },
        }
      });
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },
  ['product-page-product'],
  { revalidate, tags: ['products'] }
);

const getRelatedProducts = unstable_cache(
  async (categoryId: string, currentProductId: string) => {
    try {
      const products = await prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          categoryId,
          NOT: {
            id: currentProductId
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 4,
        select: {
          id: true,
          name: true,
          description: true,
          details: true,
          price: true,
          image: true,
          stock: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          packages: {
            select: {
              id: true,
              name: true,
              price: true,
              productId: true,
            },
            orderBy: {
              price: 'asc',
            },
          },
        }
      });
      return products;
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  },
  ['product-page-related-products'],
  { revalidate, tags: ['products'] }
);

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Deshi Fresh Bazar`,
      description: product.description,
      url: `https://deshifreshbazar.com/product/${product.id}`,
      images: [
        {
          url: product.image.split(',')[0], // Take the first image if multiple
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    notFound();
  }

  // Ensure product.details is a string (convert null to empty string)
  const productWithStringDetails = {
    ...product,
    details: product.details || ''
  };

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);
  
  // Ensure all related products have string details
  const relatedProductsWithStringDetails = relatedProducts.map(p => ({
    ...p,
    details: p.details || ''
  }));

  return (
    <RootLayout>
      <ProductClient product={productWithStringDetails} products={relatedProductsWithStringDetails} />
    </RootLayout>
  );
}
