import React from 'react';
import ContactPageContent from '@/components/ContactPageContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'सम्पर्क | Contact Us - श्री मनिष स्टील फर्निचर विराटनगर',
  description: 'हामीलाई सम्पर्क गर्नुहोस्। श्री मनिष स्टील फर्निचर शोरुम विराटनगर। विराटनगर, धरान, इटहरीमा निःशुल्क डेलिभरी। फोन: 9824336371। Contact us for steel furniture in Biratnagar.',
  keywords: [
    // Nepali keywords
    'फर्निचर पसल विराटनगर ठेगाना',
    'फर्निचर सम्पर्क नेपाल',
    'फर्निचर शोरुम विराटनगर',
    'फर्निचर डेलिभरी विराटनगर',
    'स्टील फर्निचर किन्ने',
    // English keywords
    'furniture shop Biratnagar address',
    'contact furniture shop Nepal',
    'furniture showroom Biratnagar',
    'furniture delivery Biratnagar',
  ],
  openGraph: {
    locale: 'ne_NP',
  },
};

export default function ContactPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto">
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
