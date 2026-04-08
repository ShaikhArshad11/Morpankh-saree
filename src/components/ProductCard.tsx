import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Product } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWished = wishlist.includes(product.id);
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const [imageSrc, setImageSrc] = useState(product.images[0] || '/placeholder.svg');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImageSrc(product.images[0] || '/placeholder.svg');
    setImgLoaded(false);
  }, [product.id, product.images]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsNearViewport(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin: '300px', threshold: 0.01 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      comparePrice: product.comparePrice,
      color: product.colors[0],
      quantity: 1,
    });
    toast({ title: 'Added to cart', description: product.name });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast({ title: isWished ? 'Removed from wishlist' : 'Added to wishlist', description: product.name });
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div ref={containerRef} className="bg-card rounded-xl overflow-hidden card-hover border border-border">
        <div className="relative aspect-[3/4] overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          {isNearViewport && (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              quality={60}
              onLoadingComplete={() => setImgLoaded(true)}
              onError={() => {
                setImageSrc('/placeholder.svg');
                setImgLoaded(true);
              }}
              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          {/* Sale badge */}
          {discount > 0 && product.isSale && (
            <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
              {discount}% OFF
            </span>
          )}
          {!product.isSale && discount > 0 && (
            <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
              NEW
            </span>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button onClick={handleAddToCart} className="bg-card text-foreground p-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors" title="Add to Cart">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button onClick={handleToggleWishlist} className={`p-3 rounded-full transition-colors ${isWished ? 'bg-destructive text-destructive-foreground' : 'bg-card text-foreground hover:bg-destructive hover:text-destructive-foreground'}`} title="Wishlist">
              <Heart className="h-5 w-5" fill={isWished ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-foreground text-sm truncate">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary font-bold">₹{product.price.toLocaleString()}</span>
            {product.comparePrice > product.price && (
              <span className="text-muted-foreground text-sm line-through">₹{product.comparePrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
