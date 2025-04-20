"use client";

// For static site generation
export const dynamic = 'force-static';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Mock cart data
const initialCartItems = [
  {
    id: "1",
    name: "Katimon (2 KG Crate)",
    price: 1199,
    quantity: 1,
    image: "https://ext.same-assets.com/377203966/610671350.webp",
  },
  {
    id: "5",
    name: "Watermelon (1 Pcs)",
    price: 350,
    quantity: 2,
    image: "https://ext.same-assets.com/377203966/610671350.webp",
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;

    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    // Simple shipping calculation
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 5000 ? 0 : 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  return (
    <RootLayout>
      <div className="bg-gray-50 py-8">
        <div className="container">
          <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center">
              <p className="mb-4 text-lg">Your cart is empty</p>
              <Button asChild className="bg-green-700 hover:bg-green-800">
                <Link href="/fruits">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-lg bg-white">
                  <div className="p-6">
                    <h2 className="mb-4 text-xl font-semibold">Cart Items</h2>
                    <div className="divide-y">
                      {cartItems.map((item) => (
                        <div key={item.id} className="py-4 flex flex-wrap items-center gap-4">
                          <div className="w-16 h-16 overflow-hidden rounded">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-grow min-w-[150px]">
                            <Link
                              href={`/product/${item.id}`}
                              className="font-medium hover:text-green-700"
                            >
                              {item.name}
                            </Link>
                            <div className="text-sm text-muted-foreground">
                              ৳ {item.price} x {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 rounded-l-md rounded-r-none"
                              >
                                -
                              </Button>
                              <div className="flex h-8 w-12 items-center justify-center border border-x-0 border-input">
                                {item.quantity}
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 rounded-l-none rounded-r-md"
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 text-red-500"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="font-semibold ml-auto">
                            ৳ {item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>৳ {calculateSubtotal()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>
                          {calculateShipping() === 0
                            ? "Free"
                            : `৳ ${calculateShipping()}`}
                        </span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>৳ {calculateTotal()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-green-700 hover:bg-green-800">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                  </CardFooter>
                </Card>
                <div className="mt-4 text-center">
                  <Link
                    href="/fruits"
                    className="text-sm text-muted-foreground hover:text-green-700"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
