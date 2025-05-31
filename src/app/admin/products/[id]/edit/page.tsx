"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
          <label className="block mb-2">Image URL</label>
          <Input required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
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
  );
} 