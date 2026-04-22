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
  const loadProducts = useStore((s) => s.loadProducts);
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const userName = useStore((s) => s.userName);

  // ─── All state (declared once, in order) ──────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [approvedReviews, setApprovedReviews] = useState<ApprovedReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // ─── Loading skeleton timer ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  // ─── Fetch approved reviews ────────────────────────────────────────────────
  useEffect(() => {
    const loadApprovedReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch('/api/reviews?approved=true');
        const data = await res.json();
        if (res.ok) setApprovedReviews(data.reviews || []);
      } catch {
        // ignore
      } finally {
        setReviewsLoading(false);
      }
    };
    loadApprovedReviews();
  }, []);

  // ─── Fetch categories ──────────────────────────────────────────────────────
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

  // ─── Debounce search input (300ms) ────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Dropdown: only show for 1-2 char quick-peek ─────────────────────────
  useEffect(() => {
    setShowDropdown(searchQuery.trim().length > 0 && searchQuery.trim().length <= 2);
  }, [searchQuery]);

  // ─── Click outside to close dropdown ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('#search-box')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Derived data (single source of truth: debouncedQuery) ───────────────
  const visibleProducts = products.filter((p) => !p.hidden);
  const limitedOfferProducts = visibleProducts.filter((p) => p.isLimitedOffer);
  const bestSellers = visibleProducts.filter((p) => p.featured);
  const newArrivals = visibleProducts.filter((p) => p.isNew);
  const saleProducts = visibleProducts.filter((p) => p.isSale);
  const premiumSarees = visibleProducts.filter((p) => p.isPremium);
  const trendingSarees = visibleProducts.filter((p) => p.isTrending);

  const isSearching = debouncedQuery.trim().length > 0;
  const isFullSearch = debouncedQuery.trim().length > 2;

  const filteredCategories = isSearching
    ? categories.filter((cat) =>
        cat.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : categories;

  const filteredProducts = isSearching
    ? visibleProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  // ─── Review submit handler ────────────────────────────────────────────────
  const handleReviewSubmit = async () => {
    if (reviewSubmitting) return;
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setReviewSubmitting(true);
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
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ─── Sub-components ───────────────────────────────────────────────────────
  const Section = ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );

  const ProductSection = ({
    title,
    subtitle,
    items,
    filterParam,
    bg,
  }: {
    title: string;
    subtitle: string;
    items: typeof products;
    filterParam: string;
    bg?: string;
  }) => {
    const show = items.slice(0, 4);
    if (items.length === 0) return null;
    return (
      <section className={`py-12 md:py-16 ${bg || ''}`}>
        <div className="container mx-auto px-4">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {show.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href={`/products?highlight=${filterParam}`}
              className="btn-outline-primary inline-flex items-center gap-2"
            >
              View More <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  };

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="h-[400px] skeleton-loading mb-12 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={`skeleton-${i}`} className="space-y-3">
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

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <PublicLayout>

      {/* Hero */}
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
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight md:leading-[1.2] max-w-xl">
              परंपरेचा मोरपंखी स्पर्श,
              <br className="hidden md:block" />
              <span className="block mt-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                सौंदर्याची नवी ओळख
              </span>
            </h1>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
              Handcrafted Banarasi, Paithani, Kanjivaram and more -{' '}
              <span className="text-white font-medium">timeless elegance</span> for every occasion.
            </p>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Shop Now
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Box */}
      <div className="mt-10">
        <div id="search-box" className="max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-ring outline-none"
          />

          {/* Dropdown — quick-peek for 1-2 char queries only */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-lg z-50 max-h-[350px] overflow-y-auto">
              {filteredCategories.length > 0 && (
                <div className="p-3 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-2">Categories</p>
                  {filteredCategories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setSearchQuery('')}
                      className="block px-3 py-2 rounded-lg hover:bg-muted text-sm"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
              {filteredProducts.length > 0 && (
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-2">Products</p>
                  {filteredProducts.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"
                    >
                      <img
                        src={p.images?.[0]}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="text-sm">{p.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {filteredCategories.length === 0 && filteredProducts.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground text-center">No results found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Full search results (>2 chars) OR homepage sections ── */}
      {isFullSearch ? (
        // ─── Search Results View ──────────────────────────────────────────────
        <section className="py-12 bg-muted/40 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">
                Results for &ldquo;{debouncedQuery}&rdquo;
              </h2>
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear ✕
              </button>
            </div>

            {filteredCategories.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-medium mb-4">Categories</h3>
                <div className="flex flex-wrap gap-3">
                  {filteredCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:bg-muted transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Products
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredProducts.length} found)
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No matching products found.</p>
            )}
          </div>
        </section>
      ) : (
        // ─── Normal Homepage Sections ─────────────────────────────────────────
        <>
          {/* Category Carousel */}
          <Section title="Shop by Category" subtitle="Explore our curated collection">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No categories available.</p>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <style>{`
                  @keyframes categoriesMarqueeLTR {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                  }
                  .categories-marquee:hover .categories-track {
                    animation-play-state: paused;
                  }
                `}</style>
                <div className="categories-marquee flex w-max gap-3 sm:gap-4">
                  <div
                    className="categories-track flex w-max gap-3 sm:gap-4"
                    style={{ animation: 'categoriesMarqueeLTR 28s linear infinite' }}
                  >
                    {[...categories, ...categories].map((cat, idx) => (
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
            )}
          </Section>

          {/* Product Sections */}
          <ProductSection
            title="Limited Offer"
            subtitle="Hurry up! Limited stock available"
            items={limitedOfferProducts}
            filterParam="limited"
            bg="bg-orange-50/40"
          />
          <ProductSection
            title="Best Sellers"
            subtitle="Our most loved sarees"
            items={bestSellers}
            filterParam="featured"
          />
          <ProductSection
            title="New Arrivals"
            subtitle="Fresh additions to our collection"
            items={newArrivals}
            filterParam="new"
          />
          <ProductSection
            title="Sale"
            subtitle="Grab these deals before they're gone"
            items={saleProducts}
            filterParam="sale"
            bg="bg-muted"
          />
          <ProductSection
            title="Premium Sarees"
            subtitle="Luxury craftsmanship for special occasions"
            items={premiumSarees}
            filterParam="premium"
          />
          <ProductSection
            title="Trending Sarees"
            subtitle="What's popular right now"
            items={trendingSarees}
            filterParam="trending"
          />
        </>
      )}

      {/* Reviews — always visible */}
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
            <button
              onClick={() => {
                setReviewForm({ name: isLoggedIn ? userName : '', rating: 5, comment: '' });
                setReviewModal(true);
              }}
              className="btn-outline-primary inline-flex items-center gap-2 text-sm py-2 px-4"
            >
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
                {[...approvedReviews, ...approvedReviews].map((review, idx) => (
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
                              key={`star-${i}`}
                              className={`h-3 w-3 ${
                                i < review.rating ? 'text-gold fill-gold' : 'text-muted-foreground'
                              }`}
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
                <input
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                    >
                      <Star
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          r <= reviewForm.rating ? 'text-gold fill-gold' : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={3}
                  className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setReviewModal(false)}
                  disabled={reviewSubmitting}
                  className="flex-1 btn-outline-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA — always visible */}
      <section className="py-16 gradient-hero text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Discover Your Perfect Saree
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Browse our complete collection of handcrafted sarees from across India
          </p>
          <Link
            href="/products"
            className="inline-block bg-card text-foreground px-8 py-3 rounded-lg font-medium hover:bg-card/90 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
};

export default Index;