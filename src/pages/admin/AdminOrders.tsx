"use client";

import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { Eye, Printer, Trash2, X, RefreshCw } from 'lucide-react';

type Order = {
  id?: string;
  _id?: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  items?: Array<{ productId: string; name: string; color: string; size?: string; quantity: number; price: number; image?: string }>;
  subtotal?: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  date: string;
};

const AdminOrders = () => {
  const { updateOrderStatus, products } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

  const statusColor = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-gold/20 text-gold', paid: 'bg-primary/20 text-primary', confirmed: 'bg-primary/20 text-primary', shipped: 'bg-secondary/20 text-secondary', delivered: 'bg-peacock-green/20 text-peacock-green', cancelled: 'bg-destructive/20 text-destructive', failed: 'bg-destructive/20 text-destructive' };
    return map[status] || 'bg-muted text-muted-foreground';
  };

  const getOrderImage = (order: Order) => {
    const firstItem = order.items?.[0];
    const placeholder = 'https://via.placeholder.com/100?text=No+Image&bg=ddd';
    if (!firstItem) return placeholder;
    if (firstItem.image) return firstItem.image;
    const product = products.find((p) => p.id === firstItem.productId);
    if (product?.images?.[0]) return product.images[0];
    return placeholder;
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  const handlePrintOrder = (orderNumber: string) => {
    if (typeof window !== 'undefined') {
      console.log(`Print order ${orderNumber}`);
      window.print();
    }
  };

  const handleDeleteOrder = (id?: string) => {
    if (!id) return;
    setOrders((prev) => prev.filter((order) => order.id !== id && order._id !== id));
  };

  const fetchOrders = async () => {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!authToken) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok && data?.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchOrders();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, []);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      {loading && orders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-4 text-sm text-muted-foreground">Loading orders...</div>
      ) : null}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="text-left p-4">Image</th>
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Payment</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
              return (
                <tr key={order.id || order._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/60">
                      <img src={getOrderImage(order)} alt={firstItem?.name || order.orderNumber} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-4">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, itemIndex) => (
                          <div key={`${item.productId}-${itemIndex}`} className="space-y-1">
                            <div className="font-medium">{order.orderNumber}</div>
                            <div className="text-sm text-muted-foreground">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.quantity} Quantity</div>
                            <div className="text-sm text-muted-foreground">Color: {item.color}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No items available</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{order.customerName}</td>
                  <td className="p-4">₹{order.total.toLocaleString()}</td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.paymentStatus)}`}>{order.paymentStatus}</span></td>
                  <td className="p-4 flex flex-col gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                    <select
                      aria-label="Change order status"
                      value={order.orderStatus}
                      onChange={async (e) => {
                        const id = order.id || order._id;
                        if (!id) return;
                        const newStatus = e.target.value as OrderStatus;
                        const authToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
                        if (!authToken) return;
                        try {
                          const res = await fetch('/api/admin/orders', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              authorization: `Bearer ${authToken}`,
                            },
                            body: JSON.stringify({ id, orderStatus: newStatus }),
                          });
                          if (res.ok) {
                            updateOrderStatus(id, newStatus);
                            setTimeout(() => fetchOrders(), 500);
                          } else {
                            console.error('Failed to update order status');
                          }
                        } catch (error) {
                          console.error('Error updating order status:', error);
                        }
                      }}
                      className="text-xs border border-border rounded px-2 py-1 bg-background w-full"
                    >
                      {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-muted-foreground">{order.date}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button type="button" title="View order" aria-label="View order" onClick={() => openOrderModal(order)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" title="Print order" aria-label="Print order" onClick={() => handlePrintOrder(order.orderNumber)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
                        <Printer className="h-4 w-4" />
                      </button>
                      <button type="button" title="Delete order" aria-label="Delete order" onClick={() => handleDeleteOrder(order.id || order._id)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-3xl overflow-hidden border border-border/60 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border/60">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-sm text-muted-foreground">{selectedOrder.orderNumber}</p>
              </div>
              <button type="button" title="Close order details" aria-label="Close order details" onClick={closeOrderModal} className="p-3 rounded-xl hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/50 p-4 bg-muted/30">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Order Number</span><span>{selectedOrder.orderNumber}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Date</span><span>{selectedOrder.date}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Status</span><span className={`text-xs px-2 py-1 rounded-full ${statusColor(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Payment</span><span className={`text-xs px-2 py-1 rounded-full ${statusColor(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Total</span><span className="font-medium">₹{selectedOrder.total.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/50 p-4 bg-muted/30">
                  <h3 className="font-semibold mb-3">Customer</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>Name</span><span>{selectedOrder.customerName}</span></div>
                    <div className="flex justify-between"><span>Email</span><span>{selectedOrder.customerEmail || '—'}</span></div>
                    <div className="flex justify-between"><span>Phone</span><span>{selectedOrder.customerPhone || '—'}</span></div>
                    <div className="block"><span className="text-muted-foreground">Address</span><p className="text-sm font-medium">{selectedOrder.address || '—'}</p><p className="text-sm font-medium">{selectedOrder.city || ''}{selectedOrder.city && selectedOrder.state ? ', ' : ''}{selectedOrder.state || ''} {selectedOrder.pincode || ''}</p></div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 p-4 bg-muted/30">
                <h3 className="font-semibold mb-4">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex items-center gap-4 rounded-2xl border border-border/50 p-4 bg-background">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-border/60">
                        <img src={item.image || getOrderImage(selectedOrder)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Color: {item.color}{item.size ? ` · Size: ${item.size}` : ''}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
