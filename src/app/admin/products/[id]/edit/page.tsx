"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaBoxOpen, FaShoppingCart, FaUsers, FaChartBar } from 'react-icons/fa';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    stock: "0",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to fetch product");
        }
        const data = await res.json();
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          image: data.image || "",
          categoryId: data.categoryId || "",
          stock: data.stock?.toString() || "0",
        });
        setImagePreview(data.image || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
    setError("");
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
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <>
      {/* Mobile Edit Product */}
      <div className="block md:hidden bg-[#fcfdff] min-h-screen pb-24">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-2">Edit Product</h1>
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">{error}</div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-8">Loading...</div>
          ) : (
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
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
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
      {/* Desktop Edit Product (unchanged) */}
      <div className="hidden md:block">
        <div className="max-w-2xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">Name</label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2">Slug</label>
              <Input required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2">Description</label>
              <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2">Price</label>
              <Input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
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
              <Input required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2">Stock</label>
              <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </form>
        </div>
      </div>
    </>
  );
} 