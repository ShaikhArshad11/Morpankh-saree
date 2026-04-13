import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Plus, Send } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';
import { Category } from '@/data/mockData';

type ApprovedReviewItem = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
  createdAt: string | null;
};

const Index = () => {
  const products = useStore((s) => s.products);
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const userName = useStore((s) => s.userName);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [approvedReviews, setApprovedReviews] = useState<ApprovedReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadApprovedReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch('/api/reviews?approved=true');
        const data = await res.json();
        if (res.ok) {
          setApprovedReviews(data.reviews || []);
        }
      } catch {
        // ignore
      } finally {
        setReviewsLoading(false);
      }
    };

    loadApprovedReviews();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data)) {
          setCategories(result.data as Category[]);
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const visibleProducts = products.filter((p) => !p.hidden);
  const bestSellers = visibleProducts.filter((p) => p.featured);
  const newArrivals = visibleProducts.filter((p) => p.isNew);
  const saleProducts = visibleProducts.filter((p) => p.isSale);
  const premiumSarees = visibleProducts.filter((p) => p.isPremium);
  const trendingSarees = visibleProducts.filter((p) => p.isTrending);
  const handleReviewSubmit = async () => {
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewForm.name,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Review submitted!', description: 'It will appear after admin approval.' });
        setReviewForm({ name: isLoggedIn ? userName : '', rating: 5, comment: '' });
        setReviewModal(false);
      } else {
        toast({ title: data.error || 'Failed to submit review', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to submit review', variant: 'destructive' });
    }
  };

  const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );

  const ProductSection = ({ title, subtitle, items, filterParam, bg }: { title: string; subtitle: string; items: typeof products; filterParam: string; bg?: string }) => {
    const show = items.slice(0, 4);
    if (items.length === 0) return null;
    const Wrapper = bg ? 'section' : 'section';
    return (
      <section className={`py-12 md:py-16 ${bg || ''}`}>
        <div className="container mx-auto px-4">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {show.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-8">
            <Link href={`/products?highlight=${filterParam}`} className="btn-outline-primary inline-flex items-center gap-2">
              View More <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="h-[400px] skeleton-loading mb-12 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] skeleton-loading rounded-xl" />
                <div className="h-4 skeleton-loading w-3/4" />
                <div className="h-4 skeleton-loading w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="relative z-10 h-full flex items-center justify-start text-center">
         <div className="max-w-2xl px-4">

  {/* Heading */}
  <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight md:leading-[1.2] max-w-xl">
    परंपरेचा मोरपंखी स्पर्श,
    <br className="hidden md:block" />
    <span className="block mt-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
      सौंदर्याची नवी ओळख
    </span>
  </h1>

  {/* Subtext */}
  <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
    Handcrafted Banarasi, Paithani, Kanjivaram and more — 
    <span className="text-white font-medium"> timeless elegance</span> for every occasion.
  </p>

  {/* Button */}
  <Link
    href="/products"
    className="group inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    Shop Now
    <span className="transition-transform duration-300 group-hover:translate-x-1">
      →
    </span>
  </Link>

</div>
        </div>
      </section>

      {/* Category Carousel */}
      <Section title="Shop by Category" subtitle="Explore our curated collection">
        <div className="relative overflow-hidden">
          <style>{`
            @keyframes categoriesMarqueeLTR {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0%); }
            }
          `}</style>
          <div
            className="group flex w-max gap-3 sm:gap-4"
          >
            <div
              className="flex w-max gap-3 sm:gap-4 group-hover:[animation-play-state:paused]"
              style={{ animation: 'categoriesMarqueeLTR 28s linear infinite' }}
            >
              {categories.concat(categories).map((cat, idx) => (
                <Link
                  key={`${cat.id}-${idx}`}
                  href={`/products?category=${cat.slug}`}
                  className="group/item flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px] lg:w-[170px] relative aspect-square rounded-full overflow-hidden card-hover border border-border/30"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent flex items-end justify-center p-3">
                    <span className="text-background font-display font-semibold text-xs sm:text-sm text-center leading-tight">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <ProductSection title="Best Sellers" subtitle="Our most loved sarees" items={bestSellers} filterParam="featured" />
      <ProductSection title="New Arrivals" subtitle="Fresh additions to our collection" items={newArrivals} filterParam="new" />
      <ProductSection title="🔥 Sale" subtitle="Grab these deals before they're gone" items={saleProducts} filterParam="sale" bg="bg-muted" />
      <ProductSection title="Premium Sarees" subtitle="Luxury craftsmanship for special occasions" items={premiumSarees} filterParam="premium" />
      <ProductSection title="Trending Sarees" subtitle="What's popular right now" items={trendingSarees} filterParam="trending" />

      {/* Reviews */}
      <section className="py-12 bg-muted">
        <style>{`
          @keyframes reviewsMarqueeLTR {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
        `}</style>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="section-title">Customer Reviews</h2>
          </div>
          <div className="text-center mb-8">
            <button onClick={() => { setReviewForm({ name: isLoggedIn ? userName : '', rating: 5, comment: '' }); setReviewModal(true); }} className="btn-outline-primary inline-flex items-center gap-2 text-sm py-2 px-4">
              <Plus className="h-4 w-4" /> Add Review
            </button>
          </div>
          {reviewsLoading ? (
            <div className="text-center text-sm text-muted-foreground">Loading reviews...</div>
          ) : approvedReviews.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">No reviews yet.</div>
          ) : (
            <div className="relative overflow-hidden">
              <div
                className="flex w-max gap-6"
                style={{ animation: 'reviewsMarqueeLTR 30s linear infinite' }}
              >
                {approvedReviews.concat(approvedReviews).map((review, idx) => (
                  <div
                    key={`${review._id}-${idx}`}
                    className="bg-card rounded-xl p-6 card-hover border border-border flex-shrink-0 w-[280px]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {review.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.name}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? 'text-gold fill-gold' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border">
            <h3 className="font-display text-lg font-semibold mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })}>
                      <Star className={`h-6 w-6 cursor-pointer transition-colors ${r <= reviewForm.rating ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={3} className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Share your experience..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setReviewModal(false)} className="flex-1 btn-outline-primary text-sm py-2">Cancel</button>
                <button onClick={handleReviewSubmit} className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2">
                  <Send className="h-4 w-4" /> Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-16 gradient-hero text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Discover Your Perfect Saree</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Browse our complete collection of handcrafted sarees from across India</p>
          <Link href="/products" className="inline-block bg-card text-foreground px-8 py-3 rounded-lg font-medium hover:bg-card/90 transition-colors">
            Browse All Products
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
