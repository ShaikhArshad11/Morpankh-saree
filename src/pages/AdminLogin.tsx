import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      login(
        { id: 'admin', name: 'Admin', email: process.env.ADMIN_EMAIL!, verified: true },
        'admin-token',
        true
      );
      toast({ title: 'Welcome, Admin!' });
      router.push('/admin');
    } else {
      toast({ title: 'Invalid admin credentials', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      <div className="bg-card rounded-2xl p-8 w-full max-w-md border border-border shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <img src={logo.src} alt="Morpankh" className="h-8 mx-auto mb-2" />
          <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Access the admin dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Admin Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="admin@morpankh.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Sign In as Admin
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">Credentials: admin@morpankh.com / admin123</p>
      </div>
    </div>
  );
};

export default AdminLogin;
