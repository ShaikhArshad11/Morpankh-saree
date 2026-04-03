import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import PublicLayout from '@/components/PublicLayout';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const router = useRouter();
  const { products, addToCart, toggleWishlist, wishlist } = useStore();
  const product = products.find((p) => p.slug === slug);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [mainImageSrc, setMainImageSrc] = useState(product?.images?.[0] || '/placeholder.svg');
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

  if (!product) return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display font-bold">Product not found</h1>
      </div>
    </PublicLayout>
  );

  const isWished = wishlist.includes(product.id);
  const discount = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  useEffect(() => {
    const nextSrc = product.images?.[selectedImage] || '/placeholder.svg';
    setMainImageSrc(nextSrc);
  }, [product.images, selectedImage]);

  const handleAddToCart = () => {
    addToCart({ productId: product.id, name: product.name, image: product.images[0], price: product.price, color: selectedColor, size: selectedSize, quantity });
    toast({ title: 'Added to cart!', description: `${product.name} (${selectedColor})` });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4">
              <div className="relative w-full h-full">
                <Image
                  src={mainImageSrc}
                  alt={product.name}
                  fill
                  priority
                  quality={75}
                  onError={() => setMainImageSrc('/placeholder.svg')}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 520px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary' : 'border-border'}`}>
                  <div className="relative w-full h-full">
                    <Image
                      src={thumbErrors[i] ? '/placeholder.svg' : img}
                      alt=""
                      fill
                      quality={60}
                      onError={() => setThumbErrors((prev) => ({ ...prev, [i]: true }))}
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
              {product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">-{discount}%</span>
                </>
              )}
            </div>

            {/* Colors */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Color: {selectedColor}</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 rounded-lg text-sm border-2 transition-colors ${selectedColor === color ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-3">Size</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-lg text-sm border-2 transition-colors ${selectedSize === size ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 flex-1">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-secondary flex-1">
                Buy Now
              </button>
              <button onClick={() => { toggleWishlist(product.id); toast({ title: isWished ? 'Removed' : 'Added to wishlist' }); }} className={`p-3 rounded-lg border-2 transition-colors ${isWished ? 'border-destructive text-destructive' : 'border-border hover:border-destructive hover:text-destructive'}`}>
                <Heart className="h-5 w-5" fill={isWished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Description */}
            <div className="mt-8 space-y-4">
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">Fabric Details</h3>
                <p className="text-muted-foreground text-sm">{product.fabric}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ProductDetail;
