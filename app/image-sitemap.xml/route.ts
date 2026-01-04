import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

const baseUrl = 'https://manishsteel.com.np';

export async function GET() {
  try {
    await connectDB();

    // Get all products with images
    const products = await Product.find({ isAvailable: { $ne: false } })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .select('_id name description image images category subcategory categoryId subcategoryId')
      .lean();

    // Build image sitemap XML
    const imageEntries = products.map((product: any) => {
      const productUrl = `${baseUrl}/products/${product._id}`;
      const images = [];
      
      // Add main product image
      if (product.image) {
        images.push({
          loc: product.image,
          title: product.name,
          caption: product.description || `${product.name} - ${product.subcategory || product.category || 'Steel Furniture'}`,
        });
      }
      
      // Add additional images
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img: string, index: number) => {
          if (img && img !== product.image) {
            images.push({
              loc: img,
              title: `${product.name} - Image ${index + 1}`,
              caption: product.description || `${product.name} - ${product.subcategory || product.category || 'Steel Furniture'}`,
            });
          }
        });
      }

      return {
        url: productUrl,
        images: images
      };
    }).filter(entry => entry.images.length > 0);

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries.map(entry => `  <url>
    <loc>${entry.url}</loc>
${entry.images.map(img => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
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
