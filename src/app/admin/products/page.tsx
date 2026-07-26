'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaGripVertical } from 'react-icons/fa';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/toast';
import { DragDropContext, Droppable, Draggable, type DropResult, type DroppableProvided, type DraggableProvided } from '@hello-pangea/dnd';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  details?: string | null;
  price: number;
  image: string;
  categoryId: string;
  stock: number;
  sequence: number;
  status: ProductStatus;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
  packages: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
type ProductStatusFilter = ProductStatus | 'all' | 'default';

const PAGE_SIZE = 10;
const STATUS_FILTERS: Array<{ label: string; value: ProductStatusFilter }> = [
  { label: 'Active + Inactive', value: 'default' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
  { label: 'All', value: 'all' },
];

function AdminProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('default');
  const [actionProductId, setActionProductId] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (
      statusParam === 'ACTIVE' ||
      statusParam === 'INACTIVE' ||
      statusParam === 'ARCHIVED' ||
      statusParam === 'all'
    ) {
      setStatusFilter(statusParam);
      return;
    }

    setStatusFilter('default');
  }, [searchParams]);

  const fetchProducts = useCallback(async (pageNumber = 1, filterValue: ProductStatusFilter = statusFilter) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/products?page=${pageNumber}&status=${filterValue}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data.products)) {
        throw new Error('Invalid data format received');
      }
      
      // Keep the UI aligned with the persisted sequence order.
      const sortedProducts = [...data.products].sort((a, b) => a.sequence - b.sequence);
      setProducts(sortedProducts);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      const message = error instanceof Error ? error.message : 'Failed to load products';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchProducts(page, statusFilter);
  }, [fetchProducts, page, statusFilter]);

  const canReorder = statusFilter === 'ACTIVE' && products.every((product) => product.status === 'ACTIVE');

  const getStatusBadgeClasses = (status: ProductStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-amber-100 text-amber-700';
      case 'ARCHIVED':
        return 'bg-slate-200 text-slate-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusFilterChange = (value: ProductStatusFilter) => {
    setPage(1);
    setStatusFilter(value);
    const query = value === 'default' ? '' : `?status=${value}`;
    router.replace(`/admin/products${query}`);
  };

  const handleStatusChange = async (productId: string, status: ProductStatus) => {
    try {
      setActionProductId(productId);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product status');
      }

      toast.success(`Product ${status.toLowerCase()} successfully`);
      await fetchProducts(page, statusFilter);
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update product status');
    } finally {
      setActionProductId(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (
      !confirm(
        'Are you sure you want to permanently delete this archived product? Existing order history will be preserved.',
      )
    ) return;

    try {
      setActionProductId(productId);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
        toast.success(data.message || 'Product deleted successfully');
      } else {
        throw new Error(data.error || data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : 'Error deleting product');
    } finally {
      setActionProductId(null);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!canReorder) {
      toast.error('Only active products can be reordered.');
      return;
    }

    if (!result.destination || result.destination.index === result.source.index) return;

    const previousProducts = products;
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const pageOffset = (page - 1) * PAGE_SIZE;

    // Update sequences using the item's absolute position in the paginated list.
    const updatedItems = items.map((item, index) => ({
      ...item,
      sequence: pageOffset + index,
    }));

    // Optimistically update UI
    setProducts(updatedItems);

    try {
      const response = await fetch('/api/admin/products/reorder', {
        method: 'POST',
      headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: updatedItems.map(item => ({
            id: item.id,
            sequence: item.sequence,
          })),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product sequence');
      }
      toast.success('Product order updated successfully');
    } catch (error) {
      console.error('Error updating product sequence:', error);
      // Revert the optimistic update
      setProducts(previousProducts);
      // Show error message
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        toast.error('Please log in again to continue.');
        router.push('/login');
        return;
      }
      toast.error(error instanceof Error ? error.message : 'Failed to update product sequence. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button
            onClick={() => fetchProducts(page)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Products</h1>
          <Link
            href="/admin/products/add"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add New Product
          </Link>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleStatusFilterChange(filter.value)}
              className={`rounded-full px-3 py-1 text-sm ${
                statusFilter === filter.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No products found for this filter</p>
          <Link
            href="/admin/products/add"
            className="text-green-600 hover:text-green-700 underline"
          >
            Add your first product
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Mobile Product List */}
      <div className="block md:hidden bg-[#fcfdff] min-h-screen pb-24">
        <div className="flex justify-between items-center px-4 py-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <Link
            href="/admin/products/add"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Add
          </Link>
        </div>
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleStatusFilterChange(filter.value)}
              className={`rounded-full px-3 py-1 text-sm ${
                statusFilter === filter.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="px-4 pb-3 text-xs text-gray-500">
          {canReorder ? 'Drag to reorder active products.' : 'Reordering is available only in the Active filter.'}
        </div>
        <Droppable droppableId="products-mobile">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-3 px-4"
            >
              {products.map((product, index) => (
                <Draggable
                  key={product.id}
                  draggableId={product.id}
                  index={index}
                  isDragDisabled={!canReorder}
                >
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style}
                      className="bg-white rounded-xl shadow border p-4 flex items-center gap-4"
                    >
                      {canReorder ? (
                        <button
                          type="button"
                          {...provided.dragHandleProps}
                          className="cursor-grab touch-none p-1 text-gray-400 active:cursor-grabbing"
                          style={{ touchAction: 'none' }}
                          aria-label={`Reorder ${product.name}`}
                        >
                          <FaGripVertical className="text-gray-400" />
                        </button>
                      ) : (
                        <span className="p-1 text-gray-300">
                          <FaGripVertical />
                        </span>
                      )}
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className="font-semibold text-base text-gray-900 truncate">{product.name}</div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold w-fit ${getStatusBadgeClasses(product.status as ProductStatus)}`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">{product.category?.name || 'Uncategorized'}</div>
                        <div className="text-xs text-gray-500">৳{product.price.toFixed(2)} | Stock: {product.stock}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                          className="text-indigo-600 text-xs font-medium"
                        >
                          Edit
                        </button>
                        {product.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(product.id, 'ACTIVE')}
                            className="text-green-600 text-xs font-medium"
                            disabled={actionProductId === product.id}
                          >
                            Activate
                          </button>
                        )}
                        {product.status !== 'INACTIVE' && product.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleStatusChange(product.id, 'INACTIVE')}
                            className="text-amber-600 text-xs font-medium"
                            disabled={actionProductId === product.id}
                          >
                            Deactivate
                          </button>
                        )}
                        {product.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleStatusChange(product.id, 'ARCHIVED')}
                            className="text-slate-600 text-xs font-medium"
                            disabled={actionProductId === product.id}
                          >
                            Archive
                          </button>
                        )}
                        {product.status === 'ARCHIVED' && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 text-xs font-medium"
                            disabled={actionProductId === product.id}
                          >
                            Delete Permanently
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Products</h1>
          <Link
            href="/admin/products/add"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add New Product
          </Link>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleStatusFilterChange(filter.value)}
              className={`rounded-full px-3 py-1 text-sm ${
                statusFilter === filter.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-500">
            {canReorder ? 'Reorder is enabled for active products.' : 'Reorder is disabled outside the Active filter.'}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Droppable droppableId="products-desktop">
            {(provided) => (
              <table className="min-w-full divide-y divide-gray-200" {...provided.droppableProps} ref={provided.innerRef}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-8"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, index) => (
                    <Draggable
                      key={product.id}
                      draggableId={product.id}
                      index={index}
                      isDragDisabled={!canReorder}
                    >
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={provided.draggableProps.style}
                        >
                          <td className="pl-4">
                            {canReorder ? (
                              <button
                                type="button"
                                {...provided.dragHandleProps}
                                className="cursor-grab touch-none text-gray-400 active:cursor-grabbing"
                                style={{ touchAction: 'none' }}
                                aria-label={`Reorder ${product.name}`}
                              >
                                <FaGripVertical className="text-gray-400" />
                              </button>
                            ) : (
                              <span className="text-gray-300">
                                <FaGripVertical className="text-gray-300" />
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={product.image}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">{product.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">৳{product.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.stock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClasses(product.status as ProductStatus)}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            {product.status !== 'ACTIVE' && (
                              <button
                                onClick={() => handleStatusChange(product.id, 'ACTIVE')}
                                className="text-green-600 hover:text-green-800 mr-4"
                                disabled={actionProductId === product.id}
                              >
                                Activate
                              </button>
                            )}
                            {product.status !== 'INACTIVE' && product.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleStatusChange(product.id, 'INACTIVE')}
                                className="text-amber-600 hover:text-amber-800 mr-4"
                                disabled={actionProductId === product.id}
                              >
                                Deactivate
                              </button>
                            )}
                            {product.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleStatusChange(product.id, 'ARCHIVED')}
                                className="text-slate-600 hover:text-slate-800 mr-4"
                                disabled={actionProductId === product.id}
                              >
                                Archive
                              </button>
                            )}
                            {product.status === 'ARCHIVED' && (
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900"
                                disabled={actionProductId === product.id}
                              >
                                Delete Permanently
                              </button>
                            )}
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
          <div className="flex justify-between items-center p-4 border-t">
            <button
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

function AdminProductsPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<AdminProductsPageFallback />}>
      <AdminProductsPageContent />
    </Suspense>
  );
}
