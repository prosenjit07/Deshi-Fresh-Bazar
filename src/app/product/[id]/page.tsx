// For static site generation
export const dynamic = 'force-static';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Define product type
interface Product {
  id: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  related: string[];
}

// Mock products data
const products: Product[] = [
  {
    id: "1",
    name: "Katimon (2 KG Crate)",
    description: "Premium Katimon fruits directly from our contracted gardens. Fresh, juicy, and selected for their premium quality. Our fruits are grown without harmful chemicals and harvested at the perfect ripeness to ensure maximum flavor and nutrition.",
    details: [
      "Weight: 2 KG approx",
      "Origin: North Bengal, Bangladesh",
      "Cultivar: Premium Katimon",
      "Storage: Keep in cool, dry place",
      "Shelf Life: 7-10 days at room temperature"
    ],
    price: 1199,
    images: [
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp"
    ],
    category: "Katimon",
    inStock: true,
    related: ["2", "3", "4"]
  },
  {
    id: "2",
    name: "Katimon (5 KG Crate)",
    description: "Premium Katimon fruits directly from our contracted gardens. Fresh, juicy, and selected for their premium quality. Our fruits are grown without harmful chemicals and harvested at the perfect ripeness to ensure maximum flavor and nutrition.",
    details: [
      "Weight: 5 KG approx",
      "Origin: North Bengal, Bangladesh",
      "Cultivar: Premium Katimon",
      "Storage: Keep in cool, dry place",
      "Shelf Life: 7-10 days at room temperature"
    ],
    price: 2299,
    images: [
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp"
    ],
    category: "Katimon",
    inStock: true,
    related: ["1", "3", "4"]
  },
  {
    id: "3",
    name: "Katimon (10 KG Crate)",
    description: "Premium Katimon fruits directly from our contracted gardens. Fresh, juicy, and selected for their premium quality. Our fruits are grown without harmful chemicals and harvested at the perfect ripeness to ensure maximum flavor and nutrition.",
    details: [
      "Weight: 10 KG approx",
      "Origin: North Bengal, Bangladesh",
      "Cultivar: Premium Katimon",
      "Storage: Keep in cool, dry place",
      "Shelf Life: 7-10 days at room temperature"
    ],
    price: 4499,
    images: [
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp"
    ],
    category: "Katimon",
    inStock: true,
    related: ["1", "2", "4"]
  },
  {
    id: "4",
    name: "Katimon (20 KG Crate)",
    description: "Premium Katimon fruits directly from our contracted gardens. Fresh, juicy, and selected for their premium quality. Our fruits are grown without harmful chemicals and harvested at the perfect ripeness to ensure maximum flavor and nutrition.",
    details: [
      "Weight: 20 KG approx",
      "Origin: North Bengal, Bangladesh",
      "Cultivar: Premium Katimon",
      "Storage: Keep in cool, dry place",
      "Shelf Life: 7-10 days at room temperature"
    ],
    price: 9000,
    images: [
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp"
    ],
    category: "Katimon",
    inStock: true,
    related: ["1", "2", "3"]
  },
  {
    id: "5",
    name: "Watermelon (1 Pcs)",
    description: "Fresh watermelon directly from our gardens. Sweet, juicy, and perfect for a refreshing treat.",
    details: [
      "Weight: 3-4 KG approx",
      "Origin: Rajshahi, Bangladesh",
      "Cultivar: Premium Watermelon",
      "Storage: Keep in cool, dry place",
      "Shelf Life: 5-7 days at room temperature"
    ],
    price: 350,
    images: [
      "https://ext.same-assets.com/377203966/610671350.webp",
      "https://ext.same-assets.com/377203966/610671350.webp",
    ],
    category: "Watermelon",
    inStock: true,
    related: ["6", "7", "8"]
  },
  {
    id: "6",
    name: "Mango (1 KG)",
    description: "Sweet and juicy mangoes directly from our gardens. Perfect ripeness and amazing flavor.",
    details: [
      "Weight: 1 KG approx",
      "Origin: Rajshahi, Bangladesh",
      "Cultivar: Premium Mango",
      "Storage: Keep in cool, dry place",
      "Shelf Life: 5-7 days at room temperature"
    ],
    price: 250,
    images: [
      "https://ext.same-assets.com/377203966/610671350.webp",
    ],
    category: "Mango",
    inStock: true,
    related: ["5", "7", "8"]
  },
  {
    id: "7",
    name: "Dragon Fruit (500g)",
    description: "Exotic dragon fruit with beautiful color and delicious taste.",
    details: [
      "Weight: 500g approx",
      "Origin: Exotic Garden, Bangladesh",
      "Cultivar: Red Dragon Fruit",
      "Storage: Keep in refrigerator",
      "Shelf Life: 5-7 days"
    ],
    price: 320,
    images: [
      "https://ext.same-assets.com/377203966/610671350.webp",
    ],
    category: "Dragon Fruit",
    inStock: true,
    related: ["5", "6", "8"]
  },
  {
    id: "8",
    name: "Premium Banana (1 Dozen)",
    description: "Fresh, ripe bananas directly from our gardens. Perfect for daily consumption.",
    details: [
      "Quantity: 12 pieces approx",
      "Origin: Bangladesh",
      "Cultivar: Premium Banana",
      "Storage: Room temperature",
      "Shelf Life: 5-7 days"
    ],
    price: 180,
    images: [
      "https://ext.same-assets.com/377203966/610671350.webp",
    ],
    category: "Banana",
    inStock: true,
    related: ["5", "6", "7"]
  },
];

// Product data for static paths
export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

// ProductClient component with client-side logic
"use client";
import { useParams } from "next/navigation";

interface ProductClientProps {
  product: Product | undefined;
  products: Product[];
}

function ProductClient({ product, products }: ProductClientProps) {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Get related products
  const relatedProducts = product
    ? product.related.map((relId: string) => products.find((p: Product) => p.id === relId)).filter(Boolean)
    : [];

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-4">The product you are looking for does not exist.</p>
        <Button asChild className="mt-6 bg-green-700 hover:bg-green-800">
          <Link href="/fruits">Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/fruits" className="hover:text-foreground">Fruits</Link>
          <span>/</span>
          <Link href={`/fruits/${product.category.toLowerCase()}`} className="hover:text-foreground">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product details */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Product images */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg bg-white">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((image: string, index: number) => (
                <div
                  key={`image-${product.id}-${index}`}
                  className={`overflow-hidden rounded-md border-2 ${
                    selectedImage === index ? "border-green-500" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    width={100}
                    height={100}
                    className="h-16 w-16 cursor-pointer object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-green-700">৳ {product.price}</p>
            <div className="mt-6">
              <h3 className="text-lg font-medium">Description</h3>
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium">Details</h3>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {product.details.map((detail: string, index: number) => (
                  <li key={`detail-${product.id}-${index}`}>{detail}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <span>Quantity:</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-l-md rounded-r-none"
                  >
                    -
                  </Button>
                  <div className="flex h-8 w-12 items-center justify-center border border-x-0 border-input">
                    {quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-l-none rounded-r-md"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="w-full bg-green-700 hover:bg-green-800 sm:w-auto">
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full border-green-700 text-green-700 hover:bg-green-700 hover:text-white sm:w-auto">
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relProduct: Product | undefined) => (
                relProduct && (
                  <Card key={relProduct.id} className="overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={relProduct.images[0]}
                        alt={relProduct.name}
                        width={300}
                        height={300}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Link href={`/product/${relProduct.id}`} className="hover:underline">
                        <h3 className="font-semibold">{relProduct.name}</h3>
                      </Link>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="font-medium text-green-700">৳ {relProduct.price}</p>
                        <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
                          <Link href={`/product/${relProduct.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Server component (main export)
interface ProductPageParams {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductPageParams) {
  const product = products.find((p) => p.id === params.id);

  return (
    <RootLayout>
      <ProductClient product={product} products={products} />
    </RootLayout>
  );
}
