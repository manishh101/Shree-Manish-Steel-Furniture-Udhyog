import type { Metadata } from 'next';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: {
    default: 'Manish Steel Furniture - Premium Steel Furniture Nepal | Biratnagar',
    template: '%s | श्री मनिष स्टील फर्निचर विराटनगर',
  },
  description: 'Premium steel furniture manufacturer in Nepal. Quality office and household furniture at affordable prices. Serving Biratnagar, Dharan, Itahari and across Nepal with fast delivery and home setup.',
  keywords: [
    // Core Nepali keywords
    'स्टील फर्निचर',
    'स्टील अलमिरा',
    'विराटनगर फर्निचर',
    'फर्निचर नेपाल',
    'स्टील खाट',
    'अफिस फर्निचर',
    'श्री मनिष स्टील',
    // Core English keywords
    'steel furniture Nepal',
    'steel furniture Biratnagar',
    'furniture shop Biratnagar',
    'Shree Manish Steel Furniture',
    // Location-based
    'धरान फर्निचर',
    'इटहरी फर्निचर',
  ],
  openGraph: {
    title: 'Manish Steel Furniture - Premium Steel Furniture Nepal | Biratnagar',
    description: 'Premium steel furniture manufacturer in Nepal. Quality office and household furniture at affordable prices. Serving Biratnagar, Dharan, Itahari and across Nepal with fast delivery and home setup.',
    type: 'website',
    locale: 'ne_NP',
    alternateLocale: ['en_NP'],
    url: 'https://manishsteel.com.np',
    siteName: 'Manish Steel Furniture',
    images: [
      {
        url: 'https://manishsteel.com.np/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Manish Steel Furniture - Premium Steel Furniture Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manish Steel Furniture - Premium Steel Furniture Nepal | Biratnagar',
    description: 'Premium steel furniture manufacturer in Nepal. Quality office and household furniture at affordable prices. Serving Biratnagar, Dharan, Itahari and across Nepal with fast delivery and home setup.',
    images: ['https://manishsteel.com.np/images/og-image.jpg'],
  },
  alternates: {
    languages: {
      'ne-NP': 'https://manishsteel.com.np',
      'en-NP': 'https://manishsteel.com.np',
    },
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
