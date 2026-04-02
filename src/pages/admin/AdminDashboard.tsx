import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';

const AdminDashboard = () => {
  const { products, orders, customers, reviews } = useStore();
  const totalRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const todayOrders = orders.filter((o) => o.date === new Date().toISOString().split('T')[0]);
  const todayRevenue = todayOrders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter((p) => p.stock <= 10 && !p.hidden);
  const pendingReviews = reviews.filter((r) => !r.approved);

  const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
    <div className="bg-card rounded-xl p-5 border border-border card-hover">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
        <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div>
      </div>
    </div>
  );

  const statusColor = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-gold/20 text-gold', paid: 'bg-primary/20 text-primary', confirmed: 'bg-primary/20 text-primary', shipped: 'bg-secondary/20 text-secondary', delivered: 'bg-peacock-green/20 text-peacock-green', cancelled: 'bg-destructive/20 text-destructive' };
    return map[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>

      {/* Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl p-6 border border-border gradient-hero text-primary-foreground">
          <p className="text-sm opacity-80">Today's Orders</p>
          <p className="text-3xl font-bold">{todayOrders.length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border gradient-saffron text-secondary-foreground">
          <p className="text-sm opacity-80">Today's Revenue</p>
          <p className="text-3xl font-bold">₹{todayRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={ShoppingCart} label="Total Orders" value={orders.length.toString()} color="bg-primary/10 text-primary" />
        <StatCard icon={Package} label="Total Products" value={products.filter(p => !p.hidden).length.toString()} color="bg-secondary/10 text-secondary" />
        <StatCard icon={Users} label="Total Customers" value={customers.length.toString()} color="bg-accent/10 text-accent" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="bg-peacock-green/10 text-peacock-green" />
        <StatCard icon={TrendingUp} label="Total Profit" value={`₹${Math.round(totalRevenue * 0.3).toLocaleString()}`} color="bg-gold/10 text-gold" />
      </div>

      {/* Pending Reviews Alert */}
      {pendingReviews.length > 0 && (
        <Link href="/admin/reviews" className="block mb-6 bg-secondary/10 border border-secondary/30 rounded-xl p-4 hover:bg-secondary/15 transition-colors">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-secondary" />
            <div>
              <p className="font-medium text-sm">{pendingReviews.length} review{pendingReviews.length > 1 ? 's' : ''} pending approval</p>
              <p className="text-xs text-muted-foreground">Click to review and approve</p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-display text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">₹{order.total.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gold" /> Low Stock Alert
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.colors[0]} · {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${p.stock <= 5 ? 'text-destructive' : 'text-gold'}`}>{p.stock} left</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock <= 5 ? 'bg-destructive/20 text-destructive' : 'bg-gold/20 text-gold'}`}>
                      {p.stock <= 5 ? 'Critical' : 'Low'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
