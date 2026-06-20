import React from 'react';
import ContactPageContent from '@/components/ContactPageContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Furniture Shop Biratnagar | सम्पर्क - श्री मनिष स्टील फर्निचर',
  description: 'Contact Manish Steel Furniture showroom in Biratnagar. Free delivery in Biratnagar, Dharan, Itahari. Phone: +977 9824336371, WhatsApp available. Visit us at Dharan Road, Biratnagar.',
  keywords: [
    // Primary local keywords
    'contact furniture shop Biratnagar',
    'furniture showroom Biratnagar address',
    'furniture shop phone number Biratnagar',
    'furniture delivery Biratnagar',
    // Nepali keywords
    'फर्निचर पसल विराटनगर ठेगाना',
    'फर्निचर सम्पर्क नेपाल',
    'फर्निचर शोरुम विराटनगर',
    'फर्निचर डेलिभरी विराटनगर',
    // Service area keywords
    'furniture shop Dharan',
    'furniture delivery Itahari',
    'steel furniture contact Nepal',
  ],
  openGraph: {
    title: 'Contact Furniture Shop Biratnagar',
    description: 'Contact Manish Steel Furniture showroom in Biratnagar. Free delivery in Biratnagar, Dharan, Itahari. Phone: +977 9824336371',
    type: 'website',
    url: 'https://manishsteel.com.np/contact',
    locale: 'ne_NP',
    alternateLocale: 'en_NP',
    siteName: 'Shree Manish Steel Furniture',
    images: [
      {
        url: 'https://manishsteel.com.np/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Manish Steel Furniture Biratnagar',
      },
    ],
  },
  other: {
    // Geo-tagging meta tags for local SEO
    'geo.region': 'NP-P1',
    'geo.placename': 'Biratnagar',
    'geo.position': '26.4525;87.2718',
    'ICBM': '26.4525, 87.2718',
  },
};

export default function ContactPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-8 md:px-16 lg:px-24">
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
