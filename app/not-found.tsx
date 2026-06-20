import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import NotFoundClient from '@/components/NotFoundClient';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

export const metadata: Metadata = {
  title: 'Page Not Found | Shree Manish Steel Furniture',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function NotFound() {
  // Fetch popular categories and products for the 404 page
  let categories: any[] = [];
  let popularProducts: any[] = [];

  try {
    await connectDB();
    
    // Fetch top 6 categories
    const cats = await Category.find()
      .sort({ displayOrder: 1 })
      .limit(6)
      .lean();
    categories = JSON.parse(JSON.stringify(cats));

    // Fetch featured or top products
    let products = await Product.find({ featured: true })
      .populate('categoryId', 'name')
      .sort({ salesCount: -1 })
      .limit(8)
      .lean();

    if (!products || products.length === 0) {
      products = await Product.find({ isTopProduct: true })
        .populate('categoryId', 'name')
        .sort({ salesCount: -1 })
        .limit(8)
        .lean();
    }

    if (!products || products.length === 0) {
      products = await Product.find({})
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
    }

    popularProducts = JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('Error fetching 404 page data:', error);
  }

  return (
    <>
      {/* Breadcrumb schema for 404 page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://manishsteel.com.np',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Page Not Found',
              },
            ],
          }),
        }}
      />
      
      <NotFoundClient 
        categories={categories} 
        popularProducts={popularProducts} 
      />
    </>
  );
}
