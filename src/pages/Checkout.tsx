import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Checkout = () => {
  const router = useRouter();
  const { cart, clearCart, addOrder, user, token } = useStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.mobile || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    state: 'Maharashtra',
    pincode: user?.pincode || '',
    alternatePhone: '',
  });
  const [processing, setProcessing] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { toast({ title: 'Cart is empty', variant: 'destructive' }); return; }
    setProcessing(true);
    (async () => {
      try {
        const customerEmail = (user?.email || form.email).trim();
        const customerName = (user?.name || form.name).trim();
        const customerPhone = (user?.mobile || form.phone).trim();

        const orderPayload = {
          orderNumber: `MPS-${1000 + Math.floor(Math.random() * 9000)}`,
          customerName,
          customerEmail,
          customerPhone,
          alternatePhone: form.alternatePhone.trim() || undefined,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          items: cart.map((c) => ({
            productId: c.productId,
            name: c.name,
            image: c.image,
            color: c.color,
            size: c.size,
            quantity: c.quantity,
            price: c.price,
          })),
          subtotal,
          total: subtotal,
          paymentStatus: 'paid' as const,
          orderStatus: 'confirmed' as const,
          date: new Date().toISOString().split('T')[0],
        };

        const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        if (!authToken) {
          toast({ title: 'Please login to place order', variant: 'destructive' });
          setProcessing(false);
          router.push('/login');
          return;
        }

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(orderPayload),
        });

        const data = await res.json();
        if (!res.ok || !data?.success) {
          const msg = data?.error || 'Failed to place order';
          toast({ title: msg, variant: 'destructive' });

          const localOrder = { id: Date.now().toString(), ...orderPayload };
          addOrder(localOrder);
          clearCart();
          setProcessing(false);
          router.push('/order-success');
          return;
        }

        clearCart();
        setProcessing(false);
        router.push('/order-success');
      } catch {
        toast({ title: 'Order failed', description: 'Network error. Please try again.', variant: 'destructive' });
        setProcessing(false);
      }
    })();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="section-title mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-display text-lg font-semibold mb-4">Billing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['name', 'phone'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
                    <input name={field} value={form[field]} onChange={handleChange} required
                      className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-1">Alternate phone <span className="text-gray-400 text-xs">(optional)</span></label>
                  <input name="alternatePhone" value={form.alternatePhone} onChange={handleChange}
                    className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {(['email', 'address', 'city', 'state', 'pincode'] as const).map((field) => (
                  <div key={field} className={field === 'address' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
                    <input name={field} value={form[field]} onChange={handleChange} required
                      className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-fit lg:sticky lg:top-24">
            <Alert variant="destructive" className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800">
              <AlertDescription className="font-semibold">
                ⚠️ 50 Rupees Charge if not filled correct Details during Checkout
              </AlertDescription>
            </Alert>
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
              {cart.map((item) => (
                <div key={`${item.productId}-${item.color}`} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-primary">₹{subtotal.toLocaleString()}</span>
              </div>
              <button type="submit" disabled={processing} className="btn-primary w-full mt-6 disabled:opacity-50">
                {processing ? '⏳ Processing Payment...' : '💳 Place Order (Razorpay)'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
};

export default Checkout;
