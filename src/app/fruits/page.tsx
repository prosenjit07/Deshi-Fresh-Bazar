import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import RootLayout from "@/components/layout/RootLayout";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/lib/product-status";
import FruitsPageClient from "./FruitsPageClient";

export const revalidate = 300;

const getFruitProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
      },
      orderBy: {
        sequence: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
  },
  ["fruits-page-products"],
  { revalidate, tags: ["products"] },
);

export default async function FruitsPage() {
  const products = await getFruitProducts();

  return (
    <RootLayout>
      <Suspense fallback={null}>
        <FruitsPageClient products={products} />
      </Suspense>
    </RootLayout>
  );
}
