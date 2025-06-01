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
}

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
  packages: Package[];
}

interface ProductClientProps {
  product: Product | undefined;
  products: Product[];
}

export default function ProductClient({ product, products }: ProductClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const router = useRouter();
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

  // Define default packages if not provided
  const defaultPackages: Package[] = [
    { id: '10kg', name: '10 kg', price: product.price },
    { id: '20kg', name: '20 kg', price: product.price * 1.8 }
  ];

  const packages = product.packages || defaultPackages;
  const [selectedPackage, setSelectedPackage] = useState(packages[0]);

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    addItem(product, quantity, selectedPackage.id);
    toast.success("Added to cart successfully");
  };

  const handleBuyNow = () => {
    if (!product.inStock) {
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
                width={500}
                height={500}
                className="h-[450px] w-full object-cover"
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
            <p className="mt-2 text-2xl font-semibold text-green-700">৳{product.price}</p>
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
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="w-full bg-green-700 hover:bg-green-800 sm:w-auto"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-green-700 text-green-700 hover:bg-green-700 hover:text-white sm:w-auto"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  Buy Now
                </Button>
              </div>
              {!product.inStock && (
                <p className="text-sm text-red-500">This product is currently out of stock</p>
              )}
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
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}