import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/admin" className="hover:underline">Dashboard</Link>
          <Link href="/admin/products" className="hover:underline">Products</Link>
          <Link href="/admin/orders" className="hover:underline">Orders</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
} 