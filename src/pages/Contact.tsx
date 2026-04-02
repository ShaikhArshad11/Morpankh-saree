import { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Message sent!', description: 'We will get back to you soon.' });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="section-title mb-8">Contact Us</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="space-y-6">
            {[
              { icon: MapPin, label: 'Address', value: 'Shop No. 12, Laxmi Road, Pune, Maharashtra 411030' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
              { icon: Mail, label: 'Email', value: 'info@morpankhsaree.com' },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 items-start">
                <div className="p-3 bg-primary/10 rounded-lg"><item.icon className="h-5 w-5 text-primary" /></div>
                <div><h3 className="font-medium">{item.label}</h3><p className="text-muted-foreground text-sm">{item.value}</p></div>
              </div>
            ))}

            {/* Google Map */}
            <div className="rounded-xl overflow-hidden border border-border mt-4">
              <iframe
                title="Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2025!2d73.8553!3d18.5196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c065e76af5f7%3A0x5aa8d8c58f5e8d3b!2sLaxmi%20Road%2C%20Pune!5e0!3m2!1sen!2sin!4v1680000000000"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border space-y-4 h-fit">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Contact;
