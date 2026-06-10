import React from 'react';
import { connectDB } from '@/lib/db';
import Homepage from '@/models/Homepage';
import Category from '@/models/Category';
import Service from '@/models/Service';
import Product from '@/models/Product';
import SiteSettings from '@/models/SiteSettings';
import HomePageClient from '@/components/HomePageClient';

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

// Ensure the page is dynamically rendered to get fresh data
export const revalidate = 3600; // Revalidate every hour, or adjust as needed

export default async function HomePage() {
  await connectDB();

  // 1. Fetch Homepage Content
  let homepageContent = null;
  try {
    const doc = await Homepage.findOne().lean();
    if (doc) {
      // Serialize Date to string and ObjectId to string
      homepageContent = {
        ...doc,
        _id: doc._id.toString(),
        lastUpdated: doc.lastUpdated ? new Date(doc.lastUpdated).toISOString() : undefined,
      };
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error);
  }

  // 2. Fetch Categories
  let categories: any[] = [];
  try {
    const cats = await Category.find().sort({ displayOrder: 1 }).lean();
    categories = cats.map(c => ({
      ...c,
      _id: c._id.toString(),
      dateAdded: c.dateAdded ? new Date(c.dateAdded).toISOString() : undefined,
    }));
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
    services = servs.map(s => ({
      ...s,
      _id: s._id.toString(),
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
      updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
    }));
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
    topProducts = transformProducts(products);
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
    mostSellingProducts = transformProducts(products);
  } catch (error) {
    console.error('Error fetching most selling products:', error);
  }
  
  // JSON-LD structured data for WebSite and LocalBusiness
  // In Phase 2, we can inject more robust schema here. For now we use the main page to inject LocalBusiness.
  
  return (
    <>
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
