export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number;
  description: string;
  fabric: string;
  images: string[];
  category: string;
  colors: string[];
  sizes?: string[];
  stock: number;
  sku: string;
  tags: string[];
  featured: boolean;
  isNew: boolean;
  isSale: boolean;
  isPremium: boolean;
  isTrending: boolean;
  rating: number;
  reviews: number;
  hidden?: boolean;
  salePercent?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: { productId: string; name: string; color: string; size?: string; quantity: number; price: number }[];
  subtotal: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  variant: string;
  sku: string;
  stock: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  approved: boolean;
}

const sareeImages = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=600&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=800&fit=crop',
];

export const initialProducts: Product[] = [
  {
    id: '1', name: 'Banarasi Silk Saree', slug: 'banarasi-silk-saree',
    price: 4999, comparePrice: 7999, description: 'Exquisite Banarasi silk saree with intricate zari work and traditional motifs. Perfect for weddings and festive occasions.',
    fabric: 'Pure Banarasi Silk with Gold Zari', images: [sareeImages[0], sareeImages[1]],
    category: 'silk', colors: ['Red', 'Gold', 'Maroon'], stock: 25, sku: 'BNS-001',
    tags: ['wedding', 'festive', 'silk'], featured: true, isNew: false, isSale: true, isPremium: true, isTrending: true, rating: 4.8, reviews: 124, salePercent: 37,
  },
  {
    id: '2', name: 'Paithani Saree', slug: 'paithani-saree',
    price: 8999, comparePrice: 12999, description: 'Traditional Paithani saree from Maharashtra with peacock border and rich pallu design.',
    fabric: 'Pure Paithani Silk', images: [sareeImages[1], sareeImages[2]],
    category: 'paithani', colors: ['Purple', 'Green', 'Yellow'], stock: 12, sku: 'PTH-001',
    tags: ['traditional', 'maharashtra', 'wedding'], featured: true, isNew: true, isSale: false, isPremium: true, isTrending: true, rating: 4.9, reviews: 89,
  },
  {
    id: '3', name: 'Cotton Handloom Saree', slug: 'cotton-handloom-saree',
    price: 1499, comparePrice: 2499, description: 'Comfortable cotton handloom saree perfect for daily wear and casual occasions.',
    fabric: 'Pure Cotton Handloom', images: [sareeImages[2], sareeImages[3]],
    category: 'cotton', colors: ['Blue', 'White', 'Green'], stock: 50, sku: 'CTN-001',
    tags: ['daily', 'casual', 'cotton'], featured: false, isNew: true, isSale: true, isPremium: false, isTrending: false, rating: 4.5, reviews: 210, salePercent: 40,
  },
  {
    id: '4', name: 'Chanderi Silk Saree', slug: 'chanderi-silk-saree',
    price: 3499, comparePrice: 5499, description: 'Lightweight Chanderi silk saree with sheer texture and beautiful motifs.',
    fabric: 'Chanderi Silk', images: [sareeImages[3], sareeImages[4]],
    category: 'silk', colors: ['Pink', 'Peach', 'Ivory'], stock: 30, sku: 'CND-001',
    tags: ['lightweight', 'party', 'elegant'], featured: true, isNew: false, isSale: false, isPremium: false, isTrending: true, rating: 4.6, reviews: 156,
  },
  {
    id: '5', name: 'Kanjivaram Silk Saree', slug: 'kanjivaram-silk-saree',
    price: 12999, comparePrice: 18999, description: 'Premium Kanjivaram silk saree with heavy gold zari work. A masterpiece of South Indian weaving.',
    fabric: 'Pure Kanjivaram Silk', images: [sareeImages[4], sareeImages[5]],
    category: 'silk', colors: ['Red', 'Gold', 'Green'], stock: 8, sku: 'KNJ-001',
    tags: ['premium', 'wedding', 'bridal'], featured: true, isNew: false, isSale: true, isPremium: true, isTrending: true, rating: 4.9, reviews: 67, salePercent: 32,
  },
  {
    id: '6', name: 'Georgette Party Saree', slug: 'georgette-party-saree',
    price: 2499, comparePrice: 3999, description: 'Elegant georgette saree with sequin work, perfect for parties and celebrations.',
    fabric: 'Pure Georgette with Sequin', images: [sareeImages[5], sareeImages[6]],
    category: 'georgette', colors: ['Navy', 'Wine', 'Black'], stock: 40, sku: 'GRG-001',
    tags: ['party', 'modern', 'sequin'], featured: false, isNew: true, isSale: true, isPremium: false, isTrending: false, rating: 4.4, reviews: 98, salePercent: 38,
  },
  {
    id: '7', name: 'Linen Saree', slug: 'linen-saree',
    price: 1999, comparePrice: 3299, description: 'Breathable linen saree with minimal design, ideal for summer and office wear.',
    fabric: 'Pure Linen', images: [sareeImages[6], sareeImages[7]],
    category: 'linen', colors: ['Beige', 'Olive', 'Grey'], stock: 35, sku: 'LNN-001',
    tags: ['office', 'summer', 'minimal'], featured: false, isNew: false, isSale: false, isPremium: false, isTrending: true, rating: 4.3, reviews: 178,
  },
  {
    id: '8', name: 'Nauvari Saree', slug: 'nauvari-saree',
    price: 3999, comparePrice: 5999, description: 'Traditional Maharashtrian Nauvari saree, perfect for cultural events and traditional functions.',
    fabric: 'Pure Silk with Zari Border', images: [sareeImages[7], sareeImages[0]],
    category: 'paithani', colors: ['Green', 'Red', 'Yellow'], stock: 18, sku: 'NVR-001',
    tags: ['traditional', 'maharashtra', 'cultural'], featured: true, isNew: true, isSale: false, isPremium: true, isTrending: false, rating: 4.7, reviews: 45,
  },
  {
    id: '9', name: 'Chiffon Designer Saree', slug: 'chiffon-designer-saree',
    price: 2999, comparePrice: 4999, description: 'Flowy chiffon saree with designer prints and elegant drape.',
    fabric: 'Premium Chiffon', images: [sareeImages[2], sareeImages[5]],
    category: 'georgette', colors: ['Teal', 'Rose', 'Lavender'], stock: 22, sku: 'CHF-001',
    tags: ['designer', 'party', 'elegant'], featured: false, isNew: true, isSale: true, isPremium: false, isTrending: true, rating: 4.5, reviews: 132, salePercent: 40,
  },
  {
    id: '10', name: 'Tussar Silk Saree', slug: 'tussar-silk-saree',
    price: 5999, comparePrice: 8999, description: 'Natural tussar silk saree with hand-painted designs showcasing traditional art.',
    fabric: 'Pure Tussar Silk', images: [sareeImages[3], sareeImages[6]],
    category: 'silk', colors: ['Natural', 'Rust', 'Mustard'], stock: 5, sku: 'TSR-001',
    tags: ['handpainted', 'art', 'premium'], featured: true, isNew: false, isSale: false, isPremium: true, isTrending: false, rating: 4.8, reviews: 56,
  },
];

export const initialCategories: Category[] = [
  { id: '1', name: 'Silk Sarees', slug: 'silk', image: sareeImages[0], productCount: 4 },
  { id: '2', name: 'Paithani Sarees', slug: 'paithani', image: sareeImages[1], productCount: 2 },
  { id: '3', name: 'Cotton Sarees', slug: 'cotton', image: sareeImages[2], productCount: 1 },
  { id: '4', name: 'Georgette Sarees', slug: 'georgette', image: sareeImages[5], productCount: 2 },
  { id: '5', name: 'Linen Sarees', slug: 'linen', image: sareeImages[6], productCount: 1 },
];

export const initialOrders: Order[] = [
  {
    id: '1', orderNumber: 'MPS-1001', customerName: 'Priya Sharma', customerEmail: 'priya@email.com',
    customerPhone: '9876543210', address: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
    items: [{ productId: '1', name: 'Banarasi Silk Saree', color: 'Red', quantity: 1, price: 4999 }],
    subtotal: 4999, total: 4999, paymentStatus: 'paid', orderStatus: 'delivered', date: '2026-03-28',
  },
  {
    id: '2', orderNumber: 'MPS-1002', customerName: 'Anjali Desai', customerEmail: 'anjali@email.com',
    customerPhone: '9876543211', address: '456 FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411001',
    items: [{ productId: '2', name: 'Paithani Saree', color: 'Purple', quantity: 1, price: 8999 }],
    subtotal: 8999, total: 8999, paymentStatus: 'paid', orderStatus: 'shipped', date: '2026-03-30',
  },
  {
    id: '3', orderNumber: 'MPS-1003', customerName: 'Meera Kulkarni', customerEmail: 'meera@email.com',
    customerPhone: '9876543212', address: '789 JM Road', city: 'Nagpur', state: 'Maharashtra', pincode: '440001',
    items: [{ productId: '5', name: 'Kanjivaram Silk Saree', color: 'Red', quantity: 1, price: 12999 }],
    subtotal: 12999, total: 12999, paymentStatus: 'pending', orderStatus: 'pending', date: '2026-04-01',
  },
  {
    id: '4', orderNumber: 'MPS-1004', customerName: 'Sneha Patil', customerEmail: 'sneha@email.com',
    customerPhone: '9876543213', address: '321 Laxmi Nagar', city: 'Nashik', state: 'Maharashtra', pincode: '422001',
    items: [{ productId: '3', name: 'Cotton Handloom Saree', color: 'Blue', quantity: 2, price: 1499 }],
    subtotal: 2998, total: 2998, paymentStatus: 'paid', orderStatus: 'confirmed', date: '2026-03-31',
  },
];

export const initialCustomers: Customer[] = [
  { id: '1', name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543210', orders: 5, totalSpent: 24999 },
  { id: '2', name: 'Anjali Desai', email: 'anjali@email.com', phone: '9876543211', orders: 3, totalSpent: 18999 },
  { id: '3', name: 'Meera Kulkarni', email: 'meera@email.com', phone: '9876543212', orders: 2, totalSpent: 15999 },
  { id: '4', name: 'Sneha Patil', email: 'sneha@email.com', phone: '9876543213', orders: 4, totalSpent: 12998 },
  { id: '5', name: 'Kavita Joshi', email: 'kavita@email.com', phone: '9876543214', orders: 1, totalSpent: 4999 },
];

export const initialReviews: Review[] = [
  { id: '1', name: 'Priya S.', rating: 5, comment: 'Absolutely stunning Banarasi saree! The quality is exceptional and the colors are so vibrant.', date: '2026-03-15', avatar: 'PS', approved: true },
  { id: '2', name: 'Anjali D.', rating: 5, comment: 'The Paithani saree exceeded my expectations. The peacock border is breathtaking!', date: '2026-03-20', avatar: 'AD', approved: true },
  { id: '3', name: 'Meera K.', rating: 4, comment: 'Great quality cotton saree. Very comfortable for daily wear. Fast delivery too!', date: '2026-03-22', avatar: 'MK', approved: true },
  { id: '4', name: 'Sneha P.', rating: 5, comment: 'Best online saree shopping experience. The packaging was beautiful and the saree was even more gorgeous in person.', date: '2026-03-25', avatar: 'SP', approved: true },
];

export const getInventoryItems = (products: Product[]): InventoryItem[] => {
  return products.flatMap(p =>
    p.colors.map((color, i) => ({
      productId: p.id,
      productName: p.name,
      variant: color,
      sku: `${p.sku}-${color.substring(0, 3).toUpperCase()}`,
      stock: Math.max(0, p.stock - i * 3),
    }))
  );
};
