"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type FruitListProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: {
    name: string;
  };
};

export default function FruitsPageClient({
  products,
}: {
  products: FruitListProduct[];
}) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category.name))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.description, product.category.name].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [products, searchQuery]);

  useEffect(() => {
    const shouldFocusSearch = searchParams.get("focus") === "search";
    if (shouldFocusSearch) {
      searchInputRef.current?.focus();
    }
  }, [searchParams]);

  return (
    <div className="bg-gray-50 py-8">
      <div className="container">
        <h1 className="mb-8 text-3xl font-bold">All Fruits</h1>

        <div className="mb-6 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search fruits..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Clear search"
              >
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button variant="outline" className="bg-white">
            All
          </Button>
          {categories.map((category) => (
            <Button key={category} variant="outline" className="bg-white">
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-2 sm:p-3">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{product.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                  {product.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-medium text-green-700 text-sm sm:text-base">৳ {product.price}</p>
                  <Button
                    asChild
                    size="sm"
                    className="bg-green-700 hover:bg-green-800"
                  >
                    <Link href={`/product/${product.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800">কোনো ফলাফল পাওয়া যায়নি</h2>
            <p className="mt-2 text-sm text-gray-500">
           অন্য কোনো নাম বা ক্যাটাগরি দিয়ে অনুসন্ধান করার চেষ্টা করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
