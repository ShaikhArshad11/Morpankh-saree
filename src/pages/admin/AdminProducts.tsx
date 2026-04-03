import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Upload } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';
import { Product } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

type ProductForm = {
  name: string;
  originalPrice: string;
  salePrice: string;
  category: string;
  stock: string;
  colors: string[];
  description: string;
  fabric: string;
  salePercent: string;
  hidden: boolean;
  imageUrl: string;
};

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: '', originalPrice: '', salePrice: '', category: '', stock: '', colors: [],
    description: '', fabric: '', salePercent: '', hidden: false, imageUrl: '',
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', originalPrice: '', salePrice: '', category: categories[0]?.slug || '', stock: '', colors: [], description: '', fabric: '', salePercent: '', hidden: false, imageUrl: '' });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, 
      originalPrice: p.comparePrice.toString(), 
      salePrice: p.price.toString(),
      category: p.category, 
      stock: p.stock.toString(), 
      colors: p.colors,
      description: p.description, 
      fabric: p.fabric,
      salePercent: p.salePercent?.toString() || '', 
      hidden: p.hidden || false,
      imageUrl: p.images[0] || '',
    });
    setModalOpen(true);
  };

  // Color management functions
  const addColor = () => {
    const newColor = prompt('Enter color name:');
    if (newColor && newColor.trim()) {
      setForm({ ...form, colors: [...form.colors, newColor.trim()] });
    }
  };

  const removeColor = (index: number) => {
    setForm({ ...form, colors: form.colors.filter((_, i) => i !== index) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const slug = form.name.toLowerCase().replace(/\s+/g, '-');
    const salePercent = form.salePercent ? Number(form.salePercent) : undefined;
    const images = form.imageUrl ? [form.imageUrl] : (editing ? editing.images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop']);
    const data: Partial<Product> = {
      name: form.name, 
      slug, 
      price: Number(form.salePrice), 
      comparePrice: Number(form.originalPrice),
      category: form.category, 
      stock: Number(form.stock), 
      colors: form.colors,
      description: form.description, 
      fabric: form.fabric, 
      hidden: form.hidden, 
      salePercent,
      isSale: salePercent ? salePercent > 0 : undefined, 
      images,
    };
    if (editing) {
      updateProduct(editing.id, data);
      toast({ title: 'Product updated' });
    } else {
      addProduct({
        ...data, id: Date.now().toString(),
        sku: `SKU-${Date.now()}`, tags: [], featured: false, isNew: true, isPremium: false, isTrending: false, rating: 0, reviews: 0,
      } as Product);
      toast({ title: 'Product added' });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setConfirmDelete(null);
    toast({ title: 'Product deleted' });
  };

  const toggleHidden = (p: Product) => {
    updateProduct(p.id, { hidden: !p.hidden });
    toast({ title: p.hidden ? 'Product is now visible' : 'Product hidden from store' });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2"><Plus className="h-4 w-4" /> Add Product</button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Sale%</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${p.hidden ? 'opacity-50' : ''}`}>
                <td className="p-4 flex items-center gap-3">
                  <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover rounded" />
                  <div>
                    <span className="font-medium">{p.name}</span>
                    {p.hidden && <span className="ml-2 text-xs text-destructive">(Hidden)</span>}
                  </div>
                </td>
                <td className="p-4">₹{p.price.toLocaleString()}</td>
                <td className="p-4">{p.salePercent ? `${p.salePercent}%` : '—'}</td>
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
                  <button onClick={() => openEdit(p)} className="p-2 hover:bg-muted rounded-lg transition-colors"><Pencil className="h-4 w-4 text-primary" /></button>
                  <button onClick={() => setConfirmDelete(p.id)} className="p-2 hover:bg-muted rounded-lg transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Product Image</label>
                <div className="flex items-center gap-3">
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="Preview" className="w-16 h-20 object-cover rounded border border-border" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                    <Upload className="h-4 w-4" /> Upload Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Or paste image URL" className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-2" />
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

              {/* Colors Management */}
              <div>
                <label className="block text-sm font-medium mb-1">Colors</label>
                <div className="space-y-2">
                  {form.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm">{color}</span>
                      <button
                        onClick={() => removeColor(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
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

              {/* Product Name */}
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

              {/* Other Fields */}
              {(
                [
                  { label: 'Sale % (e.g. 35)', key: 'salePercent', type: 'number' },
                  { label: 'Stock Quantity', key: 'stock', type: 'number' },
                  { label: 'Fabric', key: 'fabric', type: 'text' },
                ] as const
              ).map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm">
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {/* Hide Product Toggle */}
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <div className={`relative w-11 h-6 rounded-full transition-colors ${form.hidden ? 'bg-destructive' : 'bg-muted'}`} onClick={() => setForm({ ...form, hidden: !form.hidden })}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full transition-transform shadow ${form.hidden ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium">Hide from store</span>
              </label>
              <button onClick={handleSave} className="btn-primary w-full">{editing ? 'Update Product' : 'Add Product'}</button>
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
