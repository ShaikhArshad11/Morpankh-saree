import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';
import { Category } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '' });

  const openAdd = () => { setEditing(null); setForm({ name: '', slug: '', image: '' }); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, image: c.image }); setModalOpen(true); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-');
    if (editing) {
      updateCategory(editing.id, { name: form.name, slug, image: form.image || editing.image });
      toast({ title: 'Category updated' });
    } else {
      addCategory({ id: Date.now().toString(), name: form.name, slug, image: form.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop', productCount: 0 });
      toast({ title: 'Category added' });
    }
    setModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Categories</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2"><Plus className="h-4 w-4" /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-card rounded-xl border border-border overflow-hidden card-hover">
            <div className="aspect-video overflow-hidden">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">/{cat.slug} · {cat.productCount} products</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-2 hover:bg-muted rounded-lg transition-colors"><Pencil className="h-4 w-4 text-primary" /></button>
                <button onClick={() => { deleteCategory(cat.id); toast({ title: 'Category deleted' }); }} className="p-2 hover:bg-muted rounded-lg transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">{editing ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Category Image</label>
                <div className="flex items-center gap-3">
                  {form.image && (
                    <img src={form.image} alt="Preview" className="w-16 h-12 object-cover rounded border border-border" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                    <Upload className="h-4 w-4" /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Or paste image URL" className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-2" />
              </div>
              <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-sm font-medium mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <button onClick={handleSave} className="btn-primary w-full">{editing ? 'Update' : 'Add'} Category</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
