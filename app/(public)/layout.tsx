import type { Metadata } from 'next';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: {
    default: 'Best Steel Furniture Biratnagar | Almirah Daraj Powder Coated | Affordable Prices Nepal',
    template: '%s | श्री मनिष स्टील फर्निचर विराटनगर',
  },
  description: 'Best steel furniture shop in Biratnagar, Nepal. Premium almirahs (daraj), powder coating services, tables & office furniture at affordable prices. Free delivery in Biratnagar, Dharan, Itahari. 5-year warranty. Shop quality steel furniture online.',
  keywords: [
    // Dual keyword pairs (formal/colloquial) - HIGHEST PRIORITY
    'steel almirah Biratnagar', 'steel daraj Biratnagar', 'almirah daraj Nepal',
    'powder coating Biratnagar', 'powder coating services', 'metal powder coating', 'industrial powder coating',
    'wardrobe Biratnagar', 'kapada rakhne', 'steel wardrobe',
    
    // Core local keywords with value propositions
    'best furniture shop Biratnagar', 'furniture shop Biratnagar', 'steel furniture Biratnagar',
    'affordable furniture Biratnagar', 'cheap furniture Biratnagar', 'sasto furniture Nepal',
    'furniture Biratnagar Nepal', 'furniture store Biratnagar',
    
    // Service areas - LOCAL SEO
    'furniture Dharan', 'furniture Itahari', 'furniture Morang', 'furniture Damak',
    'steel furniture Dharan', 'furniture shop Dharan', 'furniture delivery Biratnagar',
    
    // Value proposition keywords
    'free delivery furniture Nepal', 'furniture warranty', 'furniture installation',
    'cheap furniture Nepal', 'affordable steel furniture', 'budget furniture',
    
    // Product categories with dual terms
    'office furniture Biratnagar', 'office furniture Nepal', 'office daraj', 'office table',
    'school furniture Biratnagar', 'school furniture Nepal', 'school desk', 'school bench',
    'computer table Biratnagar', 'study table', 'dining table', 'office desk',
    'steel rack', 'book shelf', 'shoe rack', 'display rack',
    
    // Core Nepali keywords
    'फर्निचर विराटनगर',
    'स्टील फर्निचर',
    'स्टील अलमिरा',
    'विराटनगर फर्निचर',
    'फर्निचर नेपाल',
    'पाउडर कोटिंग',
    'अफिस फर्निचर',
    'श्री मनिष स्टील',
    'धरान फर्निचर',
    'इटहरी फर्निचर',
    'सस्तो फर्निचर',
    'दराज',
    'पाउडर कोटिंग सेवा',
  ],
  openGraph: {
    title: 'Best Steel Furniture Biratnagar | Almirah Daraj Powder Coated | Affordable Prices Nepal',
    description: 'Best steel furniture shop in Biratnagar, Nepal. Premium almirahs (daraj), powder coating services, tables & office furniture at affordable prices. Free delivery in Biratnagar, Dharan, Itahari. 5-year warranty.',
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
        alt: 'Manish Steel Furniture - Best Furniture Shop in Biratnagar Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Steel Furniture Biratnagar | Almirah Daraj Powder Coated Nepal',
    description: 'Premium steel almirahs (daraj), powder coating services, office furniture at affordable prices. Free delivery & 5-year warranty.',
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
