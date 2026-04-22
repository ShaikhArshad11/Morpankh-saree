import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Package } from 'lucide-react';

declare global {
  interface Window {
    Razorpay?: unknown;
  }
}

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const router = useRouter();
  const { cart, clearCart, user, token } = useStore();
  
  // Check if cart contains prebooking items
  const hasPrebookingItems = cart.some(item => item.isPrebooking);
  const prebookingItems = cart.filter(item => item.isPrebooking);
  const maxDeliveryDays = Math.max(...prebookingItems.map(item => item.prebookingDeliveryDays || 10), 0);
  const expectedDeliveryDate = maxDeliveryDays > 0 ? 
    new Date(Date.now() + maxDeliveryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
    undefined;
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
            isPrebooking: c.isPrebooking,
            prebookingDeliveryDays: c.prebookingDeliveryDays,
          })),
          subtotal,
          total: subtotal,
          paymentStatus: 'pending' as const,
          orderStatus: 'pending' as const,
          date: new Date().toISOString().split('T')[0],
          isPrebookingOrder: hasPrebookingItems,
          expectedDeliveryDate,
        };

        console.log('Checkout - token from store:', token);
        console.log('Checkout - token from localStorage:', typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        if (!authToken) {
          toast({ title: 'Please login to place order', variant: 'destructive' });
          setProcessing(false);
          router.push('/login');
          return;
        }

        const scriptOk = await loadRazorpayScript();
        if (!scriptOk) {
          toast({ title: 'Razorpay failed to load', description: 'Please try again.', variant: 'destructive' });
          setProcessing(false);
          return;
        }

        const createOrderRes = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: subtotal,
            receipt: orderPayload.orderNumber,
          }),
        });
        const createOrderData = await createOrderRes.json();
        if (!createOrderRes.ok || !createOrderData?.success) {
          const msg = createOrderData?.error || 'Failed to initialize payment';
          toast({ title: msg, variant: 'destructive' });
          setProcessing(false);
          return;
        }

        const { orderId, amount, currency, keyId } = createOrderData.data;

        const options = {
          key: keyId,
          amount,
          currency,
          name: 'Morpankh Saree',
          description: `${hasPrebookingItems ? 'Prebooking Order' : 'Order'} ${orderPayload.orderNumber}${expectedDeliveryDate ? ` - Delivery by ${expectedDeliveryDate}` : ''}`,
          order_id: orderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          notes: {
            orderNumber: orderPayload.orderNumber,
          },
          theme: {
            color: '#7c3aed',
          },
          handler: async (response: unknown) => {
            try {
              const r = response as Partial<RazorpaySuccessResponse>;
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(r),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData?.success) {
                const msg = verifyData?.error || 'Payment verification failed';
                toast({ title: msg, variant: 'destructive' });
                setProcessing(false);
                return;
              }

              const paidOrderPayload = {
                ...orderPayload,
                paymentStatus: 'paid' as const,
                orderStatus: 'confirmed' as const,
                razorpayOrderId: typeof r.razorpay_order_id === 'string' ? r.razorpay_order_id : undefined,
                razorpayPaymentId: typeof r.razorpay_payment_id === 'string' ? r.razorpay_payment_id : undefined,
              };

              console.log('POST /api/orders authToken:', authToken);
              const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(paidOrderPayload),
              });

              const data = await res.json();
              if (!res.ok || !data?.success) {
                const msg = data?.error || 'Failed to place order';
                toast({ title: msg, variant: 'destructive' });
                setProcessing(false);
                return;
              }

              clearCart();
              setProcessing(false);
              router.push('/order-success');
            } catch {
              toast({ title: 'Order failed', description: 'Network error. Please try again.', variant: 'destructive' });
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            },
          },
        };

        if (!window.Razorpay || typeof window.Razorpay !== 'function') {
          toast({ title: 'Razorpay is not available', description: 'Please refresh and try again.', variant: 'destructive' });
          setProcessing(false);
          return;
        }

        const RazorpayCtor = window.Razorpay as new (opts: unknown) => {
          open: () => void;
          on: (event: string, cb: (resp: unknown) => void) => void;
        };

        const rz = new RazorpayCtor(options);
        rz.on('payment.failed', (resp: unknown) => {
          const r = resp as RazorpayFailureResponse;
          const msg = r?.error?.description || 'Payment failed';
          toast({ title: msg, variant: 'destructive' });
          setProcessing(false);
        });
        rz.open();
        return;

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
            {/* Prebooking Alert */}
            {hasPrebookingItems && (
              <Alert className="mb-6 bg-purple-50 border-2 border-purple-200 text-purple-800">
                <Package className="h-4 w-4" />
                <AlertDescription className="font-bold">
                  Prebooking Order
                </AlertDescription>
                <AlertDescription className="text-sm mt-1">
                  This order contains prebooking items. Expected delivery: {maxDeliveryDays}-{maxDeliveryDays + 5} days
                </AlertDescription>
              </Alert>
            )}
            
            <Alert variant="destructive" className="mb-6 bg-red-50 border-2 border-red-200 text-red-800 animate-pulse">
              <AlertDescription className="font-bold text-lg">
                &#x26a0; IMPORTANT: 90 Rupees Additional Charge
              </AlertDescription>
              <AlertDescription className="text-sm mt-2">
                Please ensure all details are filled correctly. Incorrect information will result in a &#x20b9;90 charge.
              </AlertDescription>
            </Alert>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
              {cart.map((item) => (
                <div key={`${item.productId}-${item.color}`} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="font-medium">{item.name} &times; {item.quantity}</div>
                    {item.isPrebooking && (
                      <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                        <Calendar className="h-3 w-3" />
                        Prebook ({item.prebookingDeliveryDays || 10}-{(item.prebookingDeliveryDays || 10) + 5} days)
                      </div>
                    )}
                  </div>
                  <span>&#x20b9;{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-primary">&#x20b9;{subtotal.toLocaleString()}</span>
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
