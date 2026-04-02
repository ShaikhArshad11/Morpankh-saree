import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Registration successful! Please check your email for OTP.' });
        setStep('verify');
      } else {
        toast({ title: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Registration failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({ title: 'Please enter a valid 6-digit OTP', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);

        // Update store
        login(data.user, data.token);

        toast({ title: 'Account verified successfully! Welcome to Morpankh Saree.' });
        router.push('/');
      } else {
        toast({ title: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'OTP verification failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'OTP sent successfully! Please check your email.' });
      } else {
        toast({ title: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to resend OTP. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-card rounded-xl p-8 border border-border">
            <h1 className="font-display text-2xl font-bold text-center mb-6">Verify Your Email</h1>
            <p className="text-center text-muted-foreground mb-6">
              We've sent a 6-digit OTP to <strong>{form.email}</strong>
            </p>

            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
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

              <button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="w-full text-sm text-primary hover:underline disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              <button
                onClick={() => setStep('register')}
                className="text-primary font-medium hover:underline"
              >
                Change Email
              </button>
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-card rounded-xl p-8 border border-border">
          <h1 className="font-display text-2xl font-bold text-center mb-6">Register</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
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
