import Link from 'next/link';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import Image from 'next/image';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { products, wishlist, toggleWishlist, addToCart } = useStore();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">Save your favourite sarees here</p>
          <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="section-title mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistProducts.map((p) => (
            <div key={p.id} className="bg-card rounded-xl overflow-hidden border border-border card-hover">
              <Link href={`/product/${p.slug}`} className="block aspect-[3/4] overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={p.images[0] || '/placeholder.svg'}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="p-4">
                <h3 className="font-medium text-sm truncate">{p.name}</h3>
                <p className="text-primary font-bold mt-1">₹{p.price.toLocaleString()}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { addToCart({ productId: p.id, name: p.name, image: p.images[0], price: p.price, color: p.colors[0], quantity: 1 }); toast({ title: 'Added to cart' }); }} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
                    <ShoppingCart className="h-3 w-3" /> Add to Cart
                  </button>
                  <button onClick={() => { toggleWishlist(p.id); toast({ title: 'Removed from wishlist' }); }} className="p-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Wishlist;
