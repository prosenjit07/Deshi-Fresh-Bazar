// For static site generation
export const dynamic = 'force-static';
import Image from "next/image";
import Link from "next/link";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductClient from "./ProductClient";
import p1 from "@/assets/images/gopalvog.jpg";
import p2 from "@/assets/images/gobindovog-mango.jpg";
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
  packages: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}
// Mock products data
const products: Product[] = [
  {
    id: "cmb3fmy6900024clh02oxg059",
    name: "হিমসাগর আম (বিষমুক্ত) – প্রতি কেজি ১৬০ টাকা",
    description: "মিষ্টি স্বাদ ও রসালো গঠনের জন্য জনপ্রিয় এই আম সাতক্ষীরা ও রাজশাহী অঞ্চল থেকে সংগ্রহ করা হয়। প্রতি কেজিতে গড়ে ৪-৫টি মাঝারি আকৃতির আম থাকে। আমরা পরিপক্ক কাঁচা আম সরবরাহ করি, যা ঘরের উষ্ণ স্থানে রেখে প্রাকৃতিকভাবে পাকিয়ে খেতে হয়। কাঁচা অবস্থায় খেলে কিছুটা টক লাগতে পারে। ডেলিভারির জন্য আমরা স্টেডফাস্ট কুরিয়ার সার্ভিস ব্যবহার করি, যা দেশের যেকোনো জায়গায় (উপজেলাসহ) পৌঁছে দেয়। এখনই প্রি-বুক করুন এবং ঘরে বসে উপভোগ করুন মৌসুমি হিমসাগরের স্বাদ!",
    details: [
      "ওজন: ১২ অথবা ২২ kg",
      "উৎপত্তি: উত্তরবঙ্গ, বাংলাদেশ",
      "জাত: প্রিমিয়াম হিমসাগর",
      "সংরক্ষণ: ঠাণ্ডা ও শুকনো জায়গায় রাখুন",
      "মেয়াদ: স্বাভাবিক তাপমাত্রায় ৭-১০ দিন"
    ],
    price: 1199,
    images: [
      p1.src,
      p1.src,
      p1.src
      // "https://ext.same-assets.com/377203966/610671350.webp"
    ],
    category: "Katimon",
    inStock: true,
    related: ["2", "3", "4"],
    packages: [
      { id: '10kg', name: '10 kg', price: 1199 },
      { id: '20kg', name: '20 kg', price: 2158 }
    ]
  },
  {
    id: "cmb3fmz1200084clhjprreg26",
    name: "ল্যাংড়া আম (বিষমুক্ত) – প্রতি কেজি ১৬০ টাকা",
    description: "ল্যাংড়া আমের স্বাদ ও সুগন্ধের জন্য এটি বাংলাদেশের অন্যতম জনপ্রিয় আম। রাজশাহী অঞ্চলের বিশেষ যত্নে চাষ করা এই আম প্রাকৃতিক পদ্ধতিতে পাকানো হয়। আমাদের নিজস্ব বাগান থেকে সংগ্রহ করা এই আম সম্পূর্ণ বিষমুক্ত ও স্বাস্থ্যসম্মত।",
    details: [
      "ওজন: ১২ অথবা ২২ kg",
      "উৎপত্তি: উত্তরবঙ্গ, বাংলাদেশ",
      "জাত: প্রিমিয়াম হিমসাগর",
      "সংরক্ষণ: ঠাণ্ডা ও শুকনো জায়গায় রাখুন",
      "মেয়াদ: স্বাভাবিক তাপমাত্রায় ৭-১০ দিন"
    ],
    price: 2299,
    images: [
      p2.src,
      p2.src,
      p2.src
    ],
    category: "Katimon",
    inStock: true,
    related: ["1", "3", "4"],
    packages: [
      { id: '10kg', name: '10 kg', price: 2299 },
      { id: '20kg', name: '20 kg', price: 4138 }
    ]
  },
  {
    id: "cmb3fmzvj000e4clh00expef1",
    name: "হাড়িভাঙ্গা আম (বিষমুক্ত) – প্রতি কেজি ১৫০ টাকা",
    description: "হাড়িভাঙ্গা আম বাংলাদেশের ঐতিহ্যবাহী জাতের আম। এর মিষ্টি স্বাদ ও সুগন্ধ এটিকে অনন্য করে তুলেছে। আমাদের নিজস্ব বাগান থেকে সরাসরি সংগ্রহ করা এই আম কীটনাশকমুক্ত ও প্রাকৃতিকভাবে পাকানো হয়।.",
    details: [
      "ওজন: ১২ অথবা ২২ kg",
      "উৎপত্তি: উত্তরবঙ্গ, বাংলাদেশ",
      "জাত: প্রিমিয়াম হিমসাগর",
      "সংরক্ষণ: ঠাণ্ডা ও শুকনো জায়গায় রাখুন",
      "মেয়াদ: স্বাভাবিক তাপমাত্রায় ৭-১০ দিন"
    ],
    price: 4499,
    images: [
      p1.src,
      p1.src,
      p1.src
    ],
    category: "Katimon",
    inStock: true,
    related: ["1", "2", "4"],
    packages: [
      { id: '10kg', name: '10 kg', price: 4499 },
      { id: '20kg', name: '20 kg', price: 8098 }
    ]
  },
  {
    id: "cmb3fn0or000k4clh5d00jye2",
    name: "Gopalvhog– প্রতি কেজি ১৬০ টাকা",
    description: "গোপালভোগ আম তার মিষ্টি স্বাদ ও সুবাসের জন্য বিখ্যাত। বাংলাদেশের উত্তরাঞ্চলের বিশেষ যত্নে চাষ করা এই আম প্রাকৃতিক পদ্ধতিতে পাকানো হয়। আমাদের নিজস্ব বাগান থেকে সংগ্রহ করা এই আম সম্পূর্ণ বিষমুক্ত।",
    details: [
      "ওজন: ১২ অথবা ২২ kg",
      "উৎপত্তি: উত্তরবঙ্গ, বাংলাদেশ",
      "জাত: প্রিমিয়াম হিমসাগর",
      "সংরক্ষণ: ঠাণ্ডা ও শুকনো জায়গায় রাখুন",
      "মেয়াদ: স্বাভাবিক তাপমাত্রায় ৭-১০ দিন"
    ],
    price: 9000,
    images: [
      p1.src,
      p1.src,
      p1.src
    ],
    category: "Katimon",
    inStock: true,
    related: ["1", "2", "3"],
    packages: [
      { id: '10kg', name: '10 kg', price: 9000 },
      { id: '20kg', name: '20 kg', price: 16200 }
    ]
  },
  // {
  //   id: "5",
  //   name: "Watermelon (1 Pcs)",
  //   description: "Fresh watermelon directly from our gardens. Sweet, juicy, and perfect for a refreshing treat.",
  //   details: [
  //     "Weight: 3-4 KG approx",
  //     "Origin: Rajshahi, Bangladesh",
  //     "Cultivar: Premium Watermelon",
  //     "Storage: Keep in cool, dry place",
  //     "Shelf Life: 5-7 days at room temperature"
  //   ],
  //   price: 350,
  //   images: [
  //     "https://ext.same-assets.com/377203966/610671350.webp",
  //     "https://ext.same-assets.com/377203966/610671350.webp",
  //   ],
  //   category: "Watermelon",
  //   inStock: true,
  //   related: ["6", "7", "8"]
  // },
  // {
  //   id: "6",
  //   name: "Mango (1 KG)",
  //   description: "Sweet and juicy mangoes directly from our gardens. Perfect ripeness and amazing flavor.",
  //   details: [
  //     "Weight: 1 KG approx",
  //     "Origin: Rajshahi, Bangladesh",
  //     "Cultivar: Premium Mango",
  //     "Storage: Keep in cool, dry place",
  //     "Shelf Life: 5-7 days at room temperature"
  //   ],
  //   price: 250,
  //   images: [
  //     "https://ext.same-assets.com/377203966/610671350.webp",
  //   ],
  //   category: "Mango",
  //   inStock: true,
  //   related: ["5", "7", "8"]
  // },
  // {
  //   id: "7",
  //   name: "Dragon Fruit (500g)",
  //   description: "Exotic dragon fruit with beautiful color and delicious taste.",
  //   details: [
  //     "Weight: 500g approx",
  //     "Origin: Exotic Garden, Bangladesh",
  //     "Cultivar: Red Dragon Fruit",
  //     "Storage: Keep in refrigerator",
  //     "Shelf Life: 5-7 days"
  //   ],
  //   price: 320,
  //   images: [
  //     "https://ext.same-assets.com/377203966/610671350.webp",
  //   ],
  //   category: "Dragon Fruit",
  //   inStock: true,
  //   related: ["5", "6", "8"]
  // },
  // {
  //   id: "8",
  //   name: "Premium Banana (1 Dozen)",
  //   description: "Fresh, ripe bananas directly from our gardens. Perfect for daily consumption.",
  //   details: [
  //     "Quantity: 12 pieces approx",
  //     "Origin: Bangladesh",
  //     "Cultivar: Premium Banana",
  //     "Storage: Room temperature",
  //     "Shelf Life: 5-7 days"
  //   ],
  //   price: 180,
  //   images: [
  //     "https://ext.same-assets.com/377203966/610671350.webp",
  //   ],
  //   category: "Banana",
  //   inStock: true,
  //   related: ["5", "6", "7"]
  // },
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
