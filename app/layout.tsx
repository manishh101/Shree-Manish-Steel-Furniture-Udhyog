import type { Metadata, Viewport } from 'next';
import { Poppins, Open_Sans, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import Script from 'next/script';
import ToastProvider from '@/components/ToastProvider';
import ScrollToTop from '@/components/ScrollToTop';
import NavigationProgress from '@/components/NavigationProgress';
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
  name: 'Shree Manish Steel Furniture Udhyog',
  nameNepali: 'श्री मनिष स्टील फर्निचर उद्योग',
  description: "विराटनगरको सबैभन्दा सस्तो र राम्रो फर्निचर! Best & Cheapest Furniture in Biratnagar, Nepal! Affordable steel & wood furniture - Office, School, Home. Premium quality beds (palang/खाट), almirahs (अलमिरा), tables, chairs at best prices. Cheaper than Daraz! Free delivery in Biratnagar, Dharan, Itahari. Call: 9824336371",
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
    default: `विराटनगरको उत्कृष्ट फर्निचर | Best Furniture in Biratnagar - ${siteConfig.name}`,
    template: `%s | श्री मनिष स्टील फर्निचर विराटनगर`,
  },
  description: siteConfig.description,
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
    
    // Bed/Palang Keywords
    'bed Biratnagar',
    'palang Biratnagar',
    'steel bed Biratnagar',
    'steel palang Biratnagar',
    'bed frame Biratnagar',
    'double bed Biratnagar',
    'single bed Biratnagar',
    'palang price Biratnagar',
    'cheap bed Biratnagar',
    'affordable bed Biratnagar',
    
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
    'पलंग',
    'स्टील अलमिरा',
    'अलमिरा मूल्य',
    'खाट',
    'स्टील खाट',
    'डबल बेड',
    'सिंगल बेड',
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
    'khat price Biratnagar',
    'palang price Nepal',
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
    title: 'विराटनगरको उत्कृष्ट फर्निचर | Best & Cheapest Furniture in Biratnagar',
    description: 'सस्तो र राम्रो स्टील फर्निचर विराटनगरमा! अलमिरा, खाट, टेबल, कुर्सी - उत्तम मूल्यमा। अफिस र स्कूल फर्निचर। निःशुल्क डेलिभरी! फोन: 9824336371',
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'श्री मनिष स्टील फर्निचर - विराटनगरको उत्कृष्ट फर्निचर पसल',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Furniture in Biratnagar | Affordable Office & School Furniture',
    description: 'Cheapest furniture in Biratnagar! Steel & wood furniture, beds, almirahs at best prices. Free delivery!',
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

// JSON-LD structured data for Local SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  '@id': siteConfig.url,
  name: siteConfig.name,
  alternateName: ['Manish Steel Furniture', 'Manish Steel', 'मनिष स्टील फर्निचर', 'Manish Furniture Biratnagar', 'Best Furniture Biratnagar'],
  description: 'Best and most affordable furniture shop in Biratnagar, Nepal. We offer premium quality steel and wood furniture for office, school, and home at the cheapest prices. Products include beds (palang), almirahs, tables, chairs, racks and custom furniture with free delivery and installation.',
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
    addressRegion: 'Morang',
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
      name: 'Province 1, Nepal',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Morang District',
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
    name: 'Affordable Steel & Wood Furniture',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Office Furniture',
          description: 'Complete office furniture solutions including desks, chairs, cabinets, and meeting tables at best prices in Biratnagar',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'School Furniture',
          description: 'Durable school furniture - benches, desks, chairs, and storage at affordable prices for schools and colleges',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Steel Beds (Palang)',
          description: 'Strong steel beds and palang in various sizes - single, double at cheapest prices in Biratnagar',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Steel Almirahs & Wardrobes',
          description: 'Premium quality steel almirahs and cupboards for home and office at budget-friendly prices',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Tables & Desks',
          description: 'Computer tables, study tables, dining tables in steel and wood at discount prices',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Steel Racks & Shelves',
          description: 'Heavy-duty steel racks for shops, warehouses, and homes at wholesale prices',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Custom Furniture',
          description: 'Made-to-order custom steel and wood furniture as per your requirements',
        },
      },
    ],
  },
  slogan: 'Best Quality, Cheapest Price - Furniture for Every Budget',
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
      description: 'Free delivery service in Biratnagar, Dharan, Itahari and nearby areas',
    },
    {
      '@type': 'Offer',
      name: 'Free Installation',
      description: 'Complimentary installation service for all furniture',
    },
    {
      '@type': 'Offer',
      name: 'Bulk Discount',
      description: 'Special wholesale prices for schools, offices, and bulk orders',
    },
    {
      '@type': 'Offer',
      name: '5-Year Warranty',
      description: 'Comprehensive 5-year warranty on all steel furniture',
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
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
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
        {children}
        <ScrollToTop />
        <ToastProvider />
      </body>
    </html>
  );
}
