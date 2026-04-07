// import PublicLayout from '@/components/PublicLayout';
// import logo from '@/assets/logo.png';

// const About = () => (
//   <PublicLayout>
//     <div className="container mx-auto px-4 py-12">
//       <div className="max-w-3xl mx-auto text-center">
//         <img src={logo.src} alt="Morpankh Saree" className="h-24 mx-auto mb-6" />
//         <h1 className="section-title mb-6">About Morpankh Saree</h1>
//         <p className="text-muted-foreground leading-relaxed mb-6">
//           Morpankh Saree is a celebration of India's rich textile heritage. We bring you the finest collection of handcrafted sarees from across the country — from the opulent Banarasi silks to the regal Paithani weaves of Maharashtra.
//         </p>
//         <p className="text-muted-foreground leading-relaxed mb-6">
//           Our mission is to preserve traditional weaving art forms while making them accessible to the modern woman. Each saree in our collection tells a story of craftsmanship passed down through generations.
//         </p>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
//           {[
//             { label: 'Happy Customers', value: '10,000+' },
//             { label: 'Sarees Sold', value: '25,000+' },
//             { label: 'Weaver Partners', value: '500+' },
//           ].map((stat) => (
//             <div key={stat.label} className="bg-card rounded-xl p-6 border border-border">
//               <p className="text-3xl font-display font-bold text-primary">{stat.value}</p>
//               <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   </PublicLayout>
// );

// export default About;



import PublicLayout from '@/components/PublicLayout';
import logo from '@/assets/logo.png';
import Image from 'next/image';

const About = () => (
  <PublicLayout>
    <style>{`
      @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
      @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      .fade-1{animation:fadeUp 0.7s ease 0.1s both}
      .fade-2{animation:fadeUp 0.7s ease 0.2s both}
      .fade-3{animation:fadeUp 0.7s ease 0.3s both}
      .fade-4{animation:fadeUp 0.7s ease 0.4s both}
    `}</style>

    {/* HERO */}
    <section className="relative pt-20 pb-16 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />

      {/* Floating shapes */}
      <div className="absolute top-10 left-20 hidden lg:block" style={{ animation: 'float1 8s ease-in-out infinite' }}>
        <div className="w-16 h-16 rounded-2xl border border-primary/20" />
      </div>
      <div className="absolute bottom-10 right-20 hidden lg:block" style={{ animation: 'float2 6s ease-in-out infinite' }}>
        <div className="w-10 h-10 rounded-full border border-secondary/20" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <Image src={logo} alt="Morpankh Logo" height={300} width={300} className='mx-auto'/>

        <h1 className="text-5xl font-bold mb-4 fade-2">
          About{' '}
          <span className="text-primary">Morpankh</span>
        </h1>

        <p className="text-muted-foreground text-lg fade-3">
          A timeless blend of tradition, craftsmanship, and elegance - bringing India’s finest sarees to your wardrobe.
        </p>
      </div>
    </section>

    {/* STORY + IMAGE STYLE SECTION */}
    <section className="py-16">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT TEXT */}
        <div className="fade-2">
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Morpankh Saree is more than just a brand — it is a tribute to India’s rich textile heritage.
            From Banarasi silks to Paithani masterpieces, every saree represents generations of artistry.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We work directly with skilled artisans across India, ensuring authenticity, quality, and fair opportunities for traditional weavers.
          </p>
        </div>

        {/* RIGHT VISUAL CARD */}
        <div className="fade-3">
          <div className="rounded-3xl border border-border p-8 bg-card shadow-xl">
            <p className="text-lg font-semibold mb-3">✨ Our Mission</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To preserve traditional weaving art forms while making them accessible to modern women worldwide.
            </p>
          </div>
        </div>

      </div>
    </section>

    {/* STATS */}
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

          {[
            { label: 'Happy Customers', value: '10K+' },
            { label: 'Sarees Sold', value: '25K+' },
            { label: 'Weaver Partners', value: '500+' },
          ].map((stat, i) => (
            <div key={stat.label}
              className={`p-6 rounded-2xl border border-border bg-card fade-${i + 2}`}>
              
              <p className="text-3xl font-bold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-muted-foreground text-sm">
                {stat.label}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>

    {/* WHY CHOOSE US */}
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <h2 className="text-3xl font-bold mb-10 fade-1">Why Choose Us</h2>

        <div className="grid md:grid-cols-3 gap-6">

          {[
            {
              title: 'Authentic Handcrafted',
              desc: 'Every saree is made by skilled artisans using traditional techniques.',
              icon: '🧵'
            },
            {
              title: 'Premium Quality',
              desc: 'We ensure top-quality fabrics and craftsmanship in every product.',
              icon: '✨'
            },
            {
              title: 'Trusted by Thousands',
              desc: 'Loved by customers across India with 4.9★ satisfaction.',
              icon: '⭐'
            },
          ].map((item, i) => (
            <div key={item.title}
              className={`p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all fade-${i + 2}`}>
              
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">
                {item.desc}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  </PublicLayout>
);

export default About;