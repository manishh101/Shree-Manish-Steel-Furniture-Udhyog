import { notFound } from 'next/navigation';
import React from 'react';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import ProductClient from './ProductClient';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

// Revalidate every hour for fresh content
export const revalidate = 3600;
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
      .select('_id')
      .limit(100) // Limit for build performance
      .lean();

    return products.map((product: any) => ({
      productId: product._id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Server Component - renders product data for SEO
export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const productId = resolvedParams.productId;

  try {
    await connectDB();

    // Fetch product with populated data
    const productDoc = await Product.findById(productId)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .populate('colorVariants.productId', 'name image images colorName colorHex')
      .lean();

    if (!productDoc) {
      notFound();
    }

    // Convert MongoDB document to plain object
    const product = JSON.parse(JSON.stringify(productDoc));

    // Transform data for client component
    const transformedProduct = {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: product.images || [],
      category: product.categoryId?.name || product.category,
      subcategory: product.subcategoryId?.name || product.subcategory,
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

    // Render SEO-friendly HTML structure with JSON-LD
    return (
      <>
        {/* JSON-LD Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              description: product.description,
              image: product.images || [product.image],
              sku: product.sku || product._id,
              brand: {
                '@type': 'Brand',
                name: 'Shree Manish Steel Furniture',
              },
              color: product.colorName || product.colors?.join(', '),
              offers: {
                '@type': 'Offer',
                url: `https://manishsteel.com.np/products/${productId}`,
                priceCurrency: 'NPR',
                price: product.price,
                availability: product.stock > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                seller: {
                  '@type': 'Organization',
                  name: 'Shree Manish Steel Furniture',
                },
              },
              aggregateRating: product.rating ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount || 1,
              } : undefined,
            }),
          }}
        />

        {/* Server-rendered SEO content */}
        <article itemScope itemType="https://schema.org/Product">
          <meta itemProp="name" content={product.name} />
          <meta itemProp="description" content={product.description} />
          <meta itemProp="image" content={product.image} />
          <meta itemProp="sku" content={product.sku || product._id} />

          <div itemProp="brand" itemScope itemType="https://schema.org/Brand">
            <meta itemProp="name" content="Shree Manish Steel Furniture" />
          </div>

          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="url" content={`https://manishsteel.com.np/products/${productId}`} />
            <meta itemProp="priceCurrency" content="NPR" />
            <meta itemProp="price" content={product.price?.toString()} />
            <link itemProp="availability" href={product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'} />
          </div>

          {/* Hidden SEO content for crawlers */}
          <div className="sr-only">
            <h1>{product.name} - {product.subcategoryId?.name || product.categoryId?.name} - Steel Furniture Nepal</h1>
            <p>{product.description}</p>
            {product.features?.map((feature: string, index: number) => (
              <p key={index}>{feature}</p>
            ))}
          </div>

          {/* Client component with interactivity - wrap in Suspense for client-navigation hooks */}
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
