import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Furniture Gallery Images | Almirah Daraj, Powder Coating Designs | Biratnagar | श्री मनिष स्टील फर्निचर',
  description: 'Browse our furniture gallery - steel almirahs (daraj), powder coating services, office furniture, filing cabinets and racks. Premium quality furniture images from Shree Manish Steel, Biratnagar. Free delivery in Biratnagar, Dharan, Itahari, Nepal.',
  keywords: [
    'furniture gallery Biratnagar',
    'furniture images Nepal',
    'almirah designs Biratnagar',
    'daraj photos Nepal',
    'steel furniture gallery',
    'powder coating Biratnagar',
    'powder coating designs Nepal',
    'office furniture photos Nepal',
    'furniture showroom images Biratnagar',
    'steel almirah gallery Nepal',
    'filing cabinet images Nepal',
    'steel rack photos Biratnagar',
    'custom furniture photos Nepal',
    'furniture factory Biratnagar',
    'steel wardrobe designs Nepal',
  ],
  openGraph: {
    title: 'Furniture Gallery - Steel Almirahs (Daraj), Powder Coating | Shree Manish Steel Furniture',
    description: 'Explore our furniture gallery with high-quality images of steel almirahs (daraj), powder coating services, office furniture, and racks. Made in Biratnagar, Nepal. Free delivery across Eastern Nepal.',
    type: 'website',
    locale: 'ne_NP',
    url: 'https://manishsteel.com.np/gallery',
    siteName: 'Shree Manish Steel Furniture',
    images: [
      {
        url: 'https://manishsteel.com.np/images/home-page-1.png',
        width: 1200,
        height: 630,
        alt: 'Furniture Gallery - Steel Almirahs (Daraj) and Powder Coating | Shree Manish Steel Furniture Biratnagar Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furniture Gallery - Steel Almirah (Daraj), Powder Coating | Biratnagar Nepal',
    description: 'Browse our furniture gallery with quality steel furniture images. Almirahs (daraj), powder coating services, office furniture from Biratnagar, Nepal.',
    images: ['https://manishsteel.com.np/images/home-page-1.png'],
  },
  alternates: {
    canonical: 'https://manishsteel.com.np/gallery',
    languages: {
      'ne-NP': 'https://manishsteel.com.np/gallery',
      'en-NP': 'https://manishsteel.com.np/gallery',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
