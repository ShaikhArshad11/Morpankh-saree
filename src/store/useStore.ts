import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Category, Order, Customer, Review, initialProducts, initialCategories, initialOrders, initialCustomers, initialReviews } from '@/data/mockData';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size?: string;
  quantity: number;
}

interface StoreState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  cart: CartItem[];
  wishlist: string[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName: string;
  user: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  } | null;
  token: string | null;

  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Category actions
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Cart actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, color: string) => void;
  updateCartQuantity: (productId: string, color: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist actions
  toggleWishlist: (productId: string) => void;

  // Order actions
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['orderStatus']) => void;

  // Inventory
  updateStock: (productId: string, change: number) => void;

  // Reviews
  addReview: (review: Review) => void;
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;

  // Auth
  login: (user: { id: string; name: string; email: string; verified: boolean }, token: string, isAdmin?: boolean) => void;
  logout: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: initialProducts,
      categories: initialCategories,
      orders: initialOrders,
      customers: initialCustomers,
      reviews: initialReviews,
      cart: [],
      wishlist: [],
      isLoggedIn: false,
      isAdmin: false,
      userName: '',
      user: null,
      token: null,

      addProduct: (product) => set((s) => ({ products: [...s.products, product] })),
      updateProduct: (id, updates) => set((s) => ({
        products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addCategory: (category) => set((s) => ({ categories: [...s.categories, category] })),
      updateCategory: (id, updates) => set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      })),
      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addToCart: (item) => set((s) => {
        const existing = s.cart.find((c) => c.productId === item.productId && c.color === item.color);
        if (existing) {
          return { cart: s.cart.map((c) => c.productId === item.productId && c.color === item.color ? { ...c, quantity: c.quantity + item.quantity } : c) };
        }
        return { cart: [...s.cart, item] };
      }),
      removeFromCart: (productId, color) => set((s) => ({
        cart: s.cart.filter((c) => !(c.productId === productId && c.color === color)),
      })),
      updateCartQuantity: (productId, color, quantity) => set((s) => ({
        cart: quantity <= 0
          ? s.cart.filter((c) => !(c.productId === productId && c.color === color))
          : s.cart.map((c) => c.productId === productId && c.color === color ? { ...c, quantity } : c),
      })),
      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) => set((s) => ({
        wishlist: s.wishlist.includes(productId)
          ? s.wishlist.filter((id) => id !== productId)
          : [...s.wishlist, productId],
      })),

      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      updateOrderStatus: (id, status) => set((s) => ({
        orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: status } : o)),
      })),

      updateStock: (productId, change) => set((s) => ({
        products: s.products.map((p) => p.id === productId ? { ...p, stock: Math.max(0, p.stock + change) } : p),
      })),

      addReview: (review) => set((s) => ({ reviews: [...s.reviews, review] })),
      approveReview: (id) => set((s) => ({
        reviews: s.reviews.map((r) => (r.id === id ? { ...r, approved: true } : r)),
      })),
      deleteReview: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),

      login: (user, token, isAdmin = false) => set({
        isLoggedIn: true,
        userName: user.name,
        user,
        token,
        isAdmin
      }),
      logout: () => {
        localStorage.removeItem('token');
        set({
          isLoggedIn: false,
          userName: '',
          user: null,
          token: null,
          isAdmin: false
        });
      },
    }),
    { name: 'morpankh-store' }
  )
);
