import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      <main className="flex-1 ml-64 bg-[#f9fafb] min-h-screen p-8 overflow-x-auto">
        {children}
      </main>
    </div>
  );
} 