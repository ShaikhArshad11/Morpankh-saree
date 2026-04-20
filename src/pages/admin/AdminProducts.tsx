"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Upload, FileText, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';
import { uploadToR2 } from '@/lib/r2Upload';

// Database interfaces
interface ColorVariant {
  colorName: string;
  stock: number;
  images: string[];
}

interface DbProduct {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number;
  category: string;
  stock: number;
  colors: ColorVariant[];
  description: string;
  fabric: string;
  size?: string;
  hidden?: boolean;
  images?: string[];
  sku?: string;
  tags?: string[];
  featured?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
  isTrending?: boolean;
  rating?: number;
  reviews?: number;
  sareeLength?: string;
}

interface DbCategory {
  _id?: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
}

type ProductForm = {
  name: string;
  sku: string;
  originalPrice: string;
  salePrice: string;
  category: string;
  stock: string;

  colors: {
    colorName: string;
    stock: string;
    images: string[];
  }[];

  description: string;
  fabric: string;
  size: string;
  hidden: boolean;
  tags: string[];
  featured: boolean;
  isNew: boolean;
  isPremium: boolean;
  isTrending: boolean;
  rating: number;
  reviews: number;
  sareeLength: string;
};

const AdminProducts = () => {
  const { addProduct, updateProduct, deleteProduct } = useStore();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DbProduct | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState<DbProduct | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingColorIndex, setUploadingColorIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [paginatingLoading, setPaginatingLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: '', 
    sku: '', 
    originalPrice: '', salePrice: '', category: '', stock: '', colors: [],
    description: '', fabric: '', size: '', hidden: false,
    tags: [], featured: false, isNew: false, isPremium: false,
    isTrending: false, rating: 0, reviews: 0,
    sareeLength: '',
  });

  const totalStock = form.colors.reduce((sum, color) => sum + Number(color.stock || 0), 0);

  // Short timer to hide skeleton quickly on refresh
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data from database
  const fetchData = async (isPagination = false) => {
    if (isPagination) {
      setPaginatingLoading(true);
    } else {
      setLoading(true);
    }
    try {
      // Fetch categories (only on initial load)
      if (!isPagination) {
        const categoriesRes = await fetch('/api/admin/categories', {
          headers: { authorization: 'Bearer admin-token' }
        });
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }
      }

      // Fetch products
      const productsRes = await fetch(`/api/admin/products?page=${currentPage}&pageSize=6`, {
        headers: { authorization: 'Bearer admin-token' }
      });
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);
        setTotalPages(productsData.pagination?.totalPages || 1);
        setTotal(productsData.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
      setPaginatingLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [currentPage]);

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
    setForm({
      name: '', 
      sku: '', 
      originalPrice: '', salePrice: '', category: categories[0]?.slug || '', stock: '', colors: [],
      description: '', fabric: '', size: '', hidden: false,
      tags: [], featured: false, isNew: false, isPremium: false,
      isTrending: false, rating: 0, reviews: 0,
      sareeLength: '',
    });
  };

  const openEditModal = (p: DbProduct) => {
    setEditing(p);
    setModalOpen(true);
    setForm({
      name: p.name,
      sku: p.sku || '',
      originalPrice: p.comparePrice?.toString() || '',
      salePrice: p.price?.toString() || '',
      category: p.category,
      stock: p.stock?.toString() || '',
      colors: (Array.isArray(p.colors) ? p.colors : []).map((c) => ({
        colorName: c.colorName,
        stock: c.stock?.toString() || '',
        images: Array.isArray(c.images) ? c.images : [],
      })),
      description: p.description,
      fabric: p.fabric,
      size: p.size || '',
      hidden: p.hidden || false,
      tags: p.tags || [],
      featured: p.featured || false,
      isNew: p.isNew || false,
      isPremium: p.isPremium || false,
      isTrending: p.isTrending || false,
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      sareeLength: p.sareeLength || '',
    });
    setModalOpen(true);
  };

  const openDetailsModal = (p: DbProduct) => {
    setDetailsProduct(p);
    setDetailsOpen(true);
  };

  // Color management functions
  const addColor = () => {
    setForm({
      ...form,
      colors: [...form.colors, { colorName: '', stock: '', images: [] }],
    });
  };

  const removeColor = (index: number) => {
    setForm({ ...form, colors: form.colors.filter((_, i) => i !== index) });
  };

  const uploadColorImage = async (colorIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingColorIndex(colorIndex);
    setUploadProgress(0);

    try {
      const url = await uploadToR2(file, {
        folder: 'products',
        maxBytes: 10 * 1024 * 1024,
        onProgress: (pct) => setUploadProgress(pct),
      });

      setForm((prev) => {
        const nextColors = [...prev.colors];
        const current = nextColors[colorIndex];
        if (!current) return prev;
        nextColors[colorIndex] = {
          ...current,
          images: [url],
        };
        return { ...prev, colors: nextColors };
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Image upload failed', variant: 'destructive' });
    } finally {
      setUploadingColorIndex(null);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (submitting) return;
    if (uploadingColorIndex !== null) {
      toast({ title: 'Please wait for image upload to finish', variant: 'destructive' });
      return;
    }
    const slug = form.name.toLowerCase().replace(/\s+/g, '-');
    const data: Partial<DbProduct> = {
      name: form.name, 
      slug, 
      price: Number(form.salePrice), 
      comparePrice: Number(form.originalPrice),
      category: form.category, 
      stock: totalStock,
      colors: form.colors.map((c) => ({
        colorName: c.colorName,
        stock: Number(c.stock),
        images: (c.images || []).filter((img) => typeof img === 'string' && !img.startsWith('data:')),
      })),
      description: form.description, 
      fabric: form.fabric, 
      size: form.size,
      hidden: form.hidden, 
      sku: form.sku,
      tags: form.tags,
      featured: form.featured,
      isNew: form.isNew,
      isPremium: form.isPremium,
      isTrending: form.isTrending,
      rating: form.rating,
      reviews: form.reviews,
      sareeLength: form.sareeLength,
    };
    
    setSubmitting(true);
    try {
      let response;
      if (editing) {
        response = await fetch(`/api/admin/products/${editing._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            authorization: 'Bearer admin-token'
          },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            authorization: 'Bearer admin-token'
          },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();
      
      if (response.ok) {
        // Refresh the products list
        const productsRes = await fetch(`/api/admin/products?page=${currentPage}&pageSize=6`, {
          headers: { authorization: 'Bearer admin-token' }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
          setTotalPages(productsData.pagination?.totalPages || 1);
          setTotal(productsData.pagination?.total || 0);
        }
        
        toast({ title: editing ? 'Product updated' : 'Product added' });
        setModalOpen(false);
        setCurrentPage(1);
      } else {
        toast({ title: result.error || 'Failed to save product', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Failed to save product', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 
          authorization: 'Bearer admin-token'
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        // Refresh the products list
        const productsRes = await fetch(`/api/admin/products?page=${currentPage}&pageSize=6`, {
          headers: { authorization: 'Bearer admin-token' }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
          setTotalPages(productsData.pagination?.totalPages || 1);
          setTotal(productsData.pagination?.total || 0);
        }
        
        setConfirmDelete(null);
        toast({ title: 'Product deleted' });
      } else {
        toast({ title: result.error || 'Failed to delete product', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Failed to delete product', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleHidden = async (p: DbProduct) => {
    try {
      const response = await fetch(`/api/admin/products/${p._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          authorization: 'Bearer admin-token'
        },
        body: JSON.stringify({ hidden: !p.hidden }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Refresh products list
        const productsRes = await fetch(`/api/admin/products?page=${currentPage}&pageSize=6`, {
          headers: { authorization: 'Bearer admin-token' }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
          setTotalPages(productsData.pagination?.totalPages || 1);
          setTotal(productsData.pagination?.total || 0);
        }
        
        toast({ title: p.hidden ? 'Product is now visible' : 'Product hidden from store' });
      } else {
        toast({ title: result.error || 'Failed to update product', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Toggle hidden error:', error);
      toast({ title: 'Failed to update product', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 text-sm py-2"><Plus className="h-4 w-4" /> Add Product</button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto relative">
        {loading ? (
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border-b border-border last:border-0">
                  <div className="w-10 h-12 bg-muted rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/5 animate-pulse" />
                  </div>
                  <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-8 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-10 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                  <div className="flex gap-1">
                    <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                    <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                    <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {paginatingLoading && (
              <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Loading page...</div>
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Offer%</th>
                  <th className="text-left p-4">Stock</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.colors?.[0]?.images?.[0] || p.images?.[0] || '/placeholder.svg'}
                      alt={p.name}
                      className="w-10 h-12 object-cover rounded"
                    />
                    <div>
                      <span className="font-medium">{p.name}</span>
                      {p.hidden && <span className="ml-2 text-xs text-destructive">(Hidden)</span>}
                    </div>
                  </td>
                  <td className="p-4">₹{p.price.toLocaleString()}</td>
                  <td className="p-4">{p.comparePrice > p.price ? `${Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%` : '—'}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.stock > 10 ? 'bg-primary/20 text-primary' : p.stock > 0 ? 'bg-gold/20 text-gold' : 'bg-destructive/20 text-destructive'}`}>
                      {p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => openDetailsModal(p)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => toggleHidden(p)} className="p-2 hover:bg-muted rounded-lg transition-colors" title={p.hidden ? 'Show' : 'Hide'}>
                      {p.hidden ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => openEditModal(p)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Pencil className="h-4 w-4 text-primary" />
                    </button>
                    <button onClick={() => setConfirmDelete(p._id || '')} className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {products.length} of {total} products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || paginatingLoading}
                className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Previous
              </button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || paginatingLoading}
                className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Product Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Product Name - First Field */}
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter product name"
                />
              </div>

              {/* SKU - Second Field */}
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter SKU"
                />
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="4000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="1999"
                  />
                </div>
              </div>

              {/* Colors with Image Uploads */}
              <div>
                <label className="block text-sm font-medium mb-2">Colors</label>
                <div className="space-y-3">
                  {form.colors.map((color, index) => (
                    <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Color Name</label>
                          <input
                            type="text"
                            value={color.colorName}
                            onChange={(e) => {
                              const updatedColors = [...form.colors];
                              updatedColors[index].colorName = e.target.value;
                              setForm({ ...form, colors: updatedColors });
                            }}
                            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Enter color name"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-sm font-medium mb-1">Stock</label>
                          <input
                            type="number"
                            value={color.stock}
                            onChange={(e) => {
                              const updatedColors = [...form.colors];
                              updatedColors[index].stock = e.target.value;
                              setForm({ ...form, colors: updatedColors });
                            }}
                            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <button
                          onClick={() => removeColor(index)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Images</label>
                        <div className="flex items-center gap-3">
                          {Array.isArray(color.images) && color.images.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {color.images.slice(0, 4).map((img, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={img}
                                  alt={color.colorName}
                                  className="w-16 h-16 object-cover rounded border border-border"
                                />
                              ))}
                            </div>
                          )}
                          <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                            <Upload className="h-4 w-4" /> Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              disabled={submitting || uploadingColorIndex !== null}
                              onChange={(e) => void uploadColorImage(index, e)}
                              className="hidden"
                            />
                          </label>
                          {uploadingColorIndex === index && (
                            <div className="text-xs text-muted-foreground">Uploading: {uploadProgress}%</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addColor}
                    className="w-full px-3 py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Fabric</label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter fabric type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Size (s, m, l, xl, xxl)</label>
                  <select
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Size</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </select>
                </div>
                <div className="rounded-3xl border border-border bg-muted/70 p-3 text-sm text-muted-foreground">
                  Total product stock is calculated from color quantities: <span className="font-semibold text-foreground">{totalStock}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Saree Length (meters)</label>
                  <input
                    type="text"
                    value={form.sareeLength}
                    onChange={(e) => setForm({ ...form, sareeLength: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. 5.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm">
                  {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags.join(', ')}
                  onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="rounded"
                    />
                    Featured Product
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={form.isNew}
                      onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                      className="rounded"
                    />
                    New Product
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={form.isPremium}
                      onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                      className="rounded"
                    />
                    Premium Product
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={form.isTrending}
                      onChange={(e) => setForm({ ...form, isTrending: e.target.checked })}
                      className="rounded"
                    />
                    Trending Product
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <input
                    type="number"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0-5"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reviews</label>
                  <input
                    type="number"
                    value={form.reviews}
                    onChange={(e) => setForm({ ...form, reviews: Number(e.target.value) })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button onClick={() => setModalOpen(false)} disabled={submitting} className="flex-1 btn-outline-primary text-sm py-2 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={submitting} className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editing ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {detailsOpen && detailsProduct && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Product Details</h2>
              <button
                onClick={() => {
                  setDetailsOpen(false);
                  setDetailsProduct(null);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="rounded-lg border border-border p-3 bg-muted/30">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{' '}
                      <span className="font-medium">{detailsProduct.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Slug:</span>{' '}
                      <span className="font-medium">{detailsProduct.slug}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SKU:</span>{' '}
                      <span className="font-medium">{detailsProduct.sku || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>{' '}
                      <span className="font-medium">{detailsProduct.category || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <span className="font-medium">{detailsProduct.hidden ? 'Hidden' : 'Visible'}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Sale Price</div>
                      <div className="font-semibold">₹{Number(detailsProduct.price || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Original Price</div>
                      <div className="font-semibold">₹{Number(detailsProduct.comparePrice || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Offer</div>
                      <div className="font-semibold">
                        {detailsProduct.comparePrice > detailsProduct.price
                          ? `${Math.round(((detailsProduct.comparePrice - detailsProduct.price) / detailsProduct.comparePrice) * 100)}%`
                          : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Stock</div>
                      <div className="font-semibold">{detailsProduct.stock ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3 text-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-muted-foreground">Fabric:</span>{' '}
                      <span className="font-medium">{detailsProduct.fabric || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>{' '}
                      <span className="font-medium">{detailsProduct.size || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Saree Length:</span>{' '}
                      <span className="font-medium">{detailsProduct.sareeLength || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tags:</span>{' '}
                      <span className="font-medium">{Array.isArray(detailsProduct.tags) && detailsProduct.tags.length ? detailsProduct.tags.join(', ') : '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Highlights:</span>{' '}
                      <span className="font-medium">
                        {[
                          detailsProduct.featured ? 'Featured' : null,
                          detailsProduct.isNew ? 'New' : null,
                          detailsProduct.isPremium ? 'Premium' : null,
                          detailsProduct.isTrending ? 'Trending' : null,
                        ]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>{' '}
                      <span className="font-medium">{typeof detailsProduct.rating === 'number' ? detailsProduct.rating : '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reviews:</span>{' '}
                      <span className="font-medium">{typeof detailsProduct.reviews === 'number' ? detailsProduct.reviews : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-sm font-medium mb-2">Images</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(Array.isArray(detailsProduct.images) ? detailsProduct.images : [])
                      .concat(
                        (Array.isArray(detailsProduct.colors) ? detailsProduct.colors : []).flatMap((c) =>
                          Array.isArray(c.images) ? c.images : []
                        )
                      )
                      .filter(Boolean)
                      .slice(0, 12)
                      .map((img, idx) => (
                        <img
                          key={`${img}-${idx}`}
                          src={img}
                          alt={detailsProduct.name}
                          className="w-full h-24 object-cover rounded border border-border"
                        />
                      ))}
                  </div>
                  {(!detailsProduct.images || detailsProduct.images.length === 0) && (!detailsProduct.colors || detailsProduct.colors.length === 0) && (
                    <div className="text-sm text-muted-foreground">No images.</div>
                  )}
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="text-sm font-medium mb-2">Description</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{detailsProduct.description || '—'}</div>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="text-sm font-medium mb-2">Color Variants</div>
                  <div className="space-y-2">
                    {(Array.isArray(detailsProduct.colors) ? detailsProduct.colors : []).length === 0 ? (
                      <div className="text-sm text-muted-foreground">No color variants.</div>
                    ) : (
                      (detailsProduct.colors || []).map((c, idx) => (
                        <div key={`${c.colorName}-${idx}`} className="rounded-lg border border-border p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium truncate">{c.colorName || '—'}</div>
                            <div className="text-muted-foreground">Stock: <span className="font-medium text-foreground">{c.stock ?? 0}</span></div>
                          </div>
                          {Array.isArray(c.images) && c.images.length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {c.images.slice(0, 6).map((img, imgIdx) => (
                                <img
                                  key={`${img}-${imgIdx}`}
                                  src={img}
                                  alt={c.colorName}
                                  className="w-16 h-16 object-cover rounded border border-border"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => {
                  setDetailsOpen(false);
                  setDetailsProduct(null);
                }}
                className="btn-outline-primary text-sm py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-sm border border-border text-center">
            <h3 className="font-display text-lg font-semibold mb-2">Delete Product?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={Boolean(deletingId)} className="flex-1 btn-outline-primary text-sm py-2 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={Boolean(deletingId)} className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {deletingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
