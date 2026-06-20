'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { schemaGenerator } from '../lib/seo/schemaGenerator';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  /** Inject FAQPage schema into the page. Use on pages that have a primary FAQ set. */
  includeSchema?: boolean;
  className?: string;
}

/**
 * FAQSection Component
 *
 * Reusable accordion FAQ component with optional FAQPage schema injection.
 * Used on product pages, category pages, and the dedicated /faq page.
 */
export default function FAQSection({
  faqs,
  title = 'Frequently Asked Questions',
  includeSchema = false,
  className = '',
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const faqSchema = includeSchema ? schemaGenerator.generateFAQSchema(faqs) : null;

  return (
    <section className={`mt-8 ${className}`} aria-labelledby="faq-heading">
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <h2 id="faq-heading" className="text-xl font-semibold text-gray-800 mb-4">
        {title}
      </h2>

      <div className="space-y-2">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className="w-full text-left px-5 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                <span className="text-primary flex-shrink-0 text-sm" aria-hidden="true">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                role="region"
                hidden={!isOpen}
                className="px-5 pb-4 pt-1 text-gray-600 text-sm border-t border-gray-100 bg-gray-50"
              >
                {faq.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
