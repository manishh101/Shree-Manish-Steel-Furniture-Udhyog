'use client';

import React, { useState } from 'react';

interface KeywordPair {
  formal: string;
  colloquial: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface CategoryDescriptionProps {
  name: string;
  description?: string;
  dualKeywords?: KeywordPair[];
  faqs?: FAQ[];
}

/**
 * CategoryDescription Component
 *
 * Renders SEO-rich category descriptions on the products listing page
 * when a specific category is selected. Supports expandable long text,
 * dual keywords display, and FAQ schema integration.
 */
export default function CategoryDescription({
  name,
  description,
  dualKeywords = [],
  faqs = [],
}: CategoryDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  const paragraphs = description
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  // Show first 2 paragraphs by default
  const previewParagraphs = paragraphs.slice(0, 2);
  const hiddenParagraphs = paragraphs.slice(2);
  const hasMore = hiddenParagraphs.length > 0;

  // Build FAQPage schema
  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <section
      className="bg-white border border-gray-100 rounded-xl p-5 mt-4 mb-6"
      aria-label={`About ${name}`}
    >
      {/* FAQ Schema injection */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        About {name}
      </h2>

      {/* Dual keywords badges */}
      {dualKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4" aria-label="Also known as">
          {dualKeywords.map((pair, i) => (
            <span
              key={i}
              className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full"
            >
              {pair.formal} ({pair.colloquial})
            </span>
          ))}
        </div>
      )}

      {/* Description text */}
      <div className="prose prose-sm max-w-none text-gray-600 space-y-3">
        {previewParagraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}

        {hasMore && (
          <>
            <div
              className={`space-y-3 overflow-hidden transition-all duration-300 ${
                expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {hiddenParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary text-sm font-medium hover:underline mt-1"
              aria-expanded={expanded}
            >
              {expanded ? 'Show less ▲' : 'Read more ▼'}
            </button>
          </>
        )}
      </div>

      {/* FAQs */}
      {faqs.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 flex justify-between items-center"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="ml-2 text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100">
          {answer}
        </div>
      )}
    </div>
  );
}
