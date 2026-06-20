import type { Metadata, Viewport } from 'next';
import { Poppins, Open_Sans, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import Script from 'next/script';
import ToastProvider from '@/components/ToastProvider';
import ScrollToTop from '@/components/ScrollToTop';
import NavigationProgress from '@/components/NavigationProgress';
import WebVitalsReporter from '@/components/WebVitalsReporter';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // Reduced from 4 to 3 weights for better performance
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
  preload: true,
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false, // Less critical font
});

// Site configuration
const siteConfig = {
  name: 'Manish Steel Furniture',
  nameNepali: 'श्री मनिष स्टील फर्निचर उद्योग',
  description: 'Premium steel furniture manufacturer in Nepal. Quality office and household furniture at affordable prices. Serving Biratnagar, Dharan, Itahari and across Nepal with fast delivery and home setup.',
  url: 'https://manishsteel.com.np',
  ogImage: 'https://manishsteel.com.np/images/og-image.jpg',
  phone: '+977 9824336371',
  email: 'shreemanishfurniture@gmail.com',
  address: 'Dharan Rd, Biratnagar 56613, Nepal',
  addressNepali: 'धरान रोड, विराटनगर ५६६१३, मोरङ, नेपाल',
  links: {
    facebook: 'https://www.facebook.com/profile.php?id=61576758530152',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0057A3',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Best Steel Furniture Biratnagar | Almirah Daraj Powder Coated | Affordable Prices Nepal',
    template: `%s | श्री मनिष स्टील फर्निचर विराटनगर`,
  },
  description: 'Best steel furniture shop in Biratnagar, Nepal. Premium powder-coated almirahs (daraj), tables & office furniture at affordable prices. Free delivery in Biratnagar, Dharan, Itahari. 5-year warranty. Shop quality steel furniture online.',
  keywords: [
    // Primary Local Keywords (Biratnagar Focus) - MOST IMPORTANT
    'best furniture in Biratnagar',
    'best furniture Biratnagar',
    'furniture in Biratnagar',
    'furniture shop Biratnagar',
    'furniture store Biratnagar',
    'Biratnagar furniture',
    'Biratnagar furniture shop',
    'steel furniture Biratnagar',
    'wood furniture Biratnagar',
    'furniture manufacturer Biratnagar',
    
    // Powder Coated Furniture Keywords
    'powder coated furniture Biratnagar',
    'powder coated steel furniture Biratnagar',
    'powder coated almirah Biratnagar',
    'powder coated furniture Nepal',
    'powder coated steel Nepal',
    'powder coating furniture Biratnagar',
    'durable steel furniture Biratnagar',
    'rust-proof furniture Biratnagar',
    
    // Affordable/Cheap Furniture Keywords
    'cheap furniture Biratnagar',
    'affordable furniture Biratnagar',
    'cheap furniture in Biratnagar',
    'affordable furniture in Biratnagar',
    'sasto furniture Biratnagar',
    'budget furniture Biratnagar',
    'low price furniture Biratnagar',
    'discount furniture Biratnagar',
    'furniture sale Biratnagar',
    
    // Office Furniture Keywords
    'office furniture Biratnagar',
    'office furniture in Biratnagar',
    'office table Biratnagar',
    'office chair Biratnagar',
    'office desk Biratnagar',
    'office almirah Biratnagar',
    'office furniture Nepal',
    'commercial furniture Biratnagar',
    'workspace furniture Biratnagar',
    
    // School Furniture Keywords
    'school furniture Biratnagar',
    'school furniture in Biratnagar',
    'school bench Biratnagar',
    'school desk Biratnagar',
    'school chair Biratnagar',
    'school furniture Nepal',
    'college furniture Biratnagar',
    'educational furniture Biratnagar',
    
    // Daraz-related Keywords (competing with Daraz)
    'furniture cheaper than Daraz',
    'furniture like Daraz Biratnagar',
    'best price furniture Biratnagar',
    'furniture online Biratnagar',
    'buy furniture online Nepal',
    
    // Almirah Keywords
    'steel almirah Biratnagar',
    'almirah Biratnagar',
    'almirah price Biratnagar',
    'wooden almirah Biratnagar',
    'cheap almirah Biratnagar',
    'steel cupboard Biratnagar',
    'wardrobe Biratnagar',
    
    // Product-Specific Keywords
    'wholesaler of steel daraj',
    'wholeseller of steel items',
    'steel daraj wholesaler Nepal',
    'steel furniture wholesale Biratnagar',
    'daraj price',
    'best steel daraj showroom in biratnagar',
    'steel daraj in nepal',
    'best steel daraj in nepal',
    'office daraj',
    'office table',
    'desk benches',
    'steel table Biratnagar',
    'computer table Biratnagar',
    'dining table Biratnagar',
    'study table Biratnagar',
    'steel rack Biratnagar',
    'steel chair Biratnagar',
    'steel sofa Biratnagar',
    
    // Nearby Cities
    'furniture Dharan',
    'furniture Itahari',
    'furniture Damak',
    'furniture Birtamod',
    'furniture Morang',
    'steel furniture Dharan',
    'wood furniture Itahari',
    
    // General Nepal Keywords
    'furniture Nepal',
    'steel furniture Nepal',
    'wood furniture Nepal',
    'furniture manufacturer Nepal',
    'custom furniture Nepal',
    'best furniture shop Nepal',
    'furniture store Nepal',
    
    // Nepali Keywords (for local searches)
    'फर्निचर विराटनगर',
    'विराटनगरमा फर्निचर',
    'स्टील फर्निचर',
    'काठको फर्निचर',
    'अलमारी',
    'सस्तो फर्निचर',
    'अफिस फर्निचर',
    'स्कूल फर्निचर',
    'स्टील अलमिरा',
    'अलमिरा मूल्य',
    'टेबल',
    'कुर्सी',
    'र्‍याक',
    'वार्डरोब',
    'कम्प्युटर टेबल',
    'स्टडी टेबल',
    'डाइनिंग टेबल',
    'अफिस टेबल',
    'फाइल क्याबिनेट',
    'बुक शेल्फ',
    'शू र्‍याक',
    'किचन र्‍याक',
    'धरान फर्निचर',
    'इटहरी फर्निचर',
    'श्री मनिष स्टील फर्निचर',
    'फर्निचर पसल विराटनगर',
    'फर्निचर किन्ने',
    'घरको फर्निचर',
    'अफिस सामान',
    
    // Transliterated Nepali terms (how people type in English)
    'sasto furniture Nepal',
    'almirah kinnu',
    'furniture kinne thau',
    
    // Long-tail Keywords
    'where to buy furniture in Biratnagar',
    'best place to buy furniture in Biratnagar',
    'furniture delivery Biratnagar',
    'custom furniture Biratnagar',
    'furniture with free installation Biratnagar',
    'quality furniture at best price Biratnagar',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ne_NP',
    alternateLocale: ['en_NP'],
    url: siteConfig.url,
    title: 'Best Steel Furniture Biratnagar | Almirah Daraj Powder Coated | Affordable Prices Nepal',
    description: 'Best steel furniture shop in Biratnagar, Nepal. Premium powder-coated almirahs (daraj), tables & office furniture at affordable prices. Free delivery in Biratnagar, Dharan, Itahari. 5-year warranty.',
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Manish Steel Furniture - Best Furniture Shop in Biratnagar Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Steel Furniture Biratnagar | Almirah Daraj Powder Coated Nepal',
    description: 'Premium powder-coated steel almirahs (daraj), office furniture at affordable prices. Free delivery & 5-year warranty.',
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'wESfcK5NYIoxGC9o3yIduzXbJM0wcx6tWAqKzUuI9Zw',
  },
  alternates: {
    canonical: siteConfig.url,
  },
  category: 'furniture',
  other: {
    'geo.region': 'NP-1',
    'geo.placename': 'Biratnagar',
    'geo.position': '26.4525;87.2718',
    'ICBM': '26.4525, 87.2718',
  },
};

// JSON-LD structured data for Local SEO with enhanced dual-keyword content
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  '@id': siteConfig.url,
  name: siteConfig.name,
  alternateName: ['Manish Steel Furniture', 'Manish Steel', 'मनिष स्टील फर्निचर', 'Manish Furniture Biratnagar', 'Best Furniture Biratnagar', 'Shree Manish Steel'],
  description: 'Best and most affordable furniture shop in Biratnagar, Nepal. Premium steel almirahs (daraj), powder coating services, tables, office furniture at cheapest prices. Free delivery in Biratnagar, Dharan, Itahari. 5-year warranty on all steel furniture. Shop quality furniture online or visit our showroom.',
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo192.png`,
  image: [
    siteConfig.ogImage,
    `${siteConfig.url}/images/store-front.jpg`,
    `${siteConfig.url}/images/showroom.jpg`,
    `${siteConfig.url}/logo192.png`,
  ],
  telephone: siteConfig.phone,
  email: siteConfig.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Dharan Rd',
    addressLocality: 'Biratnagar',
    addressRegion: 'Morang, Province 1',
    postalCode: '56613',
    addressCountry: 'NP',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 26.4525,
    longitude: 87.2718,
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Biratnagar',
      '@id': 'https://en.wikipedia.org/wiki/Biratnagar',
    },
    {
      '@type': 'City',
      name: 'Dharan',
    },
    {
      '@type': 'City',
      name: 'Itahari',
    },
    {
      '@type': 'City',
      name: 'Damak',
    },
    {
      '@type': 'City',
      name: 'Birtamod',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Morang District',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Sunsari District',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Province 1, Nepal',
    },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '10:00',
      closes: '16:00',
    },
  ],
  sameAs: [
    siteConfig.links.facebook,
    // Add other social links when available
  ],
  priceRange: 'Rs. 2,000 - Rs. 100,000',
  currenciesAccepted: 'NPR',
  paymentAccepted: 'Cash, Bank Transfer, eSewa, Khalti, Online Payment',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Affordable Steel & Wood Furniture - Best Prices in Biratnagar',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Steel Almirahs & Daraj (Wardrobes)',
          alternateName: ['Steel Almirah', 'Steel Daraj', 'Steel Wardrobe', 'Steel Cupboard', 'Kapada Rakhne'],
          description: 'Premium steel almirahs and daraj (wardrobes) in various sizes. Durable, secure storage solutions for home and office at best prices in Biratnagar.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Powder Coating Services',
          alternateName: ['Metal Powder Coating', 'Rust-Proof Coating', 'Powder Coated Furniture', 'Electrostatic Paint', 'Industrial Powder Coating'],
          description: 'High-quality powder coating services for steel furniture and industrial metal parts. Provides scratch-resistant, durable, and rust-proof finish.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Office Furniture',
          description: 'Complete office furniture solutions - desks, chairs, filing cabinets (office daraj), meeting tables at competitive prices in Biratnagar',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'School Furniture',
          description: 'Durable school furniture - benches, desks, chairs at wholesale prices for schools and colleges',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Tables & Desks',
          description: 'Computer tables, study tables, dining tables, office desks in steel and wood at discount prices',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Steel Racks & Shelves',
          description: 'Heavy-duty steel racks, display racks, book shelves, shoe racks for shops, warehouses, and homes',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Custom Furniture',
          description: 'Made-to-order custom steel and wood furniture designed as per your requirements',
        },
      },
    ],
  },
  slogan: 'Best Quality, Affordable Price - सस्तो र टिकाउ फर्निचर',
  foundingDate: '2009',
  founder: {
    '@type': 'Person',
    name: 'Manish Kumar',
  },
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: '25+',
  },
  knowsLanguage: ['Nepali', 'Hindi', 'English'],
  makesOffer: [
    {
      '@type': 'Offer',
      name: 'Free Delivery',
      description: 'Free delivery service in Biratnagar, Dharan, Itahari and nearby areas in Province 1',
    },
    {
      '@type': 'Offer',
      name: 'Free Installation',
      description: 'Complimentary installation and setup service for all furniture',
    },
    {
      '@type': 'Offer',
      name: 'Bulk Discount',
      description: 'Special wholesale prices for schools, offices, and bulk orders',
    },
    {
      '@type': 'Offer',
      name: '5-Year Warranty',
      description: 'Comprehensive 5-year warranty on all steel furniture products',
    },
  ],
};

// Organization Schema for brand recognition
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo192.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: siteConfig.phone,
    contactType: 'customer service',
    areaServed: 'NP',
    availableLanguage: ['Nepali', 'Hindi', 'English'],
  },
};

// BreadcrumbList for better navigation in search results
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteConfig.url,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ne" className={`${poppins.variable} ${openSans.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* Favicon and Icons - Your Company Logo */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/logo192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/logo192.png" sizes="192x192" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0057A3" />
        
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Preload static hero image for faster LCP (Req 10.1, 10.2) */}
        <link
          rel="preload"
          href="/images/home-page-1.png"
          as="image"
          fetchPriority="high"
        />
        
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body className="font-body antialiased bg-background text-text">
        {/* Google Analytics - Loaded after page is interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TGW5L8QT90"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TGW5L8QT90', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <WebVitalsReporter />
        {children}
        <ScrollToTop />
        <ToastProvider />
      </body>
    </html>
  );
}
