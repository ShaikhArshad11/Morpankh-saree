'use client';

import { useState } from 'react';
import PublicLayout from '@/components/PublicLayout';

const PolicyPage = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <PublicLayout>
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="section-title mb-8">{title}</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">{children}</div>
    </div>
  </PublicLayout>
);

const AnimatedPolicyPage = ({ 
  title, 
  mainContent, 
  icon,
  children 
}: { 
  title: string;
  mainContent: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 min-h-screen">
        {/* Main Content Container */}
        <div
          className="transition-all duration-300 ease-out cursor-move"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-peacock-teal to-royal-purple bg-clip-text text-transparent">
                {title}
              </h1>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-12 mb-12 hover:shadow-3xl transition-shadow duration-300">
              <div className="text-center mb-8">
                <div className="text-7xl mb-6 animate-bounce">{icon}</div>
                <div className="space-y-4">{mainContent}</div>
              </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export const PrivacyPolicy = () => (
  <AnimatedPolicyPage 
    title="Privacy Policy"
    icon="🔒"
    mainContent={
      <>
        <h2 className="text-4xl font-bold text-blue-600 mb-4">Privacy Assured</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          We respect your privacy. When you place an order on our website, we collect basic information such as:
        </p>
        <ul className="text-left space-y-2 text-gray-700 bg-blue-50 p-6 rounded-lg my-4">
          <li className="flex items-center gap-2">• <span>Name</span></li>
          <li className="flex items-center gap-2">• <span>Mobile number</span></li>
          <li className="flex items-center gap-2">• <span>Email address</span></li>
          <li className="flex items-center gap-2">• <span>Shipping address</span></li>
        </ul>
        <p className="text-base text-gray-600 mt-4">
          This information is used only for order processing, delivery and customer support.
        </p>
        <p className="text-base text-gray-600">
          Payment details are securely processed through Razorpay. We cannot store or share your payment information with any third party except payment gateway and delivery partners.
        </p>
        <p className="text-base text-gray-600 mt-4">
          Your data is safe with us.
        </p>
      </>
    }
  >
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Information Collection</h3>
      <ul className="space-y-2 text-gray-700">
        <li>✓ Name & Email</li>
        <li>✓ Phone & Address</li>
        <li>✓ Delivery Details</li>
      </ul>
    </div>
    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Data Security</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        Your data is protected with industry-standard security. Payment information is processed exclusively through Razorpay gateway. We maintain utmost confidentiality.
      </p>
    </div>
  </AnimatedPolicyPage>
);

export const RefundPolicy = () => (
  <AnimatedPolicyPage 
    title="Refund & Exchange Policy"
    icon="❌"
    mainContent={
      <>
        <h2 className="text-4xl font-bold text-red-500 mb-4">No Refund – No Exchange</h2>
        <p className="text-xl text-gray-700 leading-relaxed">
          No refund is provided once the order is placed.
        </p>
        <p className="text-lg text-gray-600">
          No exchange is allowed under any circumstances.
        </p>
        <p className="text-base text-gray-600 mt-4">
          Customers are requested to check product details carefully before placing the order.
        </p>
        <p className="text-base text-gray-600">
          By placing an order, you agree to this policy.
        </p>
      </>
    }
  >
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Key Points</h3>
      <ul className="space-y-2 text-gray-700">
        <li>✓ Final sale - no returns</li>
        <li>✓ No exchanges available</li>
        <li>✓ Check details before purchase</li>
      </ul>
    </div>
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Important Notice</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        Please ensure you are satisfied with your product selection before confirming your order. Once placed, orders cannot be cancelled, returned, or exchanged.
      </p>
    </div>
  </AnimatedPolicyPage>
);

export const ShippingPolicy = () => (
  <AnimatedPolicyPage 
    title="Shipping & Delivery Policy"
    icon="📦"
    mainContent={
      <>
        <h2 className="text-4xl font-bold text-blue-600 mb-4">6–7 Days</h2>
        <p className="text-xl text-gray-700 leading-relaxed">
          We deliver products across India.
        </p>
        <p className="text-lg text-gray-600">
          Orders are dispatched within 2–3 working days after confirmation.
        </p>
        <p className="text-lg text-gray-600">
          Delivery time is 6–7 working days, depending on location.
        </p>
        <p className="text-base text-gray-600 mt-4">
          Delivery delays caused by courier partners, weather conditions, or unforeseen circumstances are not under our control, but we will assist customers wherever possible.
        </p>
      </>
    }
  >
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Delivery Coverage</h3>
      <ul className="space-y-2 text-gray-700">
        <li>📍 Pan India shipping</li>
        <li>📍 Remote areas supported</li>
        <li>📍 Secure packaging</li>
      </ul>
    </div>
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Timeline</h3>
      <ul className="space-y-2 text-gray-700">
        <li>⏱️ Processing: 2–3 days</li>
        <li>⏱️ In Transit: 6–7 days</li>
        <li>⏱️ Total: 8–10 days avg</li>
      </ul>
    </div>
  </AnimatedPolicyPage>
);

export const TermsAndConditions = () => (
  <AnimatedPolicyPage 
    title="Terms & Conditions"
    icon="📋"
    mainContent={
      <>
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Welcome to Morpankh Saree</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          By accessing and using our website, you agree to be bound by these Terms and Conditions, along with our Shipping Policy, Cancellation & Refund Policy, and Privacy Policy. If you do not agree, please do not use our website.
        </p>
      </>
    }
  >
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">1. Introduction</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        We operate an online saree store. By accessing our website, you agree to be bound by these Terms and Conditions.
      </p>
    </div>

    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">2. Products & Services</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        We sell handcrafted traditional sarees. Product specifications, images, and descriptions are for reference only and may vary slightly due to screen settings or product quality variations.
      </p>
    </div>

    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">3. Pricing</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        All prices are displayed in Indian Rupees (₹) and are inclusive of GST. Prices are subject to change without notice.
      </p>
    </div>

    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">4. Orders & Payments</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        Orders are placed online through our website. We use Razorpay as a secure payment gateway for all transactions.
      </p>
    </div>

    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">5. Cancellation Policy</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        Orders once confirmed cannot be cancelled. Please ensure all details are correct before placing your order.
      </p>
    </div>

    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">6. Shipping & Delivery</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        We deliver products across India. Delivery timelines may vary due to location, courier partners, and unforeseen circumstances.
      </p>
    </div>

    <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">7. Return, Refund & Exchange Policy</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        We follow a No Return, No Refund, No Exchange policy. Once the product is delivered, it cannot be returned or exchanged. Customers must contact us within 24 hours of delivery if there are any issues.
      </p>
    </div>

    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">8. User Responsibilities</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        Customers must provide accurate and complete information. Any fraudulent activities will result in order cancellation without prior notice.
      </p>
    </div>

    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">9. Intellectual Property</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        All content on the website, including images, designs, and text, are the exclusive property of Morpankh Saree. Unauthorized use or reproduction is strictly prohibited.
      </p>
    </div>

    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">10. Limitation of Liability</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        We are not responsible for delays caused by courier partners or circumstances beyond our control. Our maximum liability is limited to the value of the product purchased.
      </p>
    </div>

    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">11. Governing Law</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        These Terms and Conditions are governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of Indian courts.
      </p>
    </div>

    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-base mb-3 text-gray-800">12. Contact Information</h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        For any queries or support, you can contact us at:
      </p>
      <div className="mt-3 text-gray-700 text-sm">
        <p>📧 Email: morpankhsaree@gmail.com</p>
        <p>📞 Phone: 917704862</p>
      </div>
    </div>
  </AnimatedPolicyPage>
);

export default PrivacyPolicy;
