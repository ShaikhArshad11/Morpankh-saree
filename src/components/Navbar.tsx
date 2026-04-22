import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Heart, User, Menu, X, LogOut, Send } from 'lucide-react';
import { useStore } from '@/store/useStore';
import logo from '@/assets/logo.png';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Category', to: '/categories' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const isAdmin = useStore((s) => s.isAdmin);
  const userName = useStore((s) => s.userName);
  const logout = useStore((s) => s.logout);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [userMenu, setUserMenu] = useState(false);

  const [announcement, setAnnouncement] = useState<{ text: string; enabled: boolean } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/announcement-bar', { cache: 'no-store' });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data && typeof data.enabled === 'boolean' && typeof data.text === 'string') {
          setAnnouncement({ text: data.text, enabled: data.enabled });
        } else {
          setAnnouncement(null);
        }
      } catch {
        if (!mounted) return;
        setAnnouncement(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="sticky top-0 z-50">
  {announcement?.enabled ? (
    <div className="bg-black text-white overflow-hidden">
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: inline-flex;
          align-items: center;
          gap: 40px;
          white-space: nowrap;
          width: max-content;
          animation: marquee-scroll 50s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="py-2">
        <div className="marquee-track">
          {Array.from({ length: 12 }).flatMap((_, i) => [
            <div key={`a-${i}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium">
              <Send className="h-4 w-4 shrink-0" />
              <span>{announcement.text}</span>
            </div>,
            <span key={`a-dot-${i}`} className="inline-block w-1 h-1 rounded-full bg-white/30 shrink-0" />,
          ])}
          {Array.from({ length: 12 }).flatMap((_, i) => [
            <div key={`b-${i}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium">
              <Send className="h-4 w-4 shrink-0" />
              <span>{announcement.text}</span>
            </div>,
            <span key={`b-dot-${i}`} className="inline-block w-1 h-1 rounded-full bg-white/30 shrink-0" />,
          ])}
        </div>
      </div>
    </div>
  ) : null}

      <nav className="bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="Morpankh Saree" height={120} width={120} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={
                isActive(link.to)
                  ? 'relative text-sm font-semibold text-primary px-3 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/20'
                  : 'relative text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
              }
            >
              {link.label}
              {isActive(link.to) ? (
                <span className="absolute left-1/2 -bottom-2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              ) : null}
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
                      <button
                        onClick={() => {
                          logout();
                          toast({ title: 'Logged out successfully' });
                          setUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Customer Login</Link>
                      <Link href="/register" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Register</Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-foreground/70">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <Image src={logo} alt="Morpankh Saree" height={80} width={80} />
            </Link>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="p-2 text-foreground/70 hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setMobileOpen(false)}
                className={
                  isActive(link.to)
                    ? 'py-3 px-4 rounded-lg transition-colors bg-primary/10 text-primary font-semibold ring-1 ring-primary/20 flex items-center gap-3'
                    : 'py-3 px-4 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-3'
                }
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile user menu items */}
            <div className="border-t border-border pt-2 mt-2">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'Customer'}</p>
                  </div>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="py-3 px-4 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-3">My Profile</Link>
                  <Link href="/orders" onClick={() => setMobileOpen(false)} className="py-3 px-4 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-3">My Orders</Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="py-3 px-4 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-3">Admin Panel</Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      toast({ title: 'Logged out successfully' });
                      setMobileOpen(false);
                    }}
                    className="w-full text-left py-3 px-4 text-destructive hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="py-3 px-4 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-3">Customer Login</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="py-3 px-4 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-3">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
