"use client";

import { useState } from 'react';
import PublicLayout from '@/components/PublicLayout';
import logo from '@/assets/logo.png';
import Image from 'next/image';

export default function Page() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Real gallery images from public folder
  const galleryImages = [
    { id: 1, src: '/IMG_8328.JPG.jpeg', alt: 'Shop Collection 1', category: 'Collection' },
    { id: 2, src: '/IMG_8329.JPG.jpeg', alt: 'Shop Collection 2', category: 'Collection' },
    { id: 3, src: '/IMG_8330.JPG.jpeg', alt: 'Shop Collection 3', category: 'Collection' },
    { id: 4, src: '/IMG_8331.JPG.jpeg', alt: 'Shop Collection 4', category: 'Collection' },
    { id: 5, src: '/IMG_8332.JPG.jpeg', alt: 'Shop Collection 5', category: 'Collection' },
    { id: 6, src: '/IMG_8333.JPG.jpeg', alt: 'Shop Collection 6', category: 'Collection' },
    { id: 7, src: '/IMG_8334.JPG.jpeg', alt: 'Shop Collection 7', category: 'Collection' },
    { id: 8, src: '/IMG_8335.JPG.jpeg', alt: 'Shop Collection 8', category: 'Collection' },
    { id: 9, src: '/IMG_8338.JPG.jpeg', alt: 'Shop Collection 9', category: 'Collection' },
    { id: 10, src: '/IMG_8339.JPG.jpeg', alt: 'Shop Collection 10', category: 'Collection' },
    { id: 11, src: '/IMG_8340.JPG.jpeg', alt: 'Shop Collection 11', category: 'Collection' },
    { id: 12, src: '/IMG_8341.JPG.jpeg', alt: 'Shop Collection 12', category: 'Collection' },
  ];

  return (
    <PublicLayout>
      <style>{`
        @keyframes float1{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.03)}}
        @keyframes float2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(18px) scale(0.97)}}
        @keyframes float3{0%,100%{transform:translateX(0)}50%{transform:translateX(12px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bannerReveal{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        @keyframes zoomPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes galleryFadeIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .banner-reveal{animation:bannerReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards}
        .fade-up-1{opacity:0;animation:fadeUp 0.6s ease 0.1s forwards}
        .fade-up-2{opacity:0;animation:fadeUp 0.6s ease 0.25s forwards}
        .fade-up-3{opacity:0;animation:fadeUp 0.6s ease 0.4s forwards}
        .fade-up-4{opacity:0;animation:fadeUp 0.6s ease 0.55s forwards}
        .gallery-item{opacity:0;animation:galleryFadeIn 0.6s ease forwards}
        .gallery-item:nth-child(1){animation-delay:0.1s}
        .gallery-item:nth-child(2){animation-delay:0.15s}
        .gallery-item:nth-child(3){animation-delay:0.2s}
        .gallery-item:nth-child(4){animation-delay:0.25s}
        .gallery-item:nth-child(5){animation-delay:0.3s}
        .gallery-item:nth-child(6){animation-delay:0.35s}
        .gallery-item:nth-child(7){animation-delay:0.4s}
        .gallery-item:nth-child(8){animation-delay:0.45s}
        .gallery-item:nth-child(9){animation-delay:0.5s}
        .gallery-item:nth-child(10){animation-delay:0.55s}
        .gallery-item:nth-child(11){animation-delay:0.6s}
        .gallery-item:nth-child(12){animation-delay:0.65s}
        .gallery-item:hover{transform:scale(1.05);box-shadow:0 20px 40px hsl(var(--primary)/0.2)}
        .gallery-item{transition:transform 0.3s ease,box-shadow 0.3s ease}
        .logo-pulse{animation:zoomPulse 4s ease-in-out infinite}
        .spin-ring{animation:spinSlow 22s linear infinite}
        .modal-backdrop{backdrop-filter:blur(8px)}
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(160deg, hsl(var(--primary)/0.06) 0%, hsl(var(--background)) 50%, hsl(var(--secondary)/0.08) 100%)',
          }}
        />

        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 380,
            height: 380,
            top: -80,
            right: -100,
            background: 'radial-gradient(circle, hsl(var(--primary)/0.12), transparent 70%)',
            animation: 'float1 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 260,
            height: 260,
            bottom: 60,
            left: -80,
            background: 'radial-gradient(circle, hsl(var(--secondary)/0.10), transparent 70%)',
            animation: 'float2 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 180,
            height: 180,
            top: '40%',
            left: '5%',
            background: 'radial-gradient(circle, hsl(var(--primary)/0.07), transparent 70%)',
            animation: 'float3 9s ease-in-out infinite',
          }}
        />

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
              Morpankh Saree · Gallery
            </p>
            <h2 className="text-4xl font-bold mb-2">Gallery</h2>
            <p className="text-white/70 text-sm max-w-md">
              Explore our beautiful shop collection showcasing our finest products and store atmosphere.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center mb-14 fade-up-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Our Collection
            </div>
           
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our beautiful shop collection showcasing our finest products and store atmosphere
            </p>
          </div>

          <div className="max-w-6xl mx-auto mb-12 fade-up-2">
            <div
              className="rounded-2xl p-8 border border-border/60 shadow-xl backdrop-blur-xl"
              style={{ background: 'hsl(var(--card)/0.85)' }}
            >
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div
                    className="absolute inset-0 rounded-full spin-ring"
                    style={{
                      border: '2px dashed hsl(var(--primary)/0.25)',
                      margin: '-12px',
                    }}
                  />
                  <div
                    className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center border border-primary/20 shadow-inner logo-pulse"
                    style={{ background: 'hsl(var(--primary)/0.08)' }}
                  >
                    <Image src={logo} alt="Morpankh Logo" height={72} width={72} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                    Our Shop Collection
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Our gallery showcases the beautiful atmosphere of our shop and the quality products we offer, 
                    carefully curated to provide the best shopping experience for our customers.
                  </p>
                  <div
                    className="text-left space-y-2 text-sm rounded-xl my-4 p-5 border border-primary/15"
                    style={{ background: 'hsl(var(--primary)/0.06)' }}
                  >
                    {[
                      'Beautiful shop ambiance',
                      'Quality products collection',
                      'Customer-friendly environment',
                      'Traditional & modern designs',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-foreground">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: 'hsl(var(--primary))' }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Browse through our gallery to explore our shop and discover the quality products we offer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto fade-up-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="gallery-item rounded-xl overflow-hidden border border-border/60 cursor-pointer"
                  style={{
                    background: 'hsl(var(--card)/0.85)',
                    boxShadow: '0 4px 20px hsl(var(--primary)/0.08)',
                  }}
                  onClick={() => setSelectedImage(image.id)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-xs uppercase tracking-wide opacity-90">{image.category}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1" style={{ color: 'hsl(var(--primary))' }}>
                      {image.alt}
                    </h3>
                    <p className="text-xs text-muted-foreground">{image.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-border/60"
              style={{ background: 'hsl(var(--card)/0.95)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
              <div className="aspect-[4/5] w-full max-w-2xl mx-auto relative">
                <Image
                  src={galleryImages.find(img => img.id === selectedImage)?.src || ''}
                  alt={galleryImages.find(img => img.id === selectedImage)?.alt || ''}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--primary))' }}>
                  {galleryImages.find(img => img.id === selectedImage)?.alt}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {galleryImages.find(img => img.id === selectedImage)?.category}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
