import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div>
            <Image src={logo} alt="Morpankh Saree" width={160} height={48} className="h-12 w-auto mb-4 brightness-0 invert" />
            <p className="text-background/70 text-sm leading-relaxed">
              परंपरेचा मोरपंखी स्पर्श, सौंदर्याची नवी ओळख
            </p>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link href="/privacy-policy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-background transition-colors">Refund Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-background transition-colors">Shipping Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-background transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">About Us</h4>
            <p className="text-sm text-background/70 leading-relaxed">
              We are dedicated to bringing you the finest collection of traditional and contemporary sarees, crafted with attention to detail and quality.
            </p>
          </div>

          {/* Find Us + Social */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Find Us</h4>
            <div className="w-full h-32 bg-background/10 rounded-lg mb-4 flex items-center justify-center text-background/40 text-sm">
              📍 Google Map
            </div>
            <h4 className="font-display text-lg font-semibold mb-3">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-background/20 transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-background/20 transition-colors"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-background/20 transition-colors"><Youtube className="h-4 w-4" /></a>
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-background/20 transition-colors"><MessageCircle className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-sm text-background/50">
          © 2026 Morpankh Saree. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
