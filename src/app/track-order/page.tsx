"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import RootLayout from "@/components/layout/RootLayout";
import {
  trackMetaPixelCustomEvent,
  trackMetaPixelEvent,
  sendEventToCapi,
  generateEventId,
} from "@/lib/meta-pixel";

interface OrderTrackData {
  id: string;
  status: string;
  customerName: string;
  courierTrackingCode?: string | null;
  courierStatus?: string | null;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "অপেক্ষমান", color: "text-yellow-600" },
  PROCESSING: { label: "প্রসেসিং হচ্ছে", color: "text-blue-600" },
  SHIPPED: { label: "পাঠানো হয়েছে", color: "text-purple-600" },
  DELIVERED: { label: "ডেলিভারি সম্পন্ন", color: "text-green-600" },
  CANCELLED: { label: "বাতিল করা হয়েছে", color: "text-red-600" },
};

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [orderData, setOrderData] = useState<OrderTrackData | null>(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrderData(null);
    setNotFound(false);
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setError("Please enter an Order ID, Tracking Code, or Phone Number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/track?query=${encodeURIComponent(normalizedQuery)}`);
      const searchPayload = {
        order_lookup: true,
        result: res.ok ? "found" : res.status === 404 ? "not_found" : "error",
      };

      const eventId = generateEventId();
      trackMetaPixelEvent("Search", searchPayload, eventId);
      sendEventToCapi("Search", searchPayload, eventId);

      const customEventId = generateEventId();
      trackMetaPixelCustomEvent("TrackOrderSearch", searchPayload, customEventId);
      sendEventToCapi("TrackOrderSearch", searchPayload, customEventId);

      if (res.status === 404) {
        setNotFound(true);
        setOrderData(null);
      } else if (!res.ok) {
        setError("Something went wrong. Please try again.");
      } else {
        const data = await res.json();
        setOrderData(data);
      }
    } catch (err) {
      setError("Failed to fetch order status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootLayout>
      <div className="bg-gray-50 py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <h1 className="mb-6 text-2xl font-bold text-center">
                অর্ডার ট্র্যাক
              </h1>
              
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col gap-4">
                  <Input
                    type="text"
                    placeholder="অর্ডার আইডি, ইনভয়েস, ট্র্যাকিং কোড বা ফোন নম্বর"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 md:h-12 md:text-base"
                  />
                  <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={loading}>
                    {loading ? "Loading..." : "Track"}
                  </Button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </form>

              {notFound && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-center">
                  <p className="text-red-700 font-medium">কোনো অর্ডার পাওয়া যায়নি</p>
                  <p className="text-sm text-red-600 mt-1">অনুগ্রহ করে সঠিক অর্ডার আইডি বা ফোন নম্বর দিন</p>
                </div>
              )}

              {orderData && !notFound && (
                <div className="rounded-lg bg-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-semibold text-lg">অর্ডারের তথ্য</h2>
                      <p className="text-sm text-gray-500">ID: {orderData.id}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${statusMap[orderData.status]?.color || "text-gray-700"}`}>
                        {statusMap[orderData.status]?.label || orderData.status}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(orderData.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">আইটেমসমূহ:</p>
                    <ul className="space-y-1">
                      {orderData.items.map((item, idx) => (
                        <li key={idx} className="text-sm flex justify-between">
                          <span>{item.productName}</span>
                          <span className="text-gray-500">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {orderData.courierTrackingCode && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-sm font-medium text-gray-600">কুরিয়ার ট্র্যাকিং:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">কোড:</span>
                        <code className="bg-white px-2 py-0.5 rounded border text-sm font-mono">{orderData.courierTrackingCode}</code>
                      </div>
                      {orderData.courierStatus && (
                        <p className="text-sm mt-1">
                          অবস্থা: <span className="font-semibold">{orderData.courierStatus}</span>
                        </p>
                      )}
                    </div>
                  )}
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
