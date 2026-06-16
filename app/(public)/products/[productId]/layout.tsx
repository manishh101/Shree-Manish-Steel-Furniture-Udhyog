import type { Metadata } from 'next';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

type Props = {
  params: Promise<{ productId: string }>;
};

// Nepali keyword mappings for common furniture terms
const nepaliKeywords: Record<string, string[]> = {
  'almirah': ['अलमिरा', 'आलमारी', 'steel almirah', 'स्टील अलमिरा', 'almirah price Nepal'],
  'wardrobe': ['वार्डरोब', 'कपडा राख्ने', 'steel wardrobe', 'स्टील वार्डरोब'],
  'table': ['टेबल', 'मेज', 'office table', 'अफिस टेबल', 'computer table'],
  'chair': ['कुर्सी', 'chair price', 'office chair', 'अफिस कुर्सी'],
  'bed': ['खाट', 'पलंग', 'steel bed', 'स्टील खाट', 'double bed'],
  'locker': ['लकर', 'staff locker', 'स्टाफ लकर', 'office locker'],
  'rack': ['र्याक', 'shelf', 'storage rack', 'स्टोरेज र्याक'],
  'cabinet': ['क्याबिनेट', 'filing cabinet', 'फाइलिङ क्याबिनेट', 'office cabinet'],
  'door': ['ढोका', 'steel door', 'स्टील ढोका', 'gate'],
  'gate': ['गेट', 'main gate', 'मुख्य गेट', 'iron gate'],
  'furniture': ['फर्निचर', 'steel furniture', 'स्टील फर्निचर', 'iron furniture'],
  'counter': ['काउन्टर', 'reception counter', 'shop counter'],
  'shelving': ['शेल्भिङ', 'commercial shelving', 'storage shelving'],
  'display': ['डिस्प्ले', 'display unit', 'showroom display'],
};

// Get Nepali keywords based on product name and category
function getNepaliKeywords(productName: string, category: string, subcategory: string | null): string[] {
  const keywords: string[] = [];
  const searchText = `${productName} ${category} ${subcategory || ''}`.toLowerCase();
  
  Object.entries(nepaliKeywords).forEach(([key, values]) => {
    if (searchText.includes(key)) {
      keywords.push(...values);
    }
  });
  
  // Add common Nepali location keywords
  keywords.push(
    'विराटनगर', // Biratnagar
    'नेपाल', // Nepal
    'फर्निचर विराटनगर', // Furniture Biratnagar
    'स्टील फर्निचर नेपाल', // Steel Furniture Nepal
  );
  
  return keywords;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const productId = resolvedParams.productId;
  
  try {
    await connectDB();
    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    const query = isObjectId ? { _id: productId } : { slug: productId };

    const product = await Product.findOne(query)
      .populate('categoryId', 'name')
      .lean();

    if (!product) {
      return {
        title: 'Product Not Found | Shree Manish Steel Furniture',
        description: 'The requested product could not be found.',
      };
    }

    const productData = product as any;
    const categoryName = productData.categoryId?.name || productData.category || 'Steel Furniture';
    const subcategoryName = productData.subcategoryId?.name || productData.subcategory;
    const productName = productData.name || 'Product';
    const canonicalSlug = productData.slug || productId;
    const productDescription = productData.description || `High-quality ${subcategoryName || categoryName} from Shree Manish Steel Furniture Nepal`;
    const productImage = productData.image || productData.images?.[0] || '/images/og-image.jpg';
    
    // Get all product images for better SEO
    const allImages = [];
    if (productData.image) allImages.push(productData.image);
    if (productData.images && Array.isArray(productData.images)) {
      productData.images.forEach((img: string) => {
        if (img && img !== productData.image) allImages.push(img);
      });
    }

    // Get Nepali keywords for this product
    const nepaliSEO = getNepaliKeywords(productName, categoryName, subcategoryName);

    // Build comprehensive description for Nepali audience
    const seoDescription = `${productName} - ${subcategoryName || categoryName}। ${productDescription.substring(0, 120)}`;

    return {
      title: `${productName} | ${subcategoryName || categoryName} | विराटनगर नेपाल`,
      description: seoDescription.substring(0, 160),
      keywords: [
        // English keywords
        productName,
        subcategoryName,
        categoryName,
        'steel furniture Nepal',
        'furniture Biratnagar',
        'buy furniture online Nepal',
        'Shree Manish Steel Furniture',
        'steel furniture price Nepal',
        'office furniture Biratnagar',
        'home furniture Nepal',
        'metal furniture Nepal',
        'iron furniture Biratnagar',
        `${subcategoryName || categoryName} price`,
        `${subcategoryName || categoryName} Biratnagar`,
        `${subcategoryName || categoryName} Nepal`,
        `buy ${subcategoryName || categoryName} online`,
        // Nepali keywords
        ...nepaliSEO,
        // Product features
        ...(productData.features || []).slice(0, 3)
      ],
      openGraph: {
        title: `${productName} - ${subcategoryName || categoryName} | श्री मनिश स्टील फर्निचर उद्योग`,
        description: seoDescription.substring(0, 160),
        type: 'website',
        url: `https://manishsteel.com.np/products/${canonicalSlug}`,
        siteName: 'Shree Manish Steel Furniture',
        locale: 'ne_NP',
        images: allImages.slice(0, 6).map(img => ({
          url: img,
          width: 1200,
          height: 630,
          alt: `${productName} - ${subcategoryName || categoryName} - स्टील फर्निचर विराटनगर`,
        })),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productName} - ${subcategoryName || categoryName}`,
        description: seoDescription.substring(0, 160),
        images: [productImage],
        creator: '@ManishSteelFurniture',
      },
      alternates: {
        canonical: `https://manishsteel.com.np/products/${canonicalSlug}`,
        languages: {
          'ne-NP': `https://manishsteel.com.np/products/${canonicalSlug}`,
          'en-NP': `https://manishsteel.com.np/products/${canonicalSlug}`,
        },
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product | Shree Manish Steel Furniture',
      description: 'Quality steel furniture products from Nepal.',
    };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
