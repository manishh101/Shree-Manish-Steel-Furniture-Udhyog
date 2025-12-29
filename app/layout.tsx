import type { Metadata, Viewport } from 'next';
import { Poppins, Open_Sans, Playfair_Display } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
  description: "Best steel and wood furniture manufacturer in Biratnagar, Nepal. Premium quality almirahs, beds, office furniture, racks & custom furniture. Free delivery in Biratnagar, Dharan, Itahari, Damak. Call: 9824336371",
  url: 'https://manishsteel.com.np',
  ogImage: 'https://manishsteel.com.np/images/og-image.jpg',
  phone: '+977 9824336371',
  email: 'shreemanishfurniture@gmail.com',
  address: 'Dharan Rd, Biratnagar 56613, Nepal',
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
    default: `${siteConfig.name} | Best Steel & Wood Furniture in Biratnagar, Nepal`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    // Primary Local Keywords (Biratnagar Focus)
    'furniture in Biratnagar',
    'steel furniture Biratnagar',
    'wood furniture Biratnagar',
    'furniture shop Biratnagar',
    'best furniture Biratnagar',
    'furniture store Biratnagar Nepal',
    'Biratnagar furniture manufacturer',
    
    // Nearby Cities
    'furniture Dharan',
    'furniture Itahari',
    'furniture Damak',
    'furniture Birtamod',
    'furniture Morang',
    'steel furniture Dharan',
    'wood furniture Itahari',
    
    // Product Keywords
    'steel almirah Biratnagar',
    'wooden almirah Nepal',
    'steel bed Biratnagar',
    'office furniture Biratnagar',
    'steel rack Nepal',
    'steel cupboard',
    'wardrobe Biratnagar',
    'steel table',
    'office table Biratnagar',
    'computer table steel',
    
    // General Nepal Keywords
    'furniture Nepal',
    'steel furniture Nepal',
    'wood furniture Nepal',
    'furniture manufacturer Nepal',
    'custom furniture Nepal',
    'best furniture shop Nepal',
    
    // Nepali Keywords (for local searches)
    'फर्निचर विराटनगर',
    'स्टील फर्निचर',
    'काठको फर्निचर',
    'अलमारी',
    
    // Long-tail Keywords
    'buy steel furniture online Nepal',
    'affordable furniture Biratnagar',
    'quality steel almirah price Nepal',
    'furniture delivery Biratnagar',
    'custom steel furniture Biratnagar',
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
    locale: 'en_NP',
    url: siteConfig.url,
    title: 'Best Steel & Wood Furniture Shop in Biratnagar | Shree Manish Steel',
    description: 'Buy premium steel & wood furniture in Biratnagar, Nepal. Almirahs, beds, office furniture, racks. Free delivery in Biratnagar, Dharan, Itahari. Call Now!',
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Shree Manish Steel Furniture - Best Furniture Shop in Biratnagar Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Steel & Wood Furniture in Biratnagar | Shree Manish Steel',
    description: 'Premium steel & wood furniture manufacturer in Biratnagar, Nepal. Free delivery!',
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
  alternateName: ['Manish Steel Furniture', 'Manish Steel', 'मनिष स्टील फर्निचर'],
  description: 'Best steel and wood furniture manufacturer in Biratnagar, Nepal. Premium quality almirahs, beds, office furniture, racks & custom furniture with free delivery.',
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo192.png`,
  image: [
    siteConfig.ogImage,
    `${siteConfig.url}/images/store-front.jpg`,
    `${siteConfig.url}/images/showroom.jpg`,
  ],
  telephone: siteConfig.phone,
  email: siteConfig.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Biratnagar-4, Main Road',
    addressLocality: 'Biratnagar',
    addressRegion: 'Morang',
    postalCode: '56600',
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
  priceRange: 'Rs. 5,000 - Rs. 100,000',
  currenciesAccepted: 'NPR',
  paymentAccepted: 'Cash, Bank Transfer, eSewa, Khalti',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Steel & Wood Furniture',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Steel Almirahs',
        description: 'Premium quality steel almirahs and wardrobes',
      },
      {
        '@type': 'OfferCatalog',
        name: 'Steel Beds',
        description: 'Durable steel beds in various designs',
      },
      {
        '@type': 'OfferCatalog',
        name: 'Office Furniture',
        description: 'Steel tables, chairs, and office storage',
      },
      {
        '@type': 'OfferCatalog',
        name: 'Commercial Racks',
        description: 'Heavy-duty steel racks for shops and warehouses',
      },
      {
        '@type': 'OfferCatalog',
        name: 'Custom Furniture',
        description: 'Made-to-order steel and wood furniture',
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '250',
    reviewCount: '180',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: 'Ramesh Sharma',
      },
      reviewBody: 'Best steel furniture shop in Biratnagar. Quality products and excellent service!',
    },
  ],
  slogan: 'Quality Steel Furniture for Every Space',
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
    <html lang="en" className={`${poppins.variable} ${openSans.variable} ${playfairDisplay.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
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
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
      </body>
    </html>
  );
}
