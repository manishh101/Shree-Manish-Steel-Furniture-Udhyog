import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Blog from '@/models/Blog';

const baseUrl = 'https://manishsteel.com.np';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with proper validation
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
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
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
      .select('_id slug updatedAt')
      .limit(1000) // Limit for sitemap size
      .lean();

    const productPages: MetadataRoute.Sitemap = products
      .filter((product: any) => product._id) // Validate _id exists
      .map((product: any) => {
        // Ensure product ID or slug is properly stringified and URL-safe
        const productSlugOrId = String(product.slug || product._id).trim();
        return {
          url: `${baseUrl}/products/${productSlugOrId}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });

    // Get all published blogs
    const blogs = await Blog.find({ status: 'published' })
      .select('slug updatedAt')
      .lean();

    const blogPages: MetadataRoute.Sitemap = blogs
      .filter((blog: any) => blog.slug)
      .map((blog: any) => {
        return {
          url: `${baseUrl}/blogs/${String(blog.slug).trim()}`,
          lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });

    return [...staticPages, ...productPages, ...blogPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if database fails
    return staticPages;
  }
}


