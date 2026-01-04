import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'स्टील फर्निचर | Steel & Wood Furniture Products | विराटनगर नेपाल',
  description: 'विराटनगरमा उत्कृष्ट स्टील फर्निचर किन्नुहोस्। अलमिरा, खाट, अफिस फर्निचर, र्‍याक सबै उत्तम मूल्यमा। Browse our complete collection of steel furniture. Free delivery in Biratnagar, Dharan, Itahari.',
  keywords: [
    // English keywords
    'buy steel furniture Biratnagar',
    'steel almirah price Nepal',
    'office furniture Biratnagar',
    'steel bed Biratnagar',
    'furniture shop Biratnagar',
    'wood furniture Nepal',
    'steel rack price',
    'wardrobe Biratnagar',
    'furniture delivery Dharan Itahari',
    'Shree Manish Steel Furniture',
    // Nepali keywords
    'स्टील फर्निचर',
    'स्टील अलमिरा',
    'अलमारी',
    'विराटनगर फर्निचर',
    'फर्निचर नेपाल',
    'स्टील खाट',
    'अफिस फर्निचर',
    'फर्निचर किन्ने',
    'धरान फर्निचर',
    'इटहरी फर्निचर',
    'वार्डरोब',
    'स्टील र्‍याक',
    // Transliterated keywords (how Nepalis might type in English)
    'steel almirah price biratnagar',
    'office table biratnagar',
    'steel khat Nepal',
    'furniture kinne thau biratnagar',
    'almirah nepal',
    'steel furniture price nepal',
  ],
  openGraph: {
    title: 'स्टील फर्निचर | Steel & Wood Furniture | विराटनगर',
    description: 'विराटनगरमा उत्कृष्ट स्टील फर्निचर। Premium steel furniture at affordable prices. Free delivery!',
    type: 'website',
    locale: 'ne_NP',
  },
  alternates: {
    languages: {
      'ne-NP': '/products',
      'en-NP': '/products',
    },
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
