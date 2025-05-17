"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import RootLayout from "@/components/layout/RootLayout";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState<null | string>(null);
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      setError("Please enter an order ID");
      setOrderStatus(null);
      return;
    }

    // For demo purposes, always show processing status
    setOrderStatus("Processing");
    setError("");
  };

  return (
    <RootLayout>
      <div className="bg-gray-50 py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <h1 className="mb-6 text-2xl font-bold text-center">
                Track Your Order
              </h1>
              
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Enter your order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-green-700 hover:bg-green-800">
                    Track
                  </Button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </form>

              {orderStatus && (
                <div className="rounded-lg bg-gray-100 p-4">
                  <h2 className="mb-2 font-semibold">Order Status</h2>
                  <p className="text-green-700">{orderStatus}</p>
                </div>
              )}

              <div className="mt-6 text-center text-muted-foreground">
                <p className="text-sm">
                  অর্ডার সম্পর্কিত যেকোনো তথ্যের জন্য যোগাযোগ করুন: 01560-001192
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RootLayout>
  );
}