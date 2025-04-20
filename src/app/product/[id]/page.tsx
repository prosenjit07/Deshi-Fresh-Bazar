// For static site generation
export const dynamic = 'force-static';

import Image from "next/image";
import Link from "next/link";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductClient from "./ProductClient";

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
