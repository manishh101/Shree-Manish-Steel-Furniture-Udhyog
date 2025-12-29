import React from 'react';
import ContactPageContent from '@/components/ContactPageContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Visit Our Furniture Showroom in Biratnagar',
  description: 'Contact Shree Manish Steel Furniture in Biratnagar. Visit our showroom, call us, or send inquiry. Free furniture delivery in Biratnagar, Dharan, Itahari. Phone: 9824336371',
  keywords: ['furniture shop Biratnagar address', 'contact furniture shop Nepal', 'furniture showroom Biratnagar', 'furniture delivery Biratnagar'],
};

export default function ContactPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-lg md:text-xl max-w-3xl">
            Have questions or need more information? We&apos;re here to help. Reach out to us using the form below or contact details.
          </p>
        </div>
      </section>
      
      {/* Dynamic Contact Content - Uses site settings from database */}
      <ContactPageContent />
    </div>
  );
}
