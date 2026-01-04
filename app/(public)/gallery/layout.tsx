import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'फर्निचर ग्यालरी | Furniture Gallery - स्टील फर्निचर डिजाइन नेपाल',
  description: 'हाम्रो फर्निचर ग्यालरी हेर्नुहोस्। विराटनगरमा बनेको उत्कृष्ट स्टील र काठको फर्निचर। Browse our furniture gallery - premium steel and wood furniture made in Biratnagar, Nepal.',
  keywords: [
    // Nepali keywords
    'फर्निचर डिजाइन नेपाल',
    'स्टील फर्निचर ग्यालरी',
    'फर्निचर फोटो विराटनगर',
    'अलमिरा डिजाइन',
    'आधुनिक फर्निचर नेपाल',
    'खाट डिजाइन',
    'अफिस फर्निचर डिजाइन',
    // English keywords
    'furniture design Nepal',
    'steel furniture gallery',
    'furniture images Biratnagar',
    'almirah designs',
    'modern furniture Nepal',
  ],
  openGraph: {
    title: 'फर्निचर ग्यालरी | Furniture Gallery | Shree Manish Steel Furniture',
    description: 'विराटनगरको उत्कृष्ट स्टील र काठको फर्निचर - Explore our furniture gallery',
    type: 'website',
    locale: 'ne_NP',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
