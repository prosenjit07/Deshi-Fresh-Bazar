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
import { useCart } from '@/contexts/CartContext';
import {
  buildCheckoutPixelPayload,
} from "@/lib/meta-pixel";

interface OrderFormData {
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading] = useState(false);
  const { items, getCartTotal, getItemPrice, clearCart } = useCart();
  const [agreed, setAgreed] = useState(false);

  const form = useForm<OrderFormData>({
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
    return getCartTotal();
  };

  // const calculateShipping = () => {
  //   const subtotal = calculateSubtotal();
  //   if (subtotal === 0) return 0;
  //   return subtotal > 5000 ? 0 : 100;
  // };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      setLoading(true);

      const orderData = {
        ...data,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: getItemPrice(item),
          totalPrice: item.totalPrice,
          selectedPackage: item.selectedPackage,
        })),
        subtotal: calculateSubtotal(),
        // shipping: calculateShipping(),
        shipping: 0,
        total: calculateTotal(),
        paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const order = await response.json();

      const purchaseItems = order.items.map((item: {
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
      }) => ({
        id: item.productId,
        name: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
      }));

      const purchasePayload = buildCheckoutPixelPayload(
        purchaseItems,
        order.totalAmount ?? calculateTotal(),
        {
          order_id: order.id,
        },
      );

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          `meta_purchase_pending:${order.id}`,
          JSON.stringify(purchasePayload),
        );
      }
      
      clearCart();

      // Redirect to success page with order ID
      const queryParams = new URLSearchParams({
        orderId: order.id,
        fullName: data.fullName,
        email: data.email || "",
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
      }).toString();
      
      router.push(`/checkout/success?${queryParams}`);
    } catch (error: unknown) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootLayout>
      <div className="bg-gray-50 py-8">
        <div className="container">
          <h1 className="mb-8 text-3xl font-bold">চেকআউট</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <h2 className="mb-4 text-xl font-semibold">যোগাযোগের তথ্য</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>আপনার নাম <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="আপনার নাম লিখুন" required {...field} 
                                     onChange={e => {
                                      // Remove any digits from the input
                                      const value = e.target.value.replace(/\d+/g, '');
                                      field.onChange(value);
                                    }}
                                    value={field.value?.replace(/\d+/g, '') || ''}
                                  />
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
                                <FormLabel>ইমেইল</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="xxx@gmail.com"
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
                                <FormLabel>মোবাইল নম্বর <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    pattern="[0-9]{11}"
                                    maxLength={11}
                                    placeholder="01XXXXXXXXX"
                                    required
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, '');
                                      if (value.length <= 11) {
                                        field.onChange(value);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <h2 className="mb-4 text-xl font-semibold">ডেলিভারি ঠিকানা</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="বাসা নং, রাস্তা নং, এলাকার নাম"
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
                                <FormLabel>জেলা <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="ঢাকা"
                                    required
                                    maxLength={10}
                                    {...field}
                                    onChange={e => {
                                      // Remove any digits from the input
                                      const value = e.target.value.replace(/\d+/g, '');
                                      field.onChange(value);
                                    }}
                                    value={field.value?.replace(/\d+/g, '') || ''}
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
                                <FormLabel>উপজেলা/থানা <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="ধানমন্ডি"
                                    type="text"
                                    maxLength={10}
                                    required
                                    {...field}
                                    onChange={e => {
                                      // Remove any digits from the input
                                      const value = e.target.value.replace(/\d+/g, '');
                                      field.onChange(value);
                                    }}
                                    value={field.value?.replace(/\d+/g, '') || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                    
                        </div>
                      </div>

                      <div>
                        <h2 className="mb-4 text-xl font-semibold">পেমেন্ট পদ্ধতি</h2>
                        <div className="space-y-3">
                          <Label htmlFor="cashOnDelivery" className="cursor-pointer">
                            ক্যাশ অন ডেলিভারি (Cash on Delivery)
                          </Label>
                        </div>
                        {/* Agreement Checkbox Section */}
                        <div className="mt-6">
                          <div className="mb-4 rounded border border-gray-200 bg-gray-100 p-4 text-gray-700 text-sm">
                            আপনার ব্যক্তিগত ডেটা আপনার অর্ডার প্রসেস করার জন্য এবং এই ওয়েবসাইটে আপনার অভিজ্ঞতা উন্নত করার জন্য ব্যবহার করা হবে, যা আমাদের{' '}
                            <Link href="/privacy" className="text-green-700 font-semibold hover:underline" target="_blank">প্রাইভেসি পলিসি</Link>-তে বর্ণিত আছে।
                            (পেমেন্ট বা অর্ডার সংক্রান্ত যেকোনো সাহায্যের জন্য, অনুগ্রহ করে এখানে ইনবক্স করুন) <a href="https://wa.me/8801717171717" target="_blank" className="text-green-700 font-semibold hover:underline" rel="noreferrer">এখানে</a>
                          </div>
                          <div className="flex items-center mb-6">
                            <input
                              id="agreement"
                              type="checkbox"
                              checked={agreed}
                              onChange={() => setAgreed(!agreed)}
                              className="h-5 w-5 border-gray-300 rounded mr-3 focus:ring-green-700"
                              required
                            />
                            <label htmlFor="agreement" className="text-gray-800 select-none">
                              আমি ওয়েবসাইটের{' '}
                              <Link href="/terms" className="text-green-700 font-semibold hover:underline" target="_blank">শর্তাবলী</Link>,{' '}
                              <Link href="/privacy" className="text-green-700 font-semibold hover:underline" target="_blank">প্রাইভেসি পলিসি</Link> এবং{' '}
                              <Link href="/return-policy" className="text-green-700 font-semibold hover:underline" target="_blank">রিটার্ন পলিসি</Link>
                              পড়েছি এবং একমত পোষণ করছি
                              <span className="text-red-500 ml-1">*</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-700 hover:bg-green-800"
                        disabled={loading || !agreed}
                      >
                        {loading ? "অর্ডার প্রসেস হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">অর্ডারের সারসংক্ষেপ</h2>

                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.selectedPackage}`} className="flex items-center gap-3 py-3">
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
                          <div className="text-sm text-muted-foreground">৳ {getItemPrice(item)} × {item.quantity}</div>
                        </div>
                        <div className="ml-auto font-medium">
                          ৳ {item.totalPrice}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">সাবটোটাল</span>
                      <span>৳ {calculateSubtotal()}</span>
                    </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground ">ডেলিভারি চার্জ </span>
                        <span>৳০</span>
                      </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>সর্বমোট</span>
                      <span>৳ {calculateTotal()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-1 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-green-700 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:px-6 sm:py-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 17l-5-5m0 0l5-5m-5 5h12"
                    />
                  </svg>
                  কার্টে ফিরে যান
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
