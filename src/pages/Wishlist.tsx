import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { products, wishlist, toggleWishlist, addToCart } = useStore();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <PublicLayout>
        <style>{`
          @keyframes float1{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.03)}}
          @keyframes float2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(18px) scale(0.97)}}
          @keyframes float3{0%,100%{transform:translateX(0)}50%{transform:translateX(12px)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          @keyframes bannerReveal{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
          @keyframes zoomPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
          @keyframes spinSlow{to{transform:rotate(360deg)}}
          @keyframes heartPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
          .banner-reveal{animation:bannerReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards}
          .fade-up-1{opacity:0;animation:fadeUp 0.6s ease 0.1s forwards}
          .fade-up-2{opacity:0;animation:fadeUp 0.6s ease 0.25s forwards}
          .fade-up-3{opacity:0;animation:fadeUp 0.6s ease 0.4s forwards}
          .wishlist-card:hover{transform:translateY(-8px) scale(1.03) rotate-1;box-shadow:0 24px 56px hsl(var(--primary)/0.15)}
          .wishlist-card{transition:transform 0.3s ease,box-shadow 0.3s ease}
          .heart-pulse{animation:heartPulse 2s ease-in-out infinite}
          .logo-pulse{animation:zoomPulse 4s ease-in-out infinite}
          .spin-ring{animation:spinSlow 22s linear infinite}
        `}</style>

        <div className="min-h-screen relative overflow-hidden">
          {/* background gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(160deg, hsl(var(--primary)/0.06) 0%, hsl(var(--background)) 50%, hsl(var(--secondary)/0.08) 100%)',
            }}
          />

          {/* floating orbs */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 380, height: 380, top: -80, right: -100,
              background: 'radial-gradient(circle, hsl(var(--primary)/0.12), transparent 70%)',
              animation: 'float1 10s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 260, height: 260, bottom: 60, left: -80,
              background: 'radial-gradient(circle, hsl(var(--secondary)/0.10), transparent 70%)',
              animation: 'float2 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 180, height: 180, top: '40%', left: '5%',
              background: 'radial-gradient(circle, hsl(var(--primary)/0.07), transparent 70%)',
              animation: 'float3 9s ease-in-out infinite',
            }}
          />

          {/* BANNER */}
          <div className="relative w-full overflow-hidden banner-reveal" style={{ height: 260 }}>
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(160deg, hsl(var(--primary)/0.95), hsl(168 60% 18%))',
              }}
            />
            {/* dot grid */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />
            {/* floating shapes */}
            <div className="absolute" style={{ top: '12%', left: '8%', animation: 'float1 8s ease-in-out infinite' }}>
              <div className="w-16 h-16 rounded-2xl rotate-12 border-2 border-white/20" />
            </div>
            <div className="absolute" style={{ top: '50%', right: '10%', animation: 'float2 9s ease-in-out infinite' }}>
              <div className="w-12 h-12 rounded-full border-2 border-white/20" />
            </div>
            <div className="absolute" style={{ bottom: '15%', left: '18%', animation: 'float3 7s ease-in-out infinite' }}>
              <div className="w-8 h-8 rounded-lg rotate-45 border border-white/20" />
            </div>
            <div className="absolute" style={{ top: '20%', right: '25%', animation: 'spinSlow 18s linear infinite' }}>
              <div className="w-20 h-20 rounded-full border border-dashed border-white/15" />
            </div>
            {/* banner text */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6 text-center">
              <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
                Morpankh Saree · My Wishlist
              </p>
              <h2 className="text-4xl font-bold mb-2">My Wishlist</h2>
              <p className="text-white/70 text-sm max-w-md">
                Your curated collection of favorite sarees, saved for future shopping.
              </p>
            </div>
          </div>

          {/* DRAGGABLE CONTENT */}
          <div
            className="container mx-auto px-4 py-12 relative z-10"
          >
            {/* page pill + title */}
            <div className="text-center mb-14 fade-up-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium tracking-wide mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Wishlist Management
              </div>
              <h1 className="text-5xl font-bold mb-4" style={{ color: 'hsl(var(--primary))' }}>
                
              </h1>
            </div>

            {/* EMPTY STATE */}
            <div className="max-w-2xl mx-auto text-center fade-up-2">
              <div className="relative">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-primary/20" style={{ background: 'hsl(var(--primary)/0.08)' }}>
                  <Heart className="w-16 h-16 heart-pulse" style={{ color: 'hsl(var(--primary))' }} />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'hsl(var(--primary))' }}>Your wishlist is empty</h2>
              <p className="text-muted-foreground text-lg mb-8">Save your favourite sarees here for easy access later</p>
              <Link href="/products" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all hover:scale-105 font-medium shadow-lg">
                <ShoppingCart className="w-5 h-5" />
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <style>{`
        @keyframes float1{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.03)}}
        @keyframes float2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(18px) scale(0.97)}}
        @keyframes float3{0%,100%{transform:translateX(0)}50%{transform:translateX(12px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bannerReveal{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        @keyframes zoomPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes heartPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
        .banner-reveal{animation:bannerReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards}
        .fade-up-1{opacity:0;animation:fadeUp 0.6s ease 0.1s forwards}
        .fade-up-2{opacity:0;animation:fadeUp 0.6s ease 0.25s forwards}
        .fade-up-3{opacity:0;animation:fadeUp 0.6s ease 0.4s forwards}
        .wishlist-card:hover{transform:translateY(-8px) scale(1.03) rotate-1;box-shadow:0 24px 56px hsl(var(--primary)/0.15)}
        .wishlist-card{transition:transform 0.3s ease,box-shadow 0.3s ease}
        .heart-pulse{animation:heartPulse 2s ease-in-out infinite}
        .logo-pulse{animation:zoomPulse 4s ease-in-out infinite}
        .spin-ring{animation:spinSlow 22s linear infinite}
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(160deg, hsl(var(--primary)/0.06) 0%, hsl(var(--background)) 50%, hsl(var(--secondary)/0.08) 100%)',
          }}
        />

        {/* floating orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 380, height: 380, top: -80, right: -100,
            background: 'radial-gradient(circle, hsl(var(--primary)/0.12), transparent 70%)',
            animation: 'float1 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 260, height: 260, bottom: 60, left: -80,
            background: 'radial-gradient(circle, hsl(var(--secondary)/0.10), transparent 70%)',
            animation: 'float2 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 180, height: 180, top: '40%', left: '5%',
            background: 'radial-gradient(circle, hsl(var(--primary)/0.07), transparent 70%)',
            animation: 'float3 9s ease-in-out infinite',
          }}
        />

        {/* BANNER */}
        <div className="relative w-full overflow-hidden banner-reveal" style={{ height: 260 }}>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(160deg, hsl(var(--primary)/0.95), hsl(168 60% 18%))',
            }}
          />
          {/* dot grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          {/* floating shapes */}
          <div className="absolute" style={{ top: '12%', left: '8%', animation: 'float1 8s ease-in-out infinite' }}>
            <div className="w-16 h-16 rounded-2xl rotate-12 border-2 border-white/20" />
          </div>
          <div className="absolute" style={{ top: '50%', right: '10%', animation: 'float2 9s ease-in-out infinite' }}>
            <div className="w-12 h-12 rounded-full border-2 border-white/20" />
          </div>
          <div className="absolute" style={{ bottom: '15%', left: '18%', animation: 'float3 7s ease-in-out infinite' }}>
            <div className="w-8 h-8 rounded-lg rotate-45 border border-white/20" />
          </div>
          <div className="absolute" style={{ top: '20%', right: '25%', animation: 'spinSlow 18s linear infinite' }}>
            <div className="w-20 h-20 rounded-full border border-dashed border-white/15" />
          </div>
          {/* banner text */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6 text-center">
            <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
              Morpankh Saree · My Wishlist
            </p>
            <h2 className="text-4xl font-bold mb-2">My Wishlist</h2>
            <p className="text-white/70 text-sm max-w-md">
              Your curated collection of favorite sarees, saved for future shopping.
            </p>
          </div>
        </div>

        {/* DRAGGABLE CONTENT */}
        <div
          className="container mx-auto px-4 py-12 relative z-10"
        >
          {/* page pill + title */}
          <div className="text-center mb-14 fade-up-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Wishlist Management
            </div>
            <h1 className="text-5xl font-bold mb-4" style={{ color: 'hsl(var(--primary))' }}>
              
            </h1>
          </div>

          {/* WISHLIST PRODUCTS GRID */}
          <div className="max-w-6xl mx-auto mb-10 fade-up-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((p, index) => (
                <div 
                  key={p.id} 
                  className="wishlist-card rounded-2xl overflow-hidden border border-border/60 shadow-xl backdrop-blur-xl"
                  style={{ 
                    background: 'hsl(var(--card)/0.85)',
                    animationDelay: `${0.6 + index * 0.1}s`,
                    borderLeft: '3px solid hsl(var(--primary)/0.5)'
                  }}
                >
                  <Link href={`/product/${p.slug}`} className="block aspect-[3/4] overflow-hidden group">
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--primary)/0.9)' }}>
                      <Heart className="w-5 h-5 text-white heart-pulse" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-medium text-sm truncate mb-2">{p.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-lg" style={{ color: 'hsl(var(--primary))' }}>₹{p.price.toLocaleString()}</p>
                      {p.comparePrice > p.price && (
                        <p className="text-muted-foreground text-xs line-through">₹{p.comparePrice.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          addToCart({ productId: p.id, name: p.name, image: p.images[0], price: p.price, color: p.colors[0], quantity: 1 });
                          toast({ title: 'Added to cart' });
                        }} 
                        className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-primary/90 transition-all hover:scale-105"
                      >
                        <ShoppingCart className="h-3 w-3" /> Add to Cart
                      </button>
                      <button 
                        onClick={() => { 
                          toggleWishlist(p.id); 
                          toast({ title: 'Removed from wishlist' }); 
                        }} 
                        className="p-2 border border-destructive text-destructive rounded-xl hover:bg-destructive/10 transition-all hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Wishlist;
