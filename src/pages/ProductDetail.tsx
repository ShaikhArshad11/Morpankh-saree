// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
// import Image from 'next/image';
// import PublicLayout from '@/components/PublicLayout';
// import ProductCard from '@/components/ProductCard';
// import { useStore } from '@/store/useStore';
// import { toast } from '@/hooks/use-toast';

// const ProductDetail = () => {
//   const params = useParams<{ slug: string }>();
//   const slug = params?.slug;
//   const router = useRouter();
//   const { products, addToCart, toggleWishlist, wishlist } = useStore();
//   const product = products.find((p) => p.slug === slug);
//   const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
//   const [selectedSize, setSelectedSize] = useState('');
//   const [quantity, setQuantity] = useState(1);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [mainImageSrc, setMainImageSrc] = useState(product?.images?.[0] || '/placeholder.svg');
//   const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

//   if (!product) return (
//     <PublicLayout>
//       <div className="container mx-auto px-4 py-20 text-center">
//         <h1 className="text-2xl font-display font-bold">Product not found</h1>
//       </div>
//     </PublicLayout>
//   );

//   const isWished = wishlist.includes(product.id);
//   const discount = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
//   const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

//   useEffect(() => {
//     const nextSrc = product.images?.[selectedImage] || '/placeholder.svg';
//     setMainImageSrc(nextSrc);
//   }, [product.images, selectedImage]);

//   const handleAddToCart = () => {
//     addToCart({ productId: product.id, name: product.name, image: product.images[0], price: product.price, color: selectedColor, size: selectedSize, quantity });
//     toast({ title: 'Added to cart!', description: `${product.name} (${selectedColor})` });
//   };

//   const handleBuyNow = () => {
//     handleAddToCart();
//     router.push('/checkout');
//   };

//   return (
//     <PublicLayout>
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
//           {/* Images */}
//           <div>
//             <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4">
//               <div className="relative w-full h-full">
//                 <Image
//                   src={mainImageSrc}
//                   alt={product.name}
//                   fill
//                   priority
//                   quality={75}
//                   onError={() => setMainImageSrc('/placeholder.svg')}
//                   sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 520px"
//                   className="object-cover"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-3">
//               {product.images.map((img, i) => (
//                 <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary' : 'border-border'}`}>
//                   <div className="relative w-full h-full">
//                     <Image
//                       src={thumbErrors[i] ? '/placeholder.svg' : img}
//                       alt=""
//                       fill
//                       quality={60}
//                       onError={() => setThumbErrors((prev) => ({ ...prev, [i]: true }))}
//                       sizes="80px"
//                       className="object-cover"
//                     />
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Info */}
//           <div>
//             <h1 className="font-display text-2xl md:text-3xl font-bold">{product.name}</h1>
//             <div className="flex items-center gap-3 mt-3">
//               <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
//               {product.comparePrice > product.price && (
//                 <>
//                   <span className="text-lg text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
//                   <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">-{discount}%</span>
//                 </>
//               )}
//             </div>

//             {/* Colors */}
//             <div className="mt-6">
//               <h3 className="text-sm font-medium mb-3">Color: {selectedColor}</h3>
//               <div className="flex gap-2">
//                 {product.colors.map((color) => (
//                   <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 rounded-lg text-sm border-2 transition-colors ${selectedColor === color ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
//                     {color}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Sizes */}
//             {product.sizes && product.sizes.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="text-sm font-medium mb-3">Size</h3>
//                 <div className="flex gap-2">
//                   {product.sizes.map((size) => (
//                     <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-lg text-sm border-2 transition-colors ${selectedSize === size ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
//                       {size}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Quantity */}
//             <div className="mt-6">
//               <h3 className="text-sm font-medium mb-3">Quantity</h3>
//               <div className="flex items-center gap-3">
//                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"><Minus className="h-4 w-4" /></button>
//                 <span className="w-12 text-center font-medium">{quantity}</span>
//                 <button onClick={() => setQuantity(quantity + 1)} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"><Plus className="h-4 w-4" /></button>
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-3 mt-8">
//               <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 flex-1">
//                 <ShoppingCart className="h-4 w-4" /> Add to Cart
//               </button>
//               <button onClick={handleBuyNow} className="btn-secondary flex-1">
//                 Buy Now
//               </button>
//               <button onClick={() => { toggleWishlist(product.id); toast({ title: isWished ? 'Removed' : 'Added to wishlist' }); }} className={`p-3 rounded-lg border-2 transition-colors ${isWished ? 'border-destructive text-destructive' : 'border-border hover:border-destructive hover:text-destructive'}`}>
//                 <Heart className="h-5 w-5" fill={isWished ? 'currentColor' : 'none'} />
//               </button>
//             </div>

//             {/* Description */}
//             <div className="mt-8 space-y-4">
//               <div>
//                 <h3 className="font-display text-lg font-semibold mb-2">Description</h3>
//                 <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
//               </div>
//               <div>
//                 <h3 className="font-display text-lg font-semibold mb-2">Fabric Details</h3>
//                 <p className="text-muted-foreground text-sm">{product.fabric}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Related */}
//         {relatedProducts.length > 0 && (
//           <div className="mt-16">
//             <h2 className="section-title mb-8">Related Products</h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
//               {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
//             </div>
//           </div>
//         )}
//       </div>
//     </PublicLayout>
//   );
// };

// export default ProductDetail;



/**
 * ============================================================
 * PAGE: Product Detail
 * File: src/pages/ProductDetail.tsx
 * ============================================================
 *
 * KEY FEATURES:
 * ─────────────────────────────────────────────────────────
 * ✅ Color switching with per-color image gallery
 * ✅ Only selected color's images loaded (performance)
 * ✅ Out-of-stock colors disabled
 * ✅ Low-stock warning (≤ 5 units)
 * ✅ Hover-to-zoom on main image
 * ✅ Next.js <Image /> for all images
 * ✅ Cart + Wishlist integration with existing store
 * ✅ Breadcrumb navigation
 * ✅ "Related products" section
 * ✅ Smooth color-switch animation
 * ─────────────────────────────────────────────────────────
 *
 * USAGE (Next.js App Router):
 * Place this at: src/app/product/[slug]/page.tsx  →  export default function Page() { return <ProductDetail /> }
 *
 * OR if you want server-side fetch:
 * See the SSR version at the bottom of this file.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Tag,
  Ruler,
  Shirt,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

// ── Sub-components (paste from their own files or inline) ──
// import ProductGallery from './ProductGallery';
// import ColorSwatches from './ColorSwatches';

import ProductGallery from '@/components/ProductGallery';
import ColorSwatches from '@/components/ColorSwatches';

// ──────────────────────────────────────────
// Types (matching API response)
// ──────────────────────────────────────────

interface ProductColor {
  colorName: string;
  stock: number;
  images: string[];
  isOutOfStock: boolean;
}

interface ProductDetail {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  basePrice: number;
  compareAtPrice?: number;
  discountPercent?: number;
  shortDescription?: string;
  description?: string;
  fabricType?: string;
  sareeLength?: string;
  blouseIncluded: boolean;
  tags: string[];
  colors: ProductColor[];
  isSale: boolean;
  rating?: number;
  reviewCount?: number;
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const router = useRouter();

  // ── Global store ─────────────────────────────────────
  const { addToCart, toggleWishlist, wishlist, products: storeProducts } = useStore();

  // ── Local state ──────────────────────────────────────
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);   // ← core state
  const [isChangingColor, setIsChangingColor] = useState(false);  // animation flag
  const [quantity, setQuantity] = useState(1);

  // ── Fetch product from API ───────────────────────────
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  };

  const {
    data: product,
    error,
    isLoading: loading,
  } = useSWR<ProductDetail>(slug ? `/api/products/${slug}` : null, fetcher, {
    dedupingInterval: 60_000,
    revalidateOnFocus: false,
  });

  const isWished = product ? wishlist.includes(product._id) : false;

  useEffect(() => {
    if (!product) return;
    const firstAvailable = product.colors.findIndex((c) => !c.isOutOfStock);
    setSelectedColorIdx(firstAvailable >= 0 ? firstAvailable : 0);
    setQuantity(1);
  }, [product]);

  // ── Color switch handler ─────────────────────────────
  const handleColorChange = useCallback((idx: number) => {
    if (idx === selectedColorIdx) return;
    setIsChangingColor(true);
    setTimeout(() => {
      setSelectedColorIdx(idx);
      setQuantity(1);                          // reset qty on color change
      setIsChangingColor(false);
    }, 200);                                   // short fade-out then update
  }, [selectedColorIdx]);

  // ── Derived values ───────────────────────────────────
  const selectedColor = product?.colors[selectedColorIdx];
  const currentImages = selectedColor?.images || [];
  const totalStock = selectedColor?.stock ?? 0;
  const isOutOfStock = selectedColor?.isOutOfStock ?? false;

  // ── Cart handler ─────────────────────────────────────
  const handleAddToCart = () => {
    if (!product || !selectedColor || isOutOfStock) return;
    addToCart({
      productId: product._id,
      name: product.name,
      image: selectedColor.images[0] || '/placeholder.svg',
      price: product.basePrice,
      color: selectedColor.colorName,
      quantity,
    });
    toast({
      title: 'Added to cart!',
      description: `${product.name} (${selectedColor.colorName}) × ${quantity}`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  // ── Related products from store ──────────────────────
  const relatedProducts = storeProducts
    .filter((p) => !p.hidden && p.category === product?.category && p.id !== product?._id)
    .slice(0, 4);

  // ── Loading skeleton ─────────────────────────────────
  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
            <div className="aspect-[3/4] bg-muted rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-10 bg-muted rounded w-1/2" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-11 h-11 bg-muted rounded-full" />
                ))}
              </div>
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Product not found</h1>
          <p className="text-muted-foreground mb-6">{error instanceof Error ? error.message : (error ? String(error) : 'This product does not exist.')}</p>
          <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-6">

        {/* ── Breadcrumb ──────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/categories`}
            className="hover:text-primary transition-colors capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main Product Grid ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">

          {/* LEFT: Image Gallery */}
          <div>
            <ProductGallery
              images={currentImages}
              productName={product.name}
              isChangingColor={isChangingColor}
            />
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col gap-5">

            {/* Title & SKU */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {product.isSale && product.discountPercent && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded">
                    {product.discountPercent}% OFF
                  </span>
                )}
                <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-muted-foreground text-sm mt-2">{product.shortDescription}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                ₹{product.basePrice.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                <span className="text-sm text-green-600 font-semibold">
                  Save ₹{(product.compareAtPrice - product.basePrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <hr className="border-border" />

            {/* ── COLOR SWITCHER ─────────────────────── */}
            {/* This is the core feature — color changes update images instantly */}
            <ColorSwatches
              colors={product.colors}
              selectedIndex={selectedColorIdx}
              onSelect={handleColorChange}      // ← triggers gallery update
              variantFirstImages={product.colors.map((c) => c.images?.[0])}
            />

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(totalStock, q + 1))}
                  disabled={quantity >= totalStock || isOutOfStock}
                  className="p-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {!isOutOfStock && (
                  <span className="text-xs text-muted-foreground">
                    {totalStock} available
                  </span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm
                  transition-all duration-200
                  ${isOutOfStock
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/25'
                  }
                `}
              >
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm
                  transition-all duration-200
                  ${isOutOfStock
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-secondary text-secondary-foreground hover:opacity-90'
                  }
                `}
              >
                Buy Now
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product._id);
                  toast({
                    title: isWished ? 'Removed from wishlist' : 'Added to wishlist',
                  });
                }}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200
                  ${isWished
                    ? 'border-destructive text-destructive bg-destructive/5'
                    : 'border-border text-muted-foreground hover:border-destructive hover:text-destructive'
                  }
                `}
              >
                <Heart className="h-5 w-5" fill={isWished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 py-3 border border-border rounded-xl px-4">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="h-5 w-5 text-primary" />
                <p className="text-xs font-medium">Free Delivery</p>
                <p className="text-[10px] text-muted-foreground">Orders over ₹5,000</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="text-xs font-medium">Secure Payment</p>
                <p className="text-[10px] text-muted-foreground">100% secure</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RefreshCw className="h-5 w-5 text-primary" />
                <p className="text-xs font-medium">Exchange</p>
                <p className="text-[10px] text-muted-foreground">Opening video req.</p>
              </div>
            </div>

            {/* Product Specs */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-semibold">Product Specifications</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.category && (
                  <SpecRow icon={<Tag className="h-3.5 w-3.5" />} label="Category" value={product.category} />
                )}
                {product.fabricType && (
                  <SpecRow icon={<Shirt className="h-3.5 w-3.5" />} label="Fabric" value={product.fabricType} />
                )}
                {product.sareeLength && (
                  <SpecRow icon={<Ruler className="h-3.5 w-3.5" />} label="Length" value={product.sareeLength} />
                )}
                <SpecRow
                  icon={<Package className="h-3.5 w-3.5" />}
                  label="Blouse"
                  value={product.blouseIncluded ? 'Included' : 'Not Included'}
                />
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Product Description ──────────────────────── */}
        {product.description && (
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="font-display text-xl font-bold mb-4">Product Description</h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* ── Related Products ─────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-center mb-2">You May Also Like</h2>
            <p className="text-center text-muted-foreground text-sm mb-8">
              More from {product.category}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

// ── Small helper component ───────────────────────────────
function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 bg-muted/50 rounded-lg">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ALTERNATIVE: Server-Side Rendered version (for SEO)
// ══════════════════════════════════════════════════════════════
// If you want SEO-optimized server rendering, create a separate
// wrapper at: src/app/product/[slug]/page.tsx
//
// ```tsx
// import { Metadata } from 'next';
// import ProductDetailPage from '@/pages/ProductDetail';
//
// export async function generateMetadata(
//   { params }: { params: { slug: string } }
// ): Promise<Metadata> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.slug}`);
//   if (!res.ok) return { title: 'Product Not Found' };
//   const product = await res.json();
//   return {
//     title: `${product.name} | Morpankh Saree`,
//     description: product.shortDescription,
//     openGraph: {
//       images: [product.colors[0]?.images[0]],
//     },
//   };
// }
//
// export default function Page() {
//   return <ProductDetailPage />;
// }
// ```