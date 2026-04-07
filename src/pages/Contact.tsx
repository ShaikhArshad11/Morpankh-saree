// import { useState } from 'react';
// import { MapPin, Phone, Mail } from 'lucide-react';
// import PublicLayout from '@/components/PublicLayout';
// import { toast } from '@/hooks/use-toast';

// const Contact = () => {
//   const [form, setForm] = useState({ name: '', email: '', message: '' });
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/contact', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         toast({ title: 'Message sent!', description: 'We will get back to you soon.' });
//         setForm({ name: '', email: '', message: '' });
//       } else {
//         toast({ title: data.error || 'Failed to send message', variant: 'destructive' });
//       }
//     } catch {
//       toast({ title: 'Failed to send message', variant: 'destructive' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <PublicLayout>
//       <div className="container mx-auto px-4 py-12">
//         <h1 className="section-title mb-8">Contact Us</h1>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
//           <div className="space-y-6">
//             {[
//               { icon: MapPin, label: 'Address', value: 'Shop No. 12, Laxmi Road, Pune, Maharashtra 411030' },
//               { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
//               { icon: Mail, label: 'Email', value: 'info@morpankhsaree.com' },
//             ].map((item) => (
//               <div key={item.label} className="flex gap-4 items-start">
//                 <div className="p-3 bg-primary/10 rounded-lg"><item.icon className="h-5 w-5 text-primary" /></div>
//                 <div><h3 className="font-medium">{item.label}</h3><p className="text-muted-foreground text-sm">{item.value}</p></div>
//               </div>
//             ))}

//             {/* Google Map */}
//             <div className="rounded-xl overflow-hidden border border-border mt-4">
//               <iframe
//                 title="Store Location"
//                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2025!2d73.8553!3d18.5196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c065e76af5f7%3A0x5aa8d8c58f5e8d3b!2sLaxmi%20Road%2C%20Pune!5e0!3m2!1sen!2sin!4v1680000000000"
//                 width="100%"
//                 height="250"
//                 style={{ border: 0 }}
//                 allowFullScreen
//                 loading="lazy"
//                 referrerPolicy="no-referrer-when-downgrade"
//               />
//             </div>
//           </div>
//           <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border space-y-4 h-fit">
//             <div>
//               <label className="block text-sm font-medium mb-1">Name</label>
//               <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Email</label>
//               <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Message</label>
//               <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
//             </div>
//             <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
//               {isLoading ? 'Sending...' : 'Send Message'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </PublicLayout>
//   );
// };

// export default Contact;



import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Send, Clock, Star } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { toast } from '@/hooks/use-toast';

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('revealed'); observer.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  useScrollReveal();

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
      color: 'hsl(var(--primary))',
      bg: 'hsl(var(--primary)/0.08)',
      delay: '0s',
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: '+91 98765 43210',
      sub: 'Mon – Sat, 10am – 7pm',
      color: 'hsl(var(--secondary))',
      bg: 'hsl(var(--secondary)/0.08)',
      delay: '0.1s',
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: 'info@morpankhsaree.com',
      sub: 'Reply within 24 hours',
      color: 'hsl(var(--accent))',
      bg: 'hsl(var(--accent)/0.08)',
      delay: '0.2s',
    },
    {
      icon: Clock,
      label: 'Store Hours',
      value: 'Mon – Sat: 10am – 7pm',
      sub: 'Sunday: 11am – 5pm',
      color: 'hsl(var(--gold))',
      bg: 'hsl(var(--gold)/0.08)',
      delay: '0.3s',
    },
  ];

  return (
    <PublicLayout>
      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-20px) rotate(3deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(16px)} }
        @keyframes float3 { 0%,100%{transform:translateX(0) rotate(0)} 50%{transform:translateX(12px) rotate(-3deg)} }
        @keyframes spinSlow { to{transform:rotate(360deg)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .hero-1{animation:heroIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.05s both}
        .hero-2{animation:heroIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both}
        .hero-3{animation:heroIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.25s both}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity 0.6s ease,transform 0.6s ease}
        .reveal.revealed{opacity:1;transform:translateY(0)}
        .btn-send:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 28px hsl(var(--primary)/0.35)}
        .btn-send{transition:all 0.25s ease}
        .card-contact:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.08)}
        .card-contact{transition:all 0.3s ease}
      `}</style>

      {/* Hero section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, hsl(var(--primary)/0.06), transparent 60%)' }} />
        
        {/* Floating shapes */}
        <div className="absolute top-8 right-20 hidden lg:block" style={{ animation: 'float1 9s ease-in-out infinite' }}>
          <div className="w-16 h-16 rounded-2xl rotate-12 border border-primary/20" style={{ background: 'hsl(var(--primary)/0.05)' }} />
        </div>
        <div className="absolute top-20 left-16 hidden lg:block" style={{ animation: 'float2 7s ease-in-out infinite 1s' }}>
          <div className="w-10 h-10 rounded-full border border-secondary/20" style={{ background: 'hsl(var(--secondary)/0.06)' }} />
        </div>
        <div className="absolute bottom-8 right-1/3 hidden lg:block" style={{ animation: 'float3 11s ease-in-out infinite 0.5s' }}>
          <div className="w-8 h-8 rounded-lg rotate-45 border border-gold/20" style={{ background: 'hsl(var(--gold)/0.05)' }} />
        </div>
        <div className="absolute top-12 left-1/3 hidden lg:block" style={{ animation: 'spinSlow 25s linear infinite' }}>
          <div className="w-20 h-20 rounded-full border border-dashed border-primary/10" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-widest uppercase mb-6 hero-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Get In Touch
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4 hero-2">
            We'd Love to{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Hear</span>
            <br />From You
          </h1>
          
          <p className="text-muted-foreground max-w-xl mx-auto text-lg hero-3">
            Whether you have a question, feedback, or just want to say hello — our team is here for you.
          </p>
        </div>
      </section>


      {/* Main content: Form + Map */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            
            {/* Form - takes 3 cols */}
            <div className="lg:col-span-3 reveal">
              <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-xl">
                {/* Form header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: 'hsl(var(--primary)/0.1)' }}>✍️</div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Send a Message</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold">Let's start a conversation</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name</label>
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
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
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

                  {/* Message */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                      <span className={`text-xs transition-colors ${charCount > 450 ? 'text-destructive' : 'text-muted-foreground/50'}`}>{charCount}/500</span>
                    </div>
                    <textarea
                      value={form.message}
                      onChange={(e) => { setForm({ ...form, message: e.target.value }); setCharCount(e.target.value.length); }}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused(null)}
                      required
                      rows={5}
                      maxLength={500}
                      placeholder="Tell us about your inquiry, the saree you're looking for, or any questions you have..."
                      className={inputClass('message')}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-send w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(168 60% 22%))', color: 'white' }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>

                  {/* Trust row */}
                  <div className="flex items-center justify-center gap-6 pt-2">
                    {['🔒 Private', '⚡ Fast reply', '💬 Friendly'].map((t) => (
                      <span key={t} className="text-xs text-muted-foreground/60">{t}</span>
                    ))}
                  </div>
                </form>
              </div>
            </div>

            {/* Right side - Map + quick info */}
            <div className="lg:col-span-2 space-y-5 reveal" style={{ transitionDelay: '0.15s' }}>
              
              {/* Google Map */}
              <div className="rounded-2xl overflow-hidden border border-border/60 shadow-lg">
                <iframe
                  title="Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2025!2d73.8553!3d18.5196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c065e76af5f7%3A0x5aa8d8c58f5e8d3b!2sLaxmi%20Road%2C%20Pune!5e0!3m2!1sen!2sin!4v1680000000000"
                  width="100%"
                  height="240"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Rating card */}
              <div className="rounded-2xl border border-border/60 p-5 bg-card/60 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: 'hsl(var(--gold)/0.1)' }}>⭐</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: 'hsl(var(--gold))' }} />
                      ))}
                    </div>
                    <p className="font-semibold text-sm">4.9 / 5 — Highly Rated</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Based on 200+ customer reviews</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp quick contact */}
              <div className="rounded-2xl border border-border/60 p-5 bg-card/60 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Connect</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Prefer to chat? Reach us directly on WhatsApp for faster responses and personalized assistance.
                </p>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: '#25D366', color: 'white', boxShadow: '0 4px 12px #25D36640' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.12 1.523 5.851L0 24l6.312-1.497A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.374l-.36-.213-3.735.885.939-3.639-.234-.374A9.818 9.818 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/></svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* Contact cards */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal">
            {contactItems.map((item) => (
              <div key={item.label} className="card-contact rounded-2xl border border-border/60 p-5 bg-card/60 backdrop-blur-sm"
                style={{ transitionDelay: item.delay }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: item.bg }}>
                  <item.icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                <p className="font-semibold text-sm mb-0.5">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;