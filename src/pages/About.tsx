import PublicLayout from '@/components/PublicLayout';
import logo from '@/assets/logo.png';

const About = () => (
  <PublicLayout>
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <img src={logo.src} alt="Morpankh Saree" className="h-24 mx-auto mb-6" />
        <h1 className="section-title mb-6">About Morpankh Saree</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Morpankh Saree is a celebration of India's rich textile heritage. We bring you the finest collection of handcrafted sarees from across the country — from the opulent Banarasi silks to the regal Paithani weaves of Maharashtra.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Our mission is to preserve traditional weaving art forms while making them accessible to the modern woman. Each saree in our collection tells a story of craftsmanship passed down through generations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { label: 'Happy Customers', value: '10,000+' },
            { label: 'Sarees Sold', value: '25,000+' },
            { label: 'Weaver Partners', value: '500+' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-6 border border-border">
              <p className="text-3xl font-display font-bold text-primary">{stat.value}</p>
              <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </PublicLayout>
);

export default About;
