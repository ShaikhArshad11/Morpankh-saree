import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

const Checkout = () => {
  const router = useRouter();
  const { cart, clearCart, addOrder } = useStore();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', state: 'Maharashtra', pincode: '' });
  const [processing, setProcessing] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { toast({ title: 'Cart is empty', variant: 'destructive' }); return; }
    setProcessing(true);
    setTimeout(() => {
      const order = {
        id: Date.now().toString(),
        orderNumber: `MPS-${1000 + Math.floor(Math.random() * 9000)}`,
        customerName: form.name, customerEmail: form.email, customerPhone: form.phone,
        address: form.address, city: form.city, state: form.state, pincode: form.pincode,
        items: cart.map((c) => ({ productId: c.productId, name: c.name, color: c.color, size: c.size, quantity: c.quantity, price: c.price })),
        subtotal, total: subtotal, paymentStatus: 'paid' as const, orderStatus: 'confirmed' as const, date: new Date().toISOString().split('T')[0],
      };
      addOrder(order);
      clearCart();
      setProcessing(false);
      router.push('/order-success');
    }, 2000);
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
                {(['name', 'phone', 'email', 'address', 'city', 'state', 'pincode'] as const).map((field) => (
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
