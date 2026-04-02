import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login for now - in production, this should call an API
    login(
      { id: 'mock-user', name: email.split('@')[0] || 'User', email, verified: true },
      'mock-token'
    );
    toast({ title: 'Logged in successfully!' });
    router.push('/');
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-card rounded-xl p-8 border border-border">
          <h1 className="font-display text-2xl font-bold text-center mb-6">Customer Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button type="submit" className="btn-primary w-full">Login</button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account? <Link href="/register" className="text-primary font-medium">Register</Link>
          </p>
          <div className="border-t border-border mt-4 pt-4">
            <Link href="/admin/login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
              Admin? Login here →
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
