import { notFound, redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import ProductClient from './ProductClient';
import { schemaGenerator } from '@/lib/seo/schemaGenerator';
import { dualKeywordManager } from '@/lib/seo/dualKeywordManager';
import { CACHE_CONFIG } from '@/lib/cache';

// Use ISR with stale-while-revalidate for product pages (Req 10.3)
export const revalidate = 3600; // CACHE_CONFIG.PRODUCTS.revalidate
// Enable dynamic params for products not in generateStaticParams
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ productId: string }>;
}

// Generate static params for better SEO and performance
export async function generateStaticParams() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: { $ne: false } })
      .select('slug _id')
      .limit(100) // Limit for build performance
      .lean();

    return products.map((product: any) => ({
      productId: product.slug || product._id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Server Component - renders product data for SEO
export default async function ProductDetailPage({ params }: PageProps) {
  // Resolve the canonical URL slug before rendering
  const resolvedParams = await params;
  const productId = resolvedParams.productId;

  try {
    await connectDB();

    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    const query = isObjectId ? { _id: productId } : { slug: productId };

    // Fetch product with populated data
    const productDoc = await Product.findOne(query)
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .populate('colorVariants.productId', 'name image images colorName colorHex slug')
      .lean();

    if (!productDoc) {
      notFound();
    }

    // Resolve canonical slug — always use the product's own slug if available
    const canonicalSlug = (productDoc as any).slug || productId;

    // 301 redirect: if accessed via ObjectId but product has a slug, redirect to slug URL
    if (isObjectId && (productDoc as any).slug && (productDoc as any).slug !== productId) {
      redirect(`/products/${(productDoc as any).slug}`);
    }

    // Convert MongoDB document to plain object
    const product = JSON.parse(JSON.stringify(productDoc));
    
    // Get category and subcategory data
    const categoryName = product.categoryId?.name || product.category || 'Furniture';
    const subcategoryName = product.subcategoryId?.name || product.subcategory || '';
    
    // Generate enhanced Product schema with complete data
    const productSchema = schemaGenerator.generateProductSchema(product);
    
    // Generate breadcrumb schema
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
    ];
    
    if (categoryName) {
      breadcrumbs.push({
        name: categoryName,
        url: `/products?category=${product.categoryId?._id || ''}`,
      });
    }
    
    if (subcategoryName) {
      breadcrumbs.push({
        name: subcategoryName,
        url: `/products?category=${product.categoryId?._id || ''}&subcategory=${product.subcategoryId?._id || ''}`,
      });
    }
    
    breadcrumbs.push({
      name: product.name,
      url: `/products/${canonicalSlug}`,
    });
    
    const breadcrumbSchema = schemaGenerator.generateBreadcrumbSchema(breadcrumbs);
    
    // Generate optimized alt text for product images
    const generateImageAltText = (index: number = 0): string => {
      if (index === 0) {
        return dualKeywordManager.generateAltText(
          product.name,
          categoryName,
          { includeLocation: true, includeMaterial: true }
        );
      }
      return `${product.name} - ${categoryName} - View ${index + 1} | Biratnagar Nepal`;
    };

    // Transform data for client component
    const transformedProduct = {
      _id: product._id,
      slug: product.slug || canonicalSlug,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: product.images || [],
      category: categoryName,
      subcategory: subcategoryName,
      features: product.features || [],
      specifications: product.specifications || {},
      colors: product.colors || [],
      colorName: product.colorName || '',
      colorHex: product.colorHex || '',
      colorVariants: product.colorVariants || [],
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
      stock: product.stock,
      sku: product.sku,
      deliveryInformation: product.deliveryInformation,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Build optimized Cloudinary preload URL for the LCP product image
    const productImageForPreload = product.image?.includes('res.cloudinary.com')
      ? product.image.replace('/upload/', '/upload/f_webp,q_auto,w_1200,c_limit/')
      : product.image;

    // Render SEO-friendly HTML structure with enhanced JSON-LD schemas
    return (
      <>
        {/* Preload first product image for LCP optimization (Req 10.1, 10.2) */}
        {productImageForPreload && (
          <link
            rel="preload"
            as="image"
            href={productImageForPreload}
            fetchPriority="high"
            imageSizes="(max-width: 768px) 100vw, 50vw"
          />
        )}

        {/* Enhanced Product Schema with complete data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
        
        {/* BreadcrumbList Schema for navigation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />

        {/* Server-rendered SEO content with enhanced microdata */}
        <article itemScope itemType="https://schema.org/Product">
          <meta itemProp="name" content={product.name} />
          <meta itemProp="description" content={product.description} />
          <meta itemProp="sku" content={product.sku || product._id} />
          
          {/* Main product image with optimized alt text */}
          <link itemProp="image" href={product.image} />
          
          {/* Additional product images */}
          {product.images?.map((img: string, idx: number) => (
            <link key={idx} itemProp="image" href={img} />
          ))}

          <div itemProp="brand" itemScope itemType="https://schema.org/Brand">
            <meta itemProp="name" content="Shree Manish Steel Furniture" />
          </div>
          
          {/* Manufacturer details */}
          <div itemProp="manufacturer" itemScope itemType="https://schema.org/Organization">
            <meta itemProp="name" content="Shree Manish Steel Furniture Udhyog" />
            <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <meta itemProp="addressLocality" content="Biratnagar" />
              <meta itemProp="addressRegion" content="Morang" />
              <meta itemProp="addressCountry" content="NP" />
            </div>
          </div>

          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <link itemProp="url" href={`https://manishsteel.com.np/products/${canonicalSlug}`} />
            <meta itemProp="priceCurrency" content="NPR" />
            <meta itemProp="price" content={(product.price || 0).toString()} />
            <link itemProp="availability" href={product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'} />
            <meta itemProp="itemCondition" content="https://schema.org/NewCondition" />
            
            <div itemProp="seller" itemScope itemType="https://schema.org/Organization">
              <meta itemProp="name" content="Shree Manish Steel Furniture" />
            </div>
          </div>
          
          {/* Category hierarchy */}
          <meta itemProp="category" content={categoryName} />
          {subcategoryName && <meta itemProp="additionalType" content={subcategoryName} />}
          
          {/* Color if available */}
          {product.colorName && <meta itemProp="color" content={product.colorName} />}
          
          {/* Material if available */}
          {(product.material || product.specifications?.material) && (
            <meta itemProp="material" content={product.material || product.specifications.material} />
          )}
          
          {/* Aggregate rating if available */}
          {product.rating && product.reviewCount > 0 && (
            <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <meta itemProp="ratingValue" content={product.rating.toString()} />
              <meta itemProp="reviewCount" content={product.reviewCount.toString()} />
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
            </div>
          )}

          {/* Hidden SEO content for crawlers with dual keywords */}
          <div className="sr-only">
            <h1>{dualKeywordManager.enrichContent(product.name)} - {subcategoryName || categoryName} - Steel Furniture Biratnagar Nepal</h1>
            <p>{product.description}</p>
            {product.features?.map((feature: string, index: number) => (
              <p key={index}>{feature}</p>
            ))}
            <p>Available in Biratnagar with free delivery to Dharan, Itahari, and Morang district.</p>
          </div>

          {/* Client component with interactivity */}
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading product...</div>}>
            <ProductClient initialProduct={transformedProduct} productId={productId} />
          </React.Suspense>
        </article>
      </>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}
