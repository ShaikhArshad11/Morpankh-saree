"use client";

import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useStore();

  type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

  const statusColor = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-gold/20 text-gold', paid: 'bg-primary/20 text-primary', confirmed: 'bg-primary/20 text-primary', shipped: 'bg-secondary/20 text-secondary', delivered: 'bg-peacock-green/20 text-peacock-green', cancelled: 'bg-destructive/20 text-destructive', failed: 'bg-destructive/20 text-destructive' };
    return map[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Orders</h1>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="text-left p-4">Order ID</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Payment</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date</th>
              <th className="text-right p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{order.orderNumber}</td>
                <td className="p-4">{order.customerName}</td>
                <td className="p-4">₹{order.total.toLocaleString()}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.paymentStatus)}`}>{order.paymentStatus}</span></td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.orderStatus)}`}>{order.orderStatus}</span></td>
                <td className="p-4 text-muted-foreground">{order.date}</td>
                <td className="p-4 text-right">
                  <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)} className="text-xs border border-border rounded px-2 py-1 bg-background">
                    {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
