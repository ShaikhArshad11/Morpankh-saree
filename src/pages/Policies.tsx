import PublicLayout from '@/components/PublicLayout';

const PolicyPage = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <PublicLayout>
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="section-title mb-8">{title}</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">{children}</div>
    </div>
  </PublicLayout>
);

export const PrivacyPolicy = () => (
  <PolicyPage title="Privacy Policy">
    <p>At Morpankh Saree, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Information We Collect</h3>
    <p>We collect your name, email, phone number, and address when you place an order or create an account.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">How We Use Your Information</h3>
    <p>Your information is used to process orders, improve our services, and send relevant updates about new collections and offers.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Data Security</h3>
    <p>We use industry-standard security measures to protect your data. Your payment information is processed securely through Razorpay.</p>
  </PolicyPage>
);

export const RefundPolicy = () => (
  <PolicyPage title="Refund Policy">
    <p>We want you to be completely satisfied with your purchase at Morpankh Saree.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Returns</h3>
    <p>Products can be returned within 7 days of delivery if they are unused, unwashed, and in original packaging with all tags intact.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Refund Process</h3>
    <p>Once we receive and inspect the returned item, refunds will be processed within 5-7 business days to the original payment method.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Non-Returnable Items</h3>
    <p>Customized or altered products, and items purchased during sale events are non-returnable.</p>
  </PolicyPage>
);

export const ShippingPolicy = () => (
  <PolicyPage title="Shipping Policy">
    <p>We deliver across India with care and reliability.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Delivery Time</h3>
    <p>Standard delivery takes 5-7 business days. Express delivery is available for select locations within 2-3 business days.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Shipping Charges</h3>
    <p>Free shipping on orders above ₹2,999. Standard shipping charges of ₹99 apply for orders below ₹2,999.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Tracking</h3>
    <p>A tracking number will be shared via SMS and email once your order is shipped.</p>
  </PolicyPage>
);

export const TermsAndConditions = () => (
  <PolicyPage title="Terms & Conditions">
    <p>By using Morpankh Saree website and services, you agree to the following terms.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Product Information</h3>
    <p>We strive to display accurate colors and details. Slight variations may occur due to screen settings and photography.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Pricing</h3>
    <p>All prices are in Indian Rupees (₹) and inclusive of GST. We reserve the right to modify prices without prior notice.</p>
    <h3 className="text-foreground font-display font-semibold text-lg">Account Responsibility</h3>
    <p>You are responsible for maintaining the confidentiality of your account and password.</p>
  </PolicyPage>
);

export default PrivacyPolicy;
