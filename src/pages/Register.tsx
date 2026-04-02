import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const { login } = useStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    login(form.name);
    toast({ title: 'Account created successfully!' });
    router.push('/');
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-card rounded-xl p-8 border border-border">
          <h1 className="font-display text-2xl font-bold text-center mb-6">Register</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(['name', 'email', 'password', 'confirmPassword'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input type={field.includes('password') || field.includes('Password') ? 'password' : field === 'email' ? 'email' : 'text'} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
            <button type="submit" className="btn-primary w-full">Create Account</button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <Link href="/login" className="text-primary font-medium">Login</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Register;
