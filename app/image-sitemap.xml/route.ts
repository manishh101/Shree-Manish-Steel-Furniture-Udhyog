import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import Product from '@/models/Product';
import { GallerySection } from '@/models/Gallery';

const baseUrl = 'https://manishsteel.com.np';

interface ImageEntry {
  url: string;
  images: {
    loc: string;
    title: string;
    caption: string;
  }[];
}

export async function GET() {
  try {
    await connectDB();

    // Get all active products with images (consistent with main sitemap)
    const products = await Product.find({ isActive: { $ne: false } })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .select('_id name description image images category subcategory categoryId subcategoryId')
      .lean();

    // Build image sitemap XML
    const imageEntries = products.map((product: any) => {
      const productUrl = `${baseUrl}/products/${product._id}`;
      const productName = product.name || 'Product';
      const categoryName = product.categoryId?.name || product.category || 'Steel Furniture';
      const subcategoryName = product.subcategoryId?.name || product.subcategory;
      const fullCategory = subcategoryName ? `${subcategoryName} - ${categoryName}` : categoryName;
      
      const images = [];
      
      // Add main product image
      if (product.image) {
        images.push({
          loc: product.image,
          title: `${productName} | ${fullCategory} | Shree Manish Steel Furniture`,
          caption: product.description || `${productName} - Premium ${fullCategory} from Biratnagar, Nepal`,
        });
      }
      
      // Add additional images
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img: string, index: number) => {
          if (img && img !== product.image) {
            images.push({
              loc: img,
              title: `${productName} - View ${index + 1} | ${fullCategory}`,
              caption: `${productName} detailed view - ${fullCategory} - Shree Manish Steel Furniture Nepal`,
            });
          }
        });
      }

      return {
        url: productUrl,
        images: images
      };
    }).filter((entry: ImageEntry) => entry.images.length > 0);

    // Get gallery images
    const galleryItems = await GallerySection.find({ isActive: { $ne: false } })
      .select('name description images category')
      .lean();

    const galleryEntries: ImageEntry[] = [];
    const galleryUrl = `${baseUrl}/gallery`;

    galleryItems.forEach((section: any) => {
      if (section.images && Array.isArray(section.images)) {
        section.images.forEach((img: any) => {
          if (img.src) {
            galleryEntries.push({
              url: galleryUrl,
              images: [{
                loc: img.src,
                title: img.title || section.name || 'Shree Manish Steel Furniture Gallery',
                caption: img.description || section.description || `${section.category || 'Steel Furniture'} - Our Work Gallery`,
              }]
            });
          }
        });
      }
    });

    // Get blog images
    const blogs = await Blog.find({ status: 'published' })
      .select('slug title excerpt image')
      .lean();

    const blogEntries: ImageEntry[] = [];
    blogs.forEach((blog: any) => {
      if (blog.slug && blog.image) {
        blogEntries.push({
          url: `${baseUrl}/blogs/${String(blog.slug).trim()}`,
          images: [{
            loc: blog.image,
            title: `${blog.title} | Shree Manish Steel Furniture`,
            caption: blog.excerpt || `${blog.title} - Learn more about steel furniture in Nepal`,
          }]
        });
      }
    });

    // Combine all entries
    const allEntries: ImageEntry[] = [...imageEntries, ...galleryEntries, ...blogEntries];

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allEntries.map((entry: ImageEntry) => `  <url>
    <loc>${entry.url}</loc>
${entry.images.map((img: any) => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    return new NextResponse('Error generating image sitemap', { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
