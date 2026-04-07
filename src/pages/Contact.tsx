'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Send, Clock, Star } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { toast } from '@/hooks/use-toast';

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('revealed');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const Contact = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  useScrollReveal();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging)
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Message sent!', description: 'We will get back to you soon.' });
        setForm({ name: '', email: '', message: '' });
        setCharCount(0);
      } else {
        toast({ title: data.error || 'Failed to send message', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to send message', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full border rounded-xl px-4 py-3.5 bg-background text-sm transition-all duration-300 outline-none resize-none ${
      focused === field
        ? 'border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5'
        : 'border-border hover:border-primary/40'
    }`;

  const contactItems = [
    {
      icon: MapPin,
      label: 'Visit Us',
      value: 'Shop No. 12, Laxmi Road',
      sub: 'Pune, Maharashtra 411030',
      delay: '0s',
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: '+91 98765 43210',
      sub: 'Mon – Sat, 10am – 7pm',
      delay: '0.1s',
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: 'morpankhsaree@gmail.com',
      sub: 'Reply within 24 hours',
      delay: '0.2s',
    },
    {
      icon: Clock,
      label: 'Store Hours',
      value: 'Mon – Sat: 10am – 7pm',
      sub: 'Sunday: 11am – 5pm',
      delay: '0.3s',
    },
  ];

  return (
    <PublicLayout>
      <style>{`
        @keyframes float1{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.03)}}
        @keyframes float2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(18px) scale(0.97)}}
        @keyframes float3{0%,100%{transform:translateX(0)}50%{transform:translateX(12px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bannerReveal{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        .banner-reveal{animation:bannerReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards}
        .fade-up-1{opacity:0;animation:fadeUp 0.6s ease 0.1s forwards}
        .fade-up-2{opacity:0;animation:fadeUp 0.6s ease 0.25s forwards}
        .fade-up-3{opacity:0;animation:fadeUp 0.6s ease 0.4s forwards}
        .fade-up-4{opacity:0;animation:fadeUp 0.6s ease 0.55s forwards}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity 0.6s ease,transform 0.6s ease}
        .reveal.revealed{opacity:1;transform:translateY(0)}
        .contact-card:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 16px 40px hsl(var(--primary)/0.14)}
        .contact-card{transition:transform 0.3s ease,box-shadow 0.3s ease}
        .info-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px hsl(var(--primary)/0.15)}
        .info-card{transition:transform 0.25s ease,box-shadow 0.25s ease}
        .btn-send:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 28px hsl(var(--primary)/0.35)}
        .btn-send{transition:all 0.25s ease}
        .spin-ring{animation:spinSlow 22s linear infinite}
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(160deg, hsl(var(--primary)/0.06) 0%, hsl(var(--background)) 50%, hsl(var(--secondary)/0.08) 100%)',
          }}
        />

        {/* floating orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 380, height: 380, top: -80, right: -100,
            background: 'radial-gradient(circle, hsl(var(--primary)/0.12), transparent 70%)',
            animation: 'float1 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 260, height: 260, bottom: 60, left: -80,
            background: 'radial-gradient(circle, hsl(var(--secondary)/0.10), transparent 70%)',
            animation: 'float2 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 180, height: 180, top: '40%', left: '5%',
            background: 'radial-gradient(circle, hsl(var(--primary)/0.07), transparent 70%)',
            animation: 'float3 9s ease-in-out infinite',
          }}
        />

        {/* ── BANNER ── */}
        <div className="relative w-full overflow-hidden banner-reveal" style={{ height: 260 }}>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(160deg, hsl(var(--primary)/0.95), hsl(168 60% 18%))',
            }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute" style={{ top: '12%', left: '8%', animation: 'float1 8s ease-in-out infinite' }}>
            <div className="w-16 h-16 rounded-2xl rotate-12 border-2 border-white/20" />
          </div>
          <div className="absolute" style={{ top: '50%', right: '10%', animation: 'float2 9s ease-in-out infinite' }}>
            <div className="w-12 h-12 rounded-full border-2 border-white/20" />
          </div>
          <div className="absolute" style={{ bottom: '15%', left: '18%', animation: 'float3 7s ease-in-out infinite' }}>
            <div className="w-8 h-8 rounded-lg rotate-45 border border-white/20" />
          </div>
          <div className="absolute" style={{ top: '20%', right: '25%', animation: 'spinSlow 18s linear infinite' }}>
            <div className="w-20 h-20 rounded-full border border-dashed border-white/15" />
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6 text-center">
            <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
              Morpankh Saree · Support
            </p>
            <h2 className="text-4xl font-bold mb-2">Contact Us</h2>
            <p className="text-white/70 text-sm max-w-md">
              Whether you have a question, feedback, or just want to say hello — our team is here for you.
            </p>
          </div>
        </div>

        {/* ── DRAGGABLE CONTENT ── */}
        <div
          className="container mx-auto px-4 py-12 relative z-10"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* page pill + title */}
          <div className="text-center mb-14 fade-up-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Morpankh Saree
            </div>
            <h1 className="text-5xl font-bold mb-4" style={{ color: 'hsl(var(--primary))' }}>
              
            </h1>
          </div>

          {/* HERO ICON CARD */}
          <div className="max-w-3xl mx-auto mb-12 fade-up-2">
            <div
              className="rounded-2xl p-10 border border-border/60 shadow-xl backdrop-blur-xl"
              style={{ background: 'hsl(var(--card)/0.85)' }}
            >
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl border border-primary/20 shadow-inner"
                  style={{ background: 'hsl(var(--primary)/0.08)' }}
                >
                  ✉️
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'hsl(var(--primary))' }}>
                  We'd Love to Hear From You
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Reach out for product queries, order updates, or anything else. Our team typically
                  responds within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* MAIN GRID: Form + Map */}
          <div className="max-w-5xl mx-auto mb-12 fade-up-3">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div
                  className="rounded-2xl p-8 border border-border/60 shadow-xl backdrop-blur-xl"
                  style={{ background: 'hsl(var(--card)/0.85)' }}
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                        style={{ background: 'hsl(var(--primary)/0.1)' }}
                      >
                        ✍️
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Send a Message
                      </span>
                    </div>
                    <h3
                      className="font-bold text-xl"
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      Let's start a conversation
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          onFocus={() => setFocused('name')}
                          onBlur={() => setFocused(null)}
                          required
                          placeholder="Priya Sharma"
                          className={inputClass('name')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          onFocus={() => setFocused('email')}
                          onBlur={() => setFocused(null)}
                          required
                          placeholder="you@example.com"
                          className={inputClass('email')}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Message
                        </label>
                        <span
                          className={`text-xs transition-colors ${charCount > 450 ? 'text-destructive' : 'text-muted-foreground/50'}`}
                        >
                          {charCount}/500
                        </span>
                      </div>
                      <textarea
                        value={form.message}
                        onChange={(e) => {
                          setForm({ ...form, message: e.target.value });
                          setCharCount(e.target.value.length);
                        }}
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused(null)}
                        required
                        rows={5}
                        maxLength={500}
                        placeholder="Tell us about your inquiry, the saree you're looking for, or any questions you have..."
                        className={inputClass('message')}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-send w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(168 60% 22%))',
                        color: 'white',
                      }}
                    >
                      {isLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-6 pt-2">
                      {['🔒 Private', '⚡ Fast reply', '💬 Friendly'].map((t) => (
                        <span key={t} className="text-xs text-muted-foreground/60">{t}</span>
                      ))}
                    </div>
                  </form>
                </div>
              </div>

              {/* Right side: Map + cards */}
              <div className="lg:col-span-2 space-y-5">
                {/* Map */}
                <div
                  className="info-card rounded-2xl overflow-hidden border border-border/60 shadow-lg"
                  style={{ boxShadow: '0 8px 32px hsl(var(--primary)/0.10)' }}
                >
                  <iframe
                    title="Store Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2025!2d73.8553!3d18.5196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c065e76af5f7%3A0x5aa8d8c58f5e8d3b!2sLaxmi%20Road%2C%20Pune!5e0!3m2!1sen!2sin!4v1680000000000"
                    width="100%"
                    height="220"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Rating card */}
                <div
                  className="info-card rounded-xl p-5 border border-border/60"
                  style={{
                    background: 'hsl(var(--primary)/0.06)',
                    borderLeft: '3px solid hsl(var(--primary)/0.5)',
                    boxShadow: '0 4px 20px hsl(var(--primary)/0.08)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'hsl(var(--primary)/0.10)' }}
                    >
                      ⭐
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: 'hsl(var(--primary))' }} />
                        ))}
                      </div>
                      <p className="font-semibold text-sm">4.9 / 5 — Highly Rated</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Based on 200+ customer reviews</p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div
                  className="info-card rounded-xl p-5 border border-border/60"
                  style={{
                    background: 'hsl(var(--secondary)/0.08)',
                    borderLeft: '3px solid hsl(var(--primary)/0.5)',
                    boxShadow: '0 4px 20px hsl(var(--primary)/0.08)',
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Quick Connect
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Prefer to chat? Reach us on WhatsApp for faster, personalized responses.
                  </p>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: '#25D366', color: 'white', boxShadow: '0 4px 12px #25D36640' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.12 1.523 5.851L0 24l6.312-1.497A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.374l-.36-.213-3.735.885.939-3.639-.234-.374A9.818 9.818 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z" />
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT INFO CARDS */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-up-4">
            {contactItems.map((item) => (
              <div
                key={item.label}
                className="contact-card rounded-xl p-6 border border-border/60"
                style={{
                  background: 'hsl(var(--primary)/0.06)',
                  borderLeft: '3px solid hsl(var(--primary)/0.5)',
                  boxShadow: '0 4px 20px hsl(var(--primary)/0.08)',
                  transitionDelay: item.delay,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'hsl(var(--primary)/0.10)' }}
                >
                  <item.icon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {item.label}
                </p>
                <p className="font-semibold text-sm mb-0.5">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Contact;