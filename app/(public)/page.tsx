import React from 'react';
import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import Homepage from '@/models/Homepage';
import Category from '@/models/Category';
import Service from '@/models/Service';
import Product from '@/models/Product';
import SiteSettings from '@/models/SiteSettings';
import HomePageClient from '@/components/HomePageClient';
import { schemaGenerator } from '@/lib/seo/schemaGenerator';
import { CACHE_CONFIG } from '@/lib/cache';

// Helper function to transform products
function transformProducts(products: any[]) {
  return products.map((product: any) => {
    // Convert Mongoose _id to string for serialization
    const serializedProduct = {
      ...product,
      _id: product._id ? product._id.toString() : undefined,
      id: product._id ? product._id.toString() : undefined,
      categoryId: product.categoryId ? product.categoryId.toString() : undefined,
      subcategoryId: product.subcategoryId ? product.subcategoryId.toString() : undefined,
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : undefined,
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
    };
    
    // Support legacy code that expects nested category names
    if (product.categoryId && typeof product.categoryId === 'object') {
      serializedProduct.category = product.categoryId.name || 'Steel Furniture';
      serializedProduct.categoryId = product.categoryId._id ? product.categoryId._id.toString() : undefined;
    } else {
      serializedProduct.category = product.category || 'Steel Furniture';
    }

    if (product.subcategoryId && typeof product.subcategoryId === 'object') {
      serializedProduct.subcategory = product.subcategoryId.name || null;
      serializedProduct.subcategoryId = product.subcategoryId._id ? product.subcategoryId._id.toString() : undefined;
    } else {
      serializedProduct.subcategory = product.subcategory || null;
    }

    return serializedProduct;
  });
}

// Use ISR with stale-while-revalidate for homepage (Req 10.3)
export const revalidate = 3600; // CACHE_CONFIG.HOMEPAGE.revalidate

// Generate enhanced metadata for homepage
export async function generateMetadata(): Promise<Metadata> {
  await connectDB();
  
  let settings = null;
  try {
    settings = await SiteSettings.findOne().lean();
  } catch (error) {
    console.error('Error fetching settings for metadata:', error);
  }

  const businessInfo = settings?.businessInfo || {};
  const serviceAreas = settings?.serviceAreas || [];
  const primaryAreas = serviceAreas
    .filter((area: any) => area.priority === 'primary')
    .map((area: any) => area.name)
    .join(', ') || 'Biratnagar, Dharan, Itahari';

  // Enhanced title with dual keywords and local focus
  const title = 'Best Steel Furniture Shop Biratnagar | Almirah Daraj Powder Coated | Affordable Prices Nepal';
  
  // Enhanced description with value propositions and dual keywords
  const description = `Best steel furniture shop in Biratnagar, Nepal. Premium quality almirahs (daraj), powder coating services, tables & office furniture at affordable prices. Free delivery in ${primaryAreas}. 5-year warranty on all steel furniture. Shop online or visit our showroom.`;

  return {
    title,
    description,
    keywords: [
      // Dual keyword pairs (formal/colloquial)
      'steel almirah', 'steel daraj', 'almirah daraj',
      'powder coating', 'powder coating services', 'metal powder coating', 'industrial powder coating',
      'wardrobe', 'kapada rakhne', 'steel wardrobe',
      
      // Primary local keywords
      'best furniture Biratnagar', 'furniture shop Biratnagar', 'steel furniture Biratnagar',
      'affordable furniture Biratnagar', 'cheap furniture Biratnagar', 'sasto furniture',
      
      // Value propositions
      'free delivery furniture', 'furniture warranty Nepal', 'furniture installation',
      
      // Service areas
      'furniture Dharan', 'furniture Itahari', 'furniture Morang',
      
      // Product categories with dual terms
      'office furniture Biratnagar', 'school furniture', 'home furniture',
      'computer table', 'study table', 'dining table',
      'steel rack', 'book shelf', 'shoe rack',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://manishsteel.com.np',
      locale: 'ne_NP',
      alternateLocale: 'en_NP',
      siteName: 'Shree Manish Steel Furniture',
      images: [
        {
          url: 'https://manishsteel.com.np/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Manish Steel Furniture - Best Furniture Shop in Biratnagar Nepal',
        },
      ],
    },
    alternates: {
      canonical: 'https://manishsteel.com.np',
    },
  };
}

export default async function HomePage() {
  await connectDB();

  // 1. Fetch Homepage Content
  let homepageContent = null;
  try {
    const doc = await Homepage.findOne().lean();
    if (doc) {
      // Serialize Date to string and all ObjectIds (including nested ones) to string
      homepageContent = JSON.parse(JSON.stringify(doc));
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error);
  }

  // 2. Fetch Categories
  let categories: any[] = [];
  try {
    const cats = await Category.find().sort({ displayOrder: 1 }).lean();
    categories = JSON.parse(JSON.stringify(cats));
  } catch (error) {
    console.error('Error fetching categories:', error);
  }

  // 3. Fetch Category Thumbnails
  const categoryThumbnails: Record<string, string> = {};
  try {
    for (const cat of categories) {
      const product = await Product.findOne({ category: cat.name }).select('image').lean();
      if (product && product.image) {
        categoryThumbnails[cat._id] = product.image;
      }
    }
  } catch (error) {
    console.error('Error fetching category thumbnails:', error);
  }

  // 4. Fetch Services
  let services: any[] = [];
  try {
    const servs = await Service.find({ isActive: true }).sort({ order: 1 }).lean();
    services = JSON.parse(JSON.stringify(servs));
  } catch (error) {
    console.error('Error fetching services:', error);
  }

  // 5. Fetch Top Products
  let topProducts: any[] = [];
  try {
    let products = await Product.find({ isTopProduct: true })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .sort({ rating: -1, salesCount: -1 })
      .limit(8)
      .lean();

    if (!products || products.length === 0) {
      products = await Product.find({ featured: true })
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
    }

    if (!products || products.length === 0) {
      products = await Product.find({})
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
    }
    topProducts = JSON.parse(JSON.stringify(transformProducts(products)));
  } catch (error) {
    console.error('Error fetching top products:', error);
  }

  // 6. Fetch Most Selling Products
  let mostSellingProducts: any[] = [];
  try {
    let products = await Product.find({ isMostSelling: true })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .sort({ salesCount: -1 })
      .limit(8)
      .lean();

    if (!products || products.length === 0) {
      products = await Product.find({ salesCount: { $gt: 0 } })
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ salesCount: -1 })
        .limit(8)
        .lean();
    }

    if (!products || products.length === 0) {
      products = await Product.find({ featured: true })
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
    }

    if (!products || products.length === 0) {
      products = await Product.find({})
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
    }
    mostSellingProducts = JSON.parse(JSON.stringify(transformProducts(products)));
  } catch (error) {
    console.error('Error fetching most selling products:', error);
  }
  
  // Fetch Site Settings for enhanced schemas
  let settings = null;
  try {
    settings = await SiteSettings.findOne().lean();
    if (settings) {
      settings = JSON.parse(JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Error fetching site settings:', error);
  }
  
  // Generate enhanced LocalBusiness schema with complete business information
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': 'https://manishsteel.com.np',
    name: settings?.businessInfo?.name || 'Shree Manish Steel Furniture',
    alternateName: ['Manish Steel Furniture', 'Manish Steel', 'मनिष स्टील फर्निचर', 'Manish Furniture Biratnagar'],
    legalName: settings?.businessInfo?.legalName || 'Shree Manish Steel Furniture Udhyog',
    description: 'Best and most affordable furniture shop in Biratnagar, Nepal. Premium steel almirahs (daraj), powder coating services, tables, racks and custom furniture at cheapest prices. Free delivery and installation in Biratnagar, Dharan, Itahari. 5-year warranty on all products.',
    url: 'https://manishsteel.com.np',
    logo: 'https://manishsteel.com.np/logo192.png',
    image: [
      'https://manishsteel.com.np/images/og-image.jpg',
      'https://manishsteel.com.np/logo192.png',
    ],
    telephone: settings?.businessInfo?.contacts?.phones?.[0] || settings?.phone || '+977 9824336371',
    email: settings?.businessInfo?.contacts?.email || settings?.email || 'shreemanishfurniture@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.businessInfo?.address?.street || 'Dharan Rd',
      addressLocality: settings?.businessInfo?.address?.city || 'Biratnagar',
      addressRegion: settings?.businessInfo?.address?.region || 'Morang',
      postalCode: settings?.businessInfo?.address?.postalCode || '56613',
      addressCountry: settings?.businessInfo?.address?.country || 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: settings?.businessInfo?.geo?.latitude || 26.4525,
      longitude: settings?.businessInfo?.geo?.longitude || 87.2718,
    },
    areaServed: settings?.serviceAreas && settings.serviceAreas.length > 0 
      ? settings.serviceAreas.map((area: any) => ({
          '@type': area.type === 'city' ? 'City' : 'AdministrativeArea',
          name: area.name,
        }))
      : [
          { '@type': 'City', name: 'Biratnagar' },
          { '@type': 'City', name: 'Dharan' },
          { '@type': 'City', name: 'Itahari' },
          { '@type': 'City', name: 'Damak' },
          { '@type': 'City', name: 'Birtamod' },
          { '@type': 'AdministrativeArea', name: 'Province 1, Nepal' },
          { '@type': 'AdministrativeArea', name: 'Morang District' },
          { '@type': 'AdministrativeArea', name: 'Sunsari District' },
        ],
    openingHoursSpecification: settings?.businessInfo?.openingHours && settings.businessInfo.openingHours.length > 0
      ? settings.businessInfo.openingHours.map((hours: string) => {
          const parts = hours.split(':');
          return {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: parts[0]?.split(',') || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: parts[1] || '09:00',
            closes: parts[2] || '18:00',
          };
        })
      : [
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
    priceRange: settings?.priceRange || 'Rs. 2,000 - Rs. 100,000',
    currenciesAccepted: settings?.currencyAccepted || 'NPR',
    paymentAccepted: settings?.paymentAccepted?.join(', ') || 'Cash, Bank Transfer, eSewa, Khalti',
    sameAs: [
      settings?.businessInfo?.socialProfiles?.facebook,
      settings?.businessInfo?.socialProfiles?.instagram,
      settings?.businessInfo?.socialProfiles?.youtube,
      settings?.social?.facebook,
    ].filter(Boolean),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Steel & Wood Furniture - Best Prices in Biratnagar',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Steel Almirahs & Daraj',
            alternateName: ['Steel Almirah', 'Steel Daraj', 'Steel Wardrobe', 'Steel Cupboard'],
            description: 'Premium steel almirahs (daraj) in various sizes at best prices. Durable, secure storage solutions for home and office.',
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
            description: 'Complete office furniture - desks, chairs, filing cabinets, meeting tables at competitive prices.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'School Furniture',
            description: 'Durable school furniture - benches, desks, chairs at wholesale prices for institutions.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Tables & Desks',
            description: 'Computer tables, study tables, dining tables in various designs and materials.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Steel Racks & Shelves',
            description: 'Heavy-duty steel racks, display racks, book shelves, shoe racks at affordable rates.',
          },
        },
      ],
    },
    makesOffer: [
      {
        '@type': 'Offer',
        name: 'Free Delivery',
        description: 'Free delivery service in Biratnagar, Dharan, Itahari and nearby areas in Province 1',
      },
      {
        '@type': 'Offer',
        name: 'Free Installation',
        description: 'Complimentary installation and setup service for all furniture purchases',
      },
      {
        '@type': 'Offer',
        name: '5-Year Warranty',
        description: 'Comprehensive 5-year warranty on all steel furniture products',
      },
      {
        '@type': 'Offer',
        name: 'Custom Furniture',
        description: 'Made-to-order custom furniture solutions as per your requirements',
      },
      {
        '@type': 'Offer',
        name: 'Bulk Discount',
        description: 'Special wholesale prices for schools, offices, and bulk orders',
      },
    ],
    slogan: 'Best Quality Steel Furniture at Affordable Prices - सस्तो र टिकाउ फर्निचर',
    knowsLanguage: ['Nepali', 'Hindi', 'English'],
  };

  // Generate Organization schema for brand recognition
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://manishsteel.com.np/#organization',
    name: 'Shree Manish Steel Furniture',
    alternateName: 'Manish Steel Furniture',
    url: 'https://manishsteel.com.np',
    logo: 'https://manishsteel.com.np/logo192.png',
    description: 'Leading steel furniture manufacturer and supplier in Biratnagar, Nepal. Trusted for quality, affordability and service.',
    foundingDate: '2009',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: settings?.phone || '+977 9824336371',
        contactType: 'customer service',
        areaServed: 'NP',
        availableLanguage: ['Nepali', 'Hindi', 'English'],
        contactOption: 'TollFree',
      },
      {
        '@type': 'ContactPoint',
        telephone: settings?.social?.whatsapp || settings?.phone || '+977 9824336371',
        contactType: 'customer support',
        areaServed: 'NP',
        availableLanguage: ['Nepali', 'Hindi', 'English'],
        contactOption: 'HearingImpairedSupported',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.address || 'Dharan Rd',
      addressLocality: 'Biratnagar',
      addressRegion: 'Morang, Province 1',
      postalCode: '56613',
      addressCountry: 'NP',
    },
    sameAs: [
      settings?.businessInfo?.socialProfiles?.facebook,
      settings?.businessInfo?.socialProfiles?.instagram,
      settings?.businessInfo?.socialProfiles?.youtube,
      settings?.businessInfo?.socialProfiles?.twitter,
      settings?.social?.facebook,
      settings?.social?.instagram,
      settings?.social?.youtube,
      settings?.social?.twitter,
      'https://www.facebook.com/profile.php?id=61576758530152', // Fallback
    ].filter(Boolean).filter((value, index, self) => self.indexOf(value) === index), // Remove duplicates
  };

  // Generate WebSite schema with search action
  const websiteSchema = schemaGenerator.generateWebSiteSchema();
  
  // JSON-LD structured data for WebSite and LocalBusiness
  // In Phase 2, we can inject more robust schema here. For now we use the main page to inject LocalBusiness.
  
  // Extract hero image URL for LCP preload hint
  // Falls back to the static image already preloaded in root layout
  const heroImageUrl: string | null =
    homepageContent?.heroImage && homepageContent.heroImage.trim() !== ''
      ? homepageContent.heroImage
      : null;

  // Build optimized Cloudinary URL for the preload hint (WebP, width 1200)
  const heroPreloadUrl = heroImageUrl?.includes('res.cloudinary.com')
    ? heroImageUrl.replace('/upload/', '/upload/f_webp,q_auto,w_1200,c_limit/')
    : heroImageUrl;

  return (
    <>
      {/* Preload hero image for LCP (Req 10.1, 10.2) — only for dynamic Cloudinary images */}
      {heroPreloadUrl && heroPreloadUrl !== '/images/home-page-1.png' && (
        <link rel="preload" as="image" href={heroPreloadUrl} fetchPriority="high" />
      )}

      {/* Enhanced JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      
      <HomePageClient 
        initialHomepageContent={homepageContent || undefined}
        initialCategories={categories.length > 0 ? categories : undefined}
        initialCategoryThumbnails={Object.keys(categoryThumbnails).length > 0 ? categoryThumbnails : undefined}
        initialServices={services.length > 0 ? services : undefined}
        initialTopProducts={topProducts.length > 0 ? topProducts : undefined}
        initialMostSellingProducts={mostSellingProducts.length > 0 ? mostSellingProducts : undefined}
      />
    </>
  );
}
