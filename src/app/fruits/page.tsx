// For static site generation
export const dynamic = 'force-static';

import Image from "next/image";
import Link from "next/link";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FruitsPage() {
  const products = [
    {
      id: 1,
      name: "Katimon (2 KG Crate)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 1199,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
      category: "Katimon",
    },
    {
      id: 2,
      name: "Katimon (5 KG Crate)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 2299,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
      category: "Katimon",
    },
    {
      id: 3,
      name: "Katimon (10 KG Crate)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 4499,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
      category: "Katimon",
    },
    {
      id: 4,
      name: "Katimon (20 KG Crate)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 9000,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
      category: "Katimon",
    },
    // More products
    {
      id: 5,
      name: "Watermelon (1 Pcs)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 350,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
      category: "Watermelon",
    },
    {
      id: 6,
      name: "Mango (1 KG)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 250,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
      category: "Mango",
    },
    {
      id: 7,
      name: "Dragon Fruit (500g)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 320,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
      category: "Dragon Fruit",
    },
    {
      id: 8,
      name: "Premium Banana (1 Dozen)",
      description: "Home Delivery (Dhaka, Gazipur)",
      price: 180,
      image: "https://ext.same-assets.com/377203966/610671350.webp",
      category: "Banana",
    },
  ];

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  return (
    <RootLayout>
      <div className="bg-gray-50 py-8">
        <div className="container">
          <h1 className="mb-8 text-3xl font-bold">All Fruits</h1>

          {/* Category filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            <Button variant="outline" className="bg-white">
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className="bg-white"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="font-medium text-green-700">৳ {product.price}</p>
                    <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
                      <Link href={`/product/${product.id}`}>
                        Add to cart
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
