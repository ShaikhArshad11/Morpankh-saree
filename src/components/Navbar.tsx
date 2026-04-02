import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, User, Menu, X, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import logo from '@/assets/logo.png';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Category', to: '/categories' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const isAdmin = useStore((s) => s.isAdmin);
  const userName = useStore((s) => s.userName);
  const logout = useStore((s) => s.logout);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [userMenu, setUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <img src={logo.src} alt="Morpankh Saree" className="h-10 w-auto" />
          <span className="font-display text-xl font-bold text-primary hidden sm:block">Morpankh Saree</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.to} href={link.to} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <Link href="/wishlist" className="relative p-2 text-foreground/70 hover:text-primary transition-colors">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-2 text-foreground/70 hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          <div className="relative">
            <button onClick={() => setUserMenu(!userMenu)} className="p-2 text-foreground/70 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </button>
            {userMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-2">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'Customer'}</p>
                      </div>
                      <Link href="/profile" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-muted transition-colors">My Profile</Link>
                      <Link href="/orders" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-muted transition-colors">My Orders</Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Admin Panel</Link>
                      )}
                      <button onClick={() => { logout(); setUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors flex items-center gap-2">
                        <LogOut className="h-3.5 w-3.5" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Customer Login</Link>
                      <Link href="/register" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Register</Link>
                      <div className="border-t border-border my-1" />
                      <Link href="/admin/login" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">Admin Login</Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-foreground/70">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-in-right">
          <div className="flex flex-col p-4 gap-3">
            {navLinks.map((link) => (
              <Link key={link.to} href={link.to} onClick={() => setMobileOpen(false)} className="py-2 px-4 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
