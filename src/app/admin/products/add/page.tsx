'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { FaBoxOpen, FaShoppingCart, FaUsers, FaChartBar } from 'react-icons/fa';

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    stock: '0'
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        setError("Image file size must be less than 2MB");
        setImageFile(null);
        setImagePreview("");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let imageUrl = formData.image;

    try {
      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataImg,
        });
        if (!uploadRes.ok) {
          throw new Error("Image upload failed");
        }
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Add Product */}
      <div className="block md:hidden bg-[#fcfdff] min-h-screen pb-24">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-2">Add Product</h1>
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl shadow p-4">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Slug</label>
              <Input required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Price</label>
              <Input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Product Image (max 2MB)</label>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mb-2 h-24 w-24 object-cover rounded-lg" />
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block mb-2"
              />
              <div className="text-xs text-gray-500 mb-1">Or paste an image URL below</div>
              <Input
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="Image URL"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Category ID</label>
              <Input required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Stock</label>
              <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="rounded-lg" />
            </div>
            <Button type="submit" className="w-full rounded-lg" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </form>
        </div>
        {/* Bottom Nav Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-50 md:hidden">
          <button onClick={() => router.push('/admin')} className="flex flex-col items-center text-gray-500">
            <FaChartBar className="text-xl" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button onClick={() => router.push('/admin/products')} className="flex flex-col items-center text-blue-600">
            <FaBoxOpen className="text-xl" />
            <span className="text-xs mt-1">Products</span>
          </button>
          <button onClick={() => router.push('/admin/orders')} className="flex flex-col items-center text-gray-500">
            <FaShoppingCart className="text-xl" />
            <span className="text-xs mt-1">Orders</span>
          </button>
          <button onClick={() => router.push('/admin/users')} className="flex flex-col items-center text-gray-500">
            <FaUsers className="text-xl" />
            <span className="text-xs mt-1">Users</span>
          </button>
        </nav>
      </div>
      {/* Desktop Add Product (unchanged) */}
      <div className="hidden md:block">
        <div className="max-w-2xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">Slug</label>
              <Input
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">Description</label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">Price</label>
              <Input
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">Product Image (max 2MB)</label>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mb-2 h-24 w-24 object-cover rounded" />
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block"
              />
              <div className="text-xs text-gray-500 mt-1">Or paste an image URL below</div>
              <Input
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="Image URL"
                className="mt-1"
              />
            </div>

            <div>
              <label className="block mb-2">Category ID</label>
              <Input
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">Stock</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}