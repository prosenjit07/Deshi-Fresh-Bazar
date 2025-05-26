'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import React from 'react';

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  packageType?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

const ORDER_STATUSES = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        search: search,
        status: statusFilter,
        sort: sortOrder,
      });
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [page, search, statusFilter, sortOrder]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h1 className="text-2xl font-bold text-center">Customer Orders List</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            type="search"
            placeholder="Search orders..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-w-[120px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={v => setSortOrder(v as 'desc' | 'asc')}>
            <SelectTrigger className="min-w-[120px]" />
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="mb-2 text-sm text-gray-500">Scroll horizontally to view all columns &rarr;</div>
        <table className="min-w-[1500px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Order ID</th>
              <th className="py-2 text-left">Customer Name</th>
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Phone</th>
              <th className="py-2 text-left">Shipping Address</th>
              <th className="py-2 text-left">Total Amount</th>
              <th className="py-2 text-left">Payment Method</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">Order Date</th>
              <th className="py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="border-b">
                  <td className="py-2">{order.id}</td>
                  <td className="py-2">{order.customerName}</td>
                  <td className="py-2">{order.customerEmail}</td>
                  <td className="py-2">{order.customerPhone}</td>
                  <td className="py-2">{order.shippingAddress}, {order.shippingCity}, {order.shippingPostalCode}, {order.shippingCountry}</td>
                  <td className="py-2">৳{order.totalAmount}</td>
                  <td className="py-2">{order.paymentMethod}</td>
                  <td className="py-2">
                    <div className="flex gap-2 items-center">
                      <Select
                        value={order.status}
                        onValueChange={v => handleStatusChange(order.id, v)}
                        disabled={order.status === 'CANCELLED'}
                      >
                        <SelectTrigger className="min-w-[120px]" />
                        <SelectContent>
                          {ORDER_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {order.status !== 'CANCELLED' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-2">
                    <Button size="sm" variant="outline" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                      {expandedOrderId === order.id ? 'Hide' : 'View'}
                    </Button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td colSpan={10} className="bg-gray-50">
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">Order Items</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr>
                                <th className="py-1 text-left">Product Image</th>
                                <th className="py-1 text-left">Product Name</th>
                                <th className="py-1 text-left">Package Type</th>
                                <th className="py-1 text-left">Unit Price</th>
                                <th className="py-1 text-left">Quantity</th>
                                <th className="py-1 text-left">Total Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-1">
                                    {item.productImage ? (
                                      <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                                    ) : (
                                      <span className="text-gray-400">No image</span>
                                    )}
                                  </td>
                                  <td className="py-1">{item.productName}</td>
                                  <td className="py-1">{item.packageType || '-'}</td>
                                  <td className="py-1">৳{item.unitPrice}</td>
                                  <td className="py-1">{item.quantity}</td>
                                  <td className="py-1">৳{item.totalPrice}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}