import type { Metadata } from 'next';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { metadataGenerator } from '@/lib/seo/metadataGenerator';

type Props = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const productId = resolvedParams.productId;
  
  try {
    await connectDB();
    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    const query = isObjectId ? { _id: productId } : { slug: productId };

    const product = await Product.findOne(query)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .lean();

    if (!product) {
      return {
        title: 'Product Not Found | Shree Manish Steel Furniture',
        description: 'The requested product could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const productData = product as any;
    
    // Generate enhanced SEO metadata using metadataGenerator service
    const seoMetadata = metadataGenerator.generateProductMetadata(
      productData,
      productData.categoryId
    );

    // Convert to Next.js Metadata format
    return {
      title: seoMetadata.title,
      description: seoMetadata.description,
      keywords: seoMetadata.keywords,
      openGraph: seoMetadata.openGraph ? {
        title: seoMetadata.openGraph.title,
        description: seoMetadata.openGraph.description,
        type: seoMetadata.openGraph.type as any,
        url: seoMetadata.openGraph.url,
        siteName: seoMetadata.openGraph.siteName,
        locale: seoMetadata.openGraph.locale,
        alternateLocale: seoMetadata.openGraph.alternateLocale,
        images: seoMetadata.openGraph.images?.map(img => ({
          url: img.url,
          width: img.width,
          height: img.height,
          alt: img.alt,
        })),
      } : undefined,
      twitter: seoMetadata.twitter ? {
        card: seoMetadata.twitter.card,
        title: seoMetadata.twitter.title,
        description: seoMetadata.twitter.description,
        images: seoMetadata.twitter.images,
      } : undefined,
      alternates: {
        canonical: seoMetadata.canonical,
        languages: seoMetadata.alternates?.languages,
      },
      robots: seoMetadata.robots,
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
