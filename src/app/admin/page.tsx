'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#101828] text-white z-20 flex flex-col">
        <div className="p-6 text-2xl font-bold">Admin Panel</div>
        <nav className="flex-1 flex flex-col gap-2 px-4">
          <a href="/admin" className="py-2 px-3 rounded hover:bg-[#1a2233]">Dashboard</a>
          <a href="/admin/products" className="py-2 px-3 rounded hover:bg-[#1a2233]">Products</a>
          <a href="/admin/orders" className="py-2 px-3 rounded hover:bg-[#1a2233]">Orders</a>
        </nav>
      </aside>
      <main className="flex-1  bg-[#f9fafb] min-h-screen p-8 overflow-x-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentOrders}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/products')}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              Manage Products
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              View Orders
            </button>
            <button
              onClick={() => router.push('/admin/products/add')}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              Add New Product
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
} 