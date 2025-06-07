export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import RootLayout from "@/components/layout/RootLayout";
import ProductClient from "./ProductClient";
import { prisma } from '@/lib/prisma';

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        packages: true,
        category: true
      }
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        NOT: {
          id: currentProductId
        }
      },
      take: 4,
      include: {
        packages: true,
        category: true
      }
    });
    return products;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  return (
    <RootLayout>
      <ProductClient product={product} products={relatedProducts} />
    </RootLayout>
  );
}
