import { Plus, Minus } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';
import { getInventoryItems } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const AdminInventory = () => {
  const { products, updateStock } = useStore();
  const inventory = getInventoryItems(products);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Inventory</h1>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Variant</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{item.productName}</td>
                <td className="p-4">{item.variant}</td>
                <td className="p-4 text-muted-foreground">{item.sku}</td>
                <td className="p-4">
                  <span className={`font-bold ${item.stock <= 5 ? 'text-destructive' : item.stock <= 10 ? 'text-gold' : 'text-primary'}`}>{item.stock}</span>
                </td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  <button onClick={() => { updateStock(item.productId, 5); toast({ title: `+5 stock for ${item.productName}` }); }} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                    <Plus className="h-3 w-3" /> Stock In
                  </button>
                  <button onClick={() => { updateStock(item.productId, -1); toast({ title: `-1 stock for ${item.productName}` }); }} className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors">
                    <Minus className="h-3 w-3" /> Stock Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
