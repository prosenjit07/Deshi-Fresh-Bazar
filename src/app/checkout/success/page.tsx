// For static site generation
export const dynamic = 'force-static';

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import RootLayout from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function CheckoutSuccessPage() {
  const orderId = `PF-${Math.floor(10000 + Math.random() * 90000)}`;
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <RootLayout>
      <div className="bg-gray-50 py-12">
        <div className="container max-w-2xl">
          <Card className="overflow-hidden">
            <div className="bg-green-700 p-6 text-center text-white">
              <CheckCircle className="mx-auto mb-4 h-16 w-16" />
              <h1 className="text-3xl font-bold">Order Confirmed!</h1>
              <p className="mt-2 text-green-100">
                Thank you for your purchase
              </p>
            </div>
            <CardContent className="p-6">
              <div className="mb-6 text-center">
                <p className="text-muted-foreground">
                  We&apos;ve received your order and will contact you as soon as
                  your package is shipped. You can find your purchase
                  information below.
                </p>
              </div>

              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Order Number
                    </p>
                    <p className="font-medium">{orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Date
                    </p>
                    <p className="font-medium">{orderDate}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="font-medium">your@email.com</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order Status
                  </p>
                  <p className="text-green-600 font-medium">Processing</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="mb-4 text-lg font-semibold">
                  Delivery Information
                </h2>
                <p className="mb-1">John Doe</p>
                <p className="mb-1">House #123, Road #10</p>
                <p className="mb-1">Dhaka, 1207</p>
                <p className="mb-1">Bangladesh</p>
                <p>Phone: +880 1XXXXXXXXX</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-6">
              <Button
                asChild
                className="w-full bg-green-700 hover:bg-green-800"
              >
                <Link href="/track-order">Track Your Order</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </RootLayout>
  );
}
