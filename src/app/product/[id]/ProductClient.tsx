"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from '@/contexts/CartContext';
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Package {
  id: string;
  name: string;
  price: number;
  productId: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  packages: Package[];
}

interface ProductClientProps {
  product: Product | undefined;
  products: Product[];
}

export default function ProductClient({ product, products }: ProductClientProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

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

  // Define default packages if not provided
  const defaultPackages: Package[] = [
    { id: '10kg', name: '10 kg', price: product.price, productId: product.id },
    { id: '20kg', name: '20 kg', price: product.price * 1.8, productId: product.id }
  ];

  const packages = product.packages.length > 0 ? product.packages : defaultPackages;
  const [selectedPackage, setSelectedPackage] = useState(packages[0]);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    addItem(product, quantity, selectedPackage.id);
    toast.success("Added to cart successfully");
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }
    addItem(product, quantity, selectedPackage.id);
    toast.success("Added to cart successfully");
    router.push("/cart");
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/fruits" className="hover:text-foreground">Fruits</Link>
          <span>/</span>
          <Link href={`/fruits/${product.category.slug}`} className="hover:text-foreground">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product details */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Product image */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg bg-white">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="h-[450px] w-full object-cover"
              />
            </div>
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-green-700">৳{product.price}</p>
            <div className="mt-6">
              <h3 className="text-lg font-medium">Description</h3>
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <span>Package:</span>
                <div className="flex gap-2">
                  {packages.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedPackage.id === pkg.id
                          ? 'bg-green-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pkg.name} - ৳{pkg.price}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 rounded-l-md rounded-r-none"
                  disabled={quantity <= 1}
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
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="w-full bg-green-700 hover:bg-green-800 sm:w-auto"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-green-700 text-green-700 hover:bg-green-700 hover:text-white sm:w-auto"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </Button>
              </div>
              {product.stock <= 0 && (
                <p className="text-sm text-red-500">This product is currently out of stock</p>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {products.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((relProduct: Product) => (
                <Card key={relProduct.id} className="overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={relProduct.image}
                      alt={relProduct.name}
                      width={400}
                      height={300}
                      className="h-[300px] w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/product/${relProduct.id}`} className="hover:underline">
                      <h3 className="font-semibold">{relProduct.name}</h3>
                    </Link>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="font-medium text-green-700">৳{relProduct.price}</p>
                      <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
                        <Link href={`/product/${relProduct.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}