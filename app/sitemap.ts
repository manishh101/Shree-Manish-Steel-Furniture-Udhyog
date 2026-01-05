import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';

const baseUrl = 'https://manishsteel.com.np';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/custom-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    await connectDB();

    // Get all products for dynamic product pages
    const products = await Product.find({ isActive: { $ne: false } })
      .select('_id updatedAt')
      .lean();

    const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${baseUrl}/products/${product._id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8, // Increased priority for individual products
    }));

    // Get all categories for category filter pages
    const categories = await Category.find({})
      .select('_id name updatedAt')
      .lean();

    const categoryPages: MetadataRoute.Sitemap = categories.map((category: any) => ({
      url: `${baseUrl}/products?category=${category._id}`,
      lastModified: category.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));

    // Get all subcategories for subcategory filter pages
    const subcategories = await Subcategory.find({})
      .select('_id categoryId updatedAt')
      .lean();

    const subcategoryPages: MetadataRoute.Sitemap = subcategories.map((subcategory: any) => ({
      url: `${baseUrl}/products?category=${subcategory.categoryId}&subcategory=${subcategory._id}`,
      lastModified: subcategory.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...subcategoryPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if database fails
    return staticPages;
  }
}

