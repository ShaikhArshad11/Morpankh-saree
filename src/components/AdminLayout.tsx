import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, FolderTree, ClipboardList, Warehouse, Download, LogOut, User, MessageSquare, Mail } from 'lucide-react';
import { useStore } from '@/store/useStore';
import logo from '@/assets/logo.png';
import { toast } from '@/hooks/use-toast';

const menuItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree },
  { label: 'Orders', to: '/admin/orders', icon: ClipboardList },
  { label: 'Messages', to: '/admin/messages', icon: Mail },
  { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
  { label: 'Inventory', to: '/admin/inventory', icon: Warehouse },
  { label: 'Export Data', to: '/admin/export', icon: Download },
  { label: 'Logout', to: '#', icon: LogOut, isLogout: true },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userName, isAdmin, isLoggedIn } = useStore();
  const reviews = useStore((s) => s.reviews);
  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const [isInitialized, setIsInitialized] = useState(false);

  // Wait for auth to initialize
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Protect admin routes
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return <RedirectToAdminLogin />;
  }

  function RedirectToAdminLogin() {
    useEffect(() => {
      router.replace('/admin/login');
    }, []);
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <img src={logo.src} alt="Logo" className="h-8 brightness-0 invert" />
            <span className="font-display text-sm font-bold">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.to;
            if (item.isLogout) {
              return (
                <button
                  key={item.to}
                  onClick={() => {
                    logout();
                    toast({ title: 'Logged out successfully' });
                    router.push('/');
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            }
            return (
              <Link key={item.to} href={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.label === 'Reviews' && pendingReviews > 0 && (
                  <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-full">{pendingReviews}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-sidebar-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{userName || 'Admin'}</p>
              <p className="text-xs text-sidebar-foreground/50">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              toast({ title: 'Logged out successfully' });
              router.push('/');
            }}
            className="flex items-center gap-2 text-sm text-sidebar-foreground/50 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground p-3 flex items-center justify-between">
        <span className="font-display text-sm font-bold">Admin</span>
        <div className="flex gap-2 overflow-x-auto">
          {menuItems.map((item) => {
            if (item.isLogout) {
              return (
                <button
                  key={item.to}
                  onClick={() => {
                    logout();
                    toast({ title: 'Logged out successfully' });
                    router.push('/');
                  }}
                  className={`p-2 rounded-lg relative text-sidebar-foreground/50 hover:text-destructive`}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              );
            }
            return (
              <Link key={item.to} href={item.to} className={`p-2 rounded-lg relative ${pathname === item.to ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/50'}`}>
                <item.icon className="h-4 w-4" />
                {item.label === 'Reviews' && pendingReviews > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{pendingReviews}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 bg-muted/30 p-4 md:p-8 md:pt-8 pt-16 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
