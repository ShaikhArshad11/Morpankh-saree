import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';

const Categories = () => {
  const categories = useStore((s) => s.categories);
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="section-title mb-8">Categories</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group relative aspect-[4/3] rounded-xl overflow-hidden card-hover">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent flex flex-col items-center justify-end p-6">
                <h3 className="text-background font-display text-xl font-bold">{cat.name}</h3>
                <p className="text-background/70 text-sm">{cat.productCount} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Categories;
