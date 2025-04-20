"use client";

// For static site generation
export const dynamic = 'force-static';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

// Mock cart data
const cartItems = [
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

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("SSLCommerz");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Bangladesh",
    },
  });

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 5000 ? 0 : 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    console.log("Order placed with:", { ...data, paymentMethod, items: cartItems });

    // Simulate payment process and order placement
    setTimeout(() => {
      setLoading(false);
      router.push("/checkout/success");
    }, 1500);
  };

  return (
    <RootLayout>
      <div className="bg-gray-50 py-8">
        <div className="container">
          <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" required {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+880 1XXXXXXXXX"
                                    required
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="House #123, Road #10"
                                      required
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Dhaka"
                                    required
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="1207"
                                    required
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Bangladesh"
                                    disabled
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="sslcommerz"
                              name="paymentMethod"
                              value="SSLCommerz"
                              checked={paymentMethod === "SSLCommerz"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="h-4 w-4 text-green-700"
                            />
                            <Label htmlFor="sslcommerz" className="flex cursor-pointer items-center gap-2">
                              <Image
                                src="https://ext.same-assets.com/377203966/3964408185.gif"
                                alt="SSLCommerz"
                                width={120}
                                height={40}
                                className="h-6 w-auto"
                              />
                              <span>Pay with SSLCommerz</span>
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="cashOnDelivery"
                              name="paymentMethod"
                              value="CashOnDelivery"
                              checked={paymentMethod === "CashOnDelivery"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="h-4 w-4 text-green-700"
                            />
                            <Label htmlFor="cashOnDelivery" className="cursor-pointer">
                              Cash on Delivery
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="bKash"
                              name="paymentMethod"
                              value="bKash"
                              checked={paymentMethod === "bKash"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="h-4 w-4 text-green-700"
                            />
                            <Label htmlFor="bKash" className="cursor-pointer">
                              bKash
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="nagad"
                              name="paymentMethod"
                              value="Nagad"
                              checked={paymentMethod === "Nagad"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="h-4 w-4 text-green-700"
                            />
                            <Label htmlFor="nagad" className="cursor-pointer">
                              Nagad
                            </Label>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-700 hover:bg-green-800"
                        disabled={loading}
                      >
                        {loading ? "Processing Payment..." : "Place Order"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-xs text-white">
                            {item.quantity}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">৳ {item.price} × {item.quantity}</div>
                        </div>
                        <div className="ml-auto font-medium">
                          ৳ {item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
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
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>৳ {calculateTotal()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 text-center">
                <Link
                  href="/cart"
                  className="text-sm text-muted-foreground hover:text-green-700"
                >
                  Return to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
