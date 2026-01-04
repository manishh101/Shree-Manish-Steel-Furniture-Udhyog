import type { Metadata } from 'next';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: {
    default: 'श्री मनिष स्टील फर्निचर | Shree Manish Steel Furniture | विराटनगर नेपाल',
    template: '%s | श्री मनिष स्टील फर्निचर विराटनगर',
  },
  description: 'विराटनगरको उत्कृष्ट स्टील फर्निचर पसल। अलमिरा, खाट, अफिस फर्निचर, र्‍याक सबै उत्तम मूल्यमा। Best steel furniture shop in Biratnagar, Nepal. Free delivery in Biratnagar, Dharan, Itahari.',
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
    locale: 'ne_NP',
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
