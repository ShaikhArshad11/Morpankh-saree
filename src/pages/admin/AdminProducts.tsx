"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Upload } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: '', 
    sku: '', 
    originalPrice: '', salePrice: '', category: '', stock: '', colors: [],
    description: '', fabric: '', hidden: false,
    tags: [], featured: false, isNew: false, isPremium: false,
    isTrending: false, rating: 0, reviews: 0,
    sareeLength: '',
  });

  const totalStock = form.colors.reduce((sum, color) => sum + Number(color.stock || 0), 0);

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        // Fetch categories
        const categoriesRes = await fetch('/api/admin/categories', {
          headers: { authorization: `Bearer ${token}` }
        });
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }

        // Fetch products
        const productsRes = await fetch('/api/admin/products', {
          headers: { authorization: `Bearer ${token}` }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({ title: 'Failed to load data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
    setForm({
      name: '', 
      sku: '', 
      originalPrice: '', salePrice: '', category: categories[0]?.slug || '', stock: '', colors: [],
      description: '', fabric: '', hidden: false,
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

  const uploadColorImage = (colorIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = reader.result as string;
      setForm((prev) => {
        const nextColors = [...prev.colors];
        const current = nextColors[colorIndex];
        if (!current) return prev;
        nextColors[colorIndex] = {
          ...current,
          images: [...(current.images || []), img],
        };
        return { ...prev, colors: nextColors };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
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
        images: c.images,
      })),
      description: form.description, 
      fabric: form.fabric, 
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
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast({ title: 'Authentication required', variant: 'destructive' });
        return;
      }

      let response;
      if (editing) {
        response = await fetch(`/api/admin/products/${editing._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();
      
      if (response.ok) {
        // Refresh the products list
        const productsRes = await fetch('/api/admin/products', {
          headers: { authorization: `Bearer ${token}` }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
        }
        
        toast({ title: editing ? 'Product updated' : 'Product added' });
        setModalOpen(false);
      } else {
        toast({ title: result.error || 'Failed to save product', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Failed to save product', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast({ title: 'Authentication required', variant: 'destructive' });
        return;
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 
          authorization: `Bearer ${token}`
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        // Refresh the products list
        const productsRes = await fetch('/api/admin/products', {
          headers: { authorization: `Bearer ${token}` }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
        }
        
        setConfirmDelete(null);
        toast({ title: 'Product deleted' });
      } else {
        toast({ title: result.error || 'Failed to delete product', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const toggleHidden = async (p: DbProduct) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast({ title: 'Authentication required', variant: 'destructive' });
        return;
      }

      const response = await fetch(`/api/admin/products/${p._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ hidden: !p.hidden }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Refresh the products list
        const productsRes = await fetch('/api/admin/products', {
          headers: { authorization: `Bearer ${token}` }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
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

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Loading products...</div>
          </div>
        ) : (
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
                            <input type="file" accept="image/*" onChange={(e) => uploadColorImage(index, e)} className="hidden" />
                          </label>
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
                <button onClick={() => setModalOpen(false)} className="flex-1 btn-outline-primary text-sm py-2">Cancel</button>
                <button onClick={handleSave} className="flex-1 btn-primary text-sm py-2">
                  {editing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
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
              <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-outline-primary text-sm py-2">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
