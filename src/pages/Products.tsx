"use client";

import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store/useStore';
import { Category } from '@/data/mockData';
import { Slider } from '@/components/ui/slider';

const highlightFilters = [
  { label: 'Best Seller', key: 'featured' },
  { label: 'Sale', key: 'sale' },
  { label: 'New Arrival', key: 'new' },
  { label: 'Trending', key: 'trending' },
  { label: 'Premium', key: 'premium' },
];

const Products = ({ initialCategory = '', initialHighlight = '' }: { initialCategory?: string; initialHighlight?: string }) => {
  const products = useStore((s) => s.products);
  const storeCategories = useStore((s) => s.categories);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedHighlight, setSelectedHighlight] = useState(initialHighlight);
  const [sortBy, setSortBy] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [page, setPage] = useState(1);

  const maxPrice = 20000;

  const filtered = useMemo(() => {
    let result = products.filter((p) => !p.hidden);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (selectedHighlight === 'featured') result = result.filter((p) => p.featured);
    if (selectedHighlight === 'sale') result = result.filter((p) => p.isSale);
    if (selectedHighlight === 'new') result = result.filter((p) => p.isNew);
    if (selectedHighlight === 'trending') result = result.filter((p) => p.isTrending);
    if (selectedHighlight === 'premium') result = result.filter((p) => p.isPremium);
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return result;
  }, [products, selectedCategory, selectedHighlight, sortBy, searchQuery, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedHighlight('');
    setSearchQuery('');
    setPriceRange([0, maxPrice]);
    setSortBy('');
    setPage(1);
  };

  const hasActiveFilters = selectedCategory || selectedHighlight || searchQuery || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const pageSize = 12;
  const totalProducts = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedHighlight, sortBy, searchQuery, priceRange]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data)) {
          setCategories(result.data as Category[]);
          return;
        }
      } catch {
        // ignore
      }
      setCategories(Array.isArray(storeCategories) ? (storeCategories as unknown as Category[]) : []);
    };

    fetchCategories();
  }, [storeCategories]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = totalProducts === 0 ? 0 : (page - 1) * pageSize;
  const endIndexExclusive = Math.min(startIndex + pageSize, totalProducts);
  const pagedProducts = filtered.slice(startIndex, endIndexExclusive);

  const handleSetPage = (nextPage: number) => {
    const clamped = Math.min(totalPages, Math.max(1, nextPage));
    setPage(clamped);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageItems = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const items: Array<number | 'ellipsis'> = [1];

    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);

    if (left > 2) items.push('ellipsis');
    for (let p = left; p <= right; p++) items.push(p);
    if (right < totalPages - 1) items.push('ellipsis');

    items.push(totalPages);
    return items;
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="section-title mb-8">Our Collection</h1>

        <div className="flex gap-8">
          <aside className="hidden md:block w-72 shrink-0">
            <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
              <div className="mb-6">
                <div className="text-sm font-semibold mb-3">Price Range</div>
                <div className="px-1">
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={500}
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val as [number, number])}
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold mb-3">Category</div>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold mb-3">Highlight</div>
                <div className="space-y-2">
                  {highlightFilters.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setSelectedHighlight(selectedHighlight === f.key ? '' : f.key)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${selectedHighlight === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-destructive hover:underline">
                  Clear All
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto md:mx-0 mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sarees by name..."
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Filters bar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <button onClick={() => setFilterOpen(!filterOpen)} className="md:hidden btn-outline-primary flex items-center gap-2 text-sm py-2 px-4">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-destructive hover:underline">Clear All</button>
                )}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-card border border-border rounded-lg px-4 py-2 text-sm">
                  <option value="">Sort by</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

        {/* Mobile filter drawer */}
        {filterOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-foreground/50">
            <div className="absolute right-0 top-0 h-full w-72 bg-card p-6 animate-slide-in-right overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">Filters</h3>
                <button onClick={() => setFilterOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Category</p>
                <button onClick={() => { setSelectedCategory(''); setFilterOpen(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-sm ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>All</button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat.slug); setFilterOpen(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-sm ${selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{cat.name}</button>
                ))}
              </div>
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Price Range</p>
                <div className="px-2">
                  <Slider min={0} max={maxPrice} step={500} value={priceRange} onValueChange={(val) => setPriceRange(val as [number, number])} />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Highlights</p>
                {highlightFilters.map((f) => (
                  <button key={f.key} onClick={() => { setSelectedHighlight(selectedHighlight === f.key ? '' : f.key); setFilterOpen(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-sm ${selectedHighlight === f.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{f.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No products found matching your filters.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {pagedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} - {endIndexExclusive} of {totalProducts} products
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (page > 1) handleSetPage(page - 1);
                        }}
                        disabled={page <= 1}
                        className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
                      >
                        Previous
                      </button>

                      {getPageItems().map((it, idx) => {
                        if (it === 'ellipsis') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          );
                        }

                        const isActive = it === page;
                        return (
                          <button
                            key={`page-${it}-${idx}`}
                            type="button"
                            onClick={() => handleSetPage(it)}
                            className={`h-10 min-w-10 px-3 rounded-lg border text-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-muted/50'}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {it}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          if (page < totalPages) handleSetPage(page + 1);
                        }}
                        disabled={page >= totalPages}
                        className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Products;
