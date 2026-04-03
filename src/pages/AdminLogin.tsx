import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.png';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'OTP sent to your admin email' });
        setStep('verify');
      } else {
        toast({ title: data.error || 'Invalid admin credentials', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to send OTP. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({ title: 'Please enter a valid 6-digit OTP', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token, true);
        toast({ title: 'Welcome, Admin!' });
        router.push('/admin');
      } else {
        toast({ title: data.error || 'Invalid OTP', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'OTP verification failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
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
        {step === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="admin@morpankh.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              <ShieldCheck className="h-4 w-4" /> {isLoading ? 'Sending OTP...' : 'Sign In as Admin'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6} className="btn-primary w-full disabled:opacity-50">
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={() => { setStep('login'); setOtp(''); }}
              disabled={isLoading}
              className="w-full text-sm text-primary hover:underline disabled:opacity-50"
            >
              Change Email
            </button>
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground mt-4">Credentials: admin@morpankh.com / admin123</p>
      </div>
    </div>
  );
};

export default AdminLogin;
