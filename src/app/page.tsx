import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import RootLayout from "@/components/layout/RootLayout";
import { prisma } from "@/lib/prisma";
import HomePageClient from "./HomePageClient";

export const revalidate = 300;

const getFeaturedProducts = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      take: 8,
      orderBy: {
        sequence: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        stock: true,
        sequence: true,
        category: {
          select: {
            name: true,
          },
        },
        packages: {
          select: {
            id: true,
            name: true,
            price: true,
          },
          orderBy: {
            price: "asc",
          },
        },
      },
    });

    return products.map((product) => ({
      ...product,
      details: "",
      category: product.category.name,
    }));
  },
  ["homepage-featured-products"],
  { revalidate },
);

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <RootLayout>
      <Suspense fallback={null}>
        <HomePageClient featuredProducts={featuredProducts} />
      </Suspense>
    </RootLayout>
  );
}
