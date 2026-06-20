import React from 'react';
import type { Metadata } from 'next';
import { schemaGenerator } from '@/lib/seo/schemaGenerator';
import FAQSection from '@/components/FAQSection';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import FAQ from '@/models/FAQ';
import {
  GENERAL_FAQS,
  DELIVERY_FAQS,
  PAYMENT_FAQS,
  WARRANTY_FAQS,
  CUSTOM_ORDER_FAQS,
  ALL_FAQS,
} from '@/lib/seo/faqContent';
import { FAQItem } from '@/components/FAQSection';

// Disable caching to always reflect admin changes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Steel Furniture Biratnagar - श्री मनिष',
  description:
    'Common questions about steel furniture (almirah/daraj, powder coating), delivery to Biratnagar, Dharan, Itahari, warranty, payment options, custom orders, and returns at Shree Manish Steel Furniture.',
  keywords: [
    'furniture FAQ Biratnagar',
    'steel almirah questions Nepal',
    'furniture delivery Biratnagar',
    'steel daraj price',
    'furniture warranty Nepal',
    'custom furniture Nepal',
    'furniture payment options Nepal',
    'almirah FAQ',
    'daraj price Biratnagar',
    'powder coating questions',
    'furniture returns policy',
    'steel furniture warranty',
    'custom furniture delivery',
  ],
  openGraph: {
    title: 'FAQ - Steel Furniture Biratnagar | Shree Manish Steel',
    description:
      'Answers to common questions about our steel furniture, delivery areas, warranty, payment methods, and custom orders.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://manishsteel.com.np/faq',
  },
};

interface FAQsByCategory {
  general: FAQItem[];
  delivery: FAQItem[];
  payment: FAQItem[];
  warranty: FAQItem[];
  custom_orders: FAQItem[];
}

// Fetch FAQs from DB, grouped by category. Falls back to static data if DB is empty.
async function getFAQsByCategory(): Promise<FAQsByCategory> {
  try {
    await connectDB();

    const dbFaqs = await FAQ.find().sort({ category: 1, displayOrder: 1 }).lean();

    if (dbFaqs && dbFaqs.length > 0) {
      const grouped: FAQsByCategory = {
        general: [],
        delivery: [],
        payment: [],
        warranty: [],
        custom_orders: [],
      };

      for (const faq of dbFaqs) {
        const cat = faq.category as keyof FAQsByCategory;
        if (grouped[cat]) {
          grouped[cat].push({ question: faq.question, answer: faq.answer });
        }
      }

      return grouped;
    }
  } catch (error) {
    console.error('Error fetching FAQs from DB, falling back to static data:', error);
  }

  // Static fallback
  return {
    general: GENERAL_FAQS,
    delivery: DELIVERY_FAQS,
    payment: PAYMENT_FAQS,
    warranty: WARRANTY_FAQS,
    custom_orders: CUSTOM_ORDER_FAQS,
  };
}

export default async function FAQPage() {
  const faqsByCategory = await getFAQsByCategory();

  // All FAQs combined for the SEO schema
  const allFaqsForSchema: FAQItem[] = [
    ...faqsByCategory.general,
    ...faqsByCategory.delivery,
    ...faqsByCategory.payment,
    ...faqsByCategory.warranty,
    ...faqsByCategory.custom_orders,
  ];

  // Build FAQPage schema from dynamic data
  const faqSchema = schemaGenerator.generateFAQSchema(
    allFaqsForSchema.length > 0 ? allFaqsForSchema : ALL_FAQS
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="bg-primary text-white py-14">
        <div className="container mx-auto px-8 md:px-16 lg:px-24">
          <nav className="text-white/60 text-sm mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">FAQ</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-white/80 max-w-2xl">
            Everything you need to know about our steel furniture, delivery,
            warranty, payment options, and custom orders. Can&apos;t find your answer?{' '}
            <Link href="/contact" className="underline hover:text-accent transition-colors">
              Contact us
            </Link>.
          </p>
        </div>
      </section>

      {/* FAQ Content Organized by Category */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-8 md:px-16 lg:px-24 max-w-4xl space-y-12">
          {/* General FAQs */}
          {faqsByCategory.general.length > 0 && (
            <FAQSection
              faqs={faqsByCategory.general}
              title="General Questions"
              includeSchema={false}
            />
          )}

          {/* Delivery FAQs */}
          {faqsByCategory.delivery.length > 0 && (
            <FAQSection
              faqs={faqsByCategory.delivery}
              title="Delivery & Service Areas"
              includeSchema={false}
            />
          )}

          {/* Payment FAQs */}
          {faqsByCategory.payment.length > 0 && (
            <FAQSection
              faqs={faqsByCategory.payment}
              title="Payment Methods & Options"
              includeSchema={false}
            />
          )}

          {/* Warranty FAQs */}
          {faqsByCategory.warranty.length > 0 && (
            <FAQSection
              faqs={faqsByCategory.warranty}
              title="Warranty & Returns"
              includeSchema={false}
            />
          )}

          {/* Custom Orders FAQs */}
          {faqsByCategory.custom_orders.length > 0 && (
            <FAQSection
              faqs={faqsByCategory.custom_orders}
              title="Custom Orders & Customization"
              includeSchema={false}
            />
          )}

          {/* CTA */}
          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-gray-700 mb-4 font-medium">
              Still have questions? We&apos;re happy to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/9779824336371?text=Hello!%20I%20have%20a%20question%20about%20your%20furniture."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63" />
                </svg>
                Chat on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
