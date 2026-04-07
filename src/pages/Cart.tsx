import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart } = useStore();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some beautiful sarees to your cart</p>
          <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="section-title mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="bg-card rounded-xl p-4 border border-border flex gap-4">
                <div className="relative w-20 h-24 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Color: {item.color}{item.size ? ` | Size: ${item.size}` : ''}</p>
                  <p className="text-primary font-bold mt-1">₹{item.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQuantity(item.productId, item.color, item.quantity - 1)} className="p-1 border border-border rounded hover:bg-muted transition-colors"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.productId, item.color, item.quantity + 1)} className="p-1 border border-border rounded hover:bg-muted transition-colors"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId, item.color)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-primary">Free</span></div>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-primary">₹{subtotal.toLocaleString()}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full block text-center mt-6">Proceed to Checkout</Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Cart;
