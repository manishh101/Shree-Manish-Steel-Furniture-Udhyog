import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import Product from '@/models/Product';
import { GallerySection } from '@/models/Gallery';
import ImageService from '@/services/imageService';

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

    // ---- Products ----
    const products = await Product.find({ isActive: { $ne: false } })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .select('_id name description image images category subcategory categoryId subcategoryId slug specifications material')
      .lean();

    const imageEntries = products
      .map((product: any) => {
        const productUrl = `${baseUrl}/products/${product.slug || product._id}`;
        const categoryName = product.subcategoryId?.name || product.categoryId?.name || product.subcategory || product.category || 'Steel Furniture';
        const material = product.specifications?.material || product.material || 'Steel';

        const productData = {
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          specifications: product.specifications,
          material: product.material,
        };

        const images: ImageEntry['images'] = [];

        // Main product image
        if (product.image) {
          images.push({
            loc: product.image,
            title: ImageService.generateImageTitle(productData, categoryName),
            caption: ImageService.generateImageCaption(productData, true),
          });
        }

        // Additional product images
        if (Array.isArray(product.images)) {
          product.images.forEach((img: string, index: number) => {
            if (img && img !== product.image) {
              const altText = ImageService.generateSEOAltText(productData, {
                includeLocation: true,
                includeMaterial: true,
                imageIndex: index + 1,
              });
              images.push({
                loc: img,
                title: `${product.name} - View ${index + 2} | ${categoryName} | ${material} | Biratnagar Nepal`,
                caption: altText,
              });
            }
          });
        }

        return { url: productUrl, images };
      })
      .filter((entry: ImageEntry) => entry.images.length > 0);

    // ---- Gallery sections ----
    const galleryItems = await GallerySection.find({ isActive: { $ne: false } })
      .select('name description images category')
      .lean();

    const galleryEntries: ImageEntry[] = [];
    const galleryUrl = `${baseUrl}/gallery`;

    galleryItems.forEach((section: any) => {
      if (!Array.isArray(section.images)) return;

      section.images.forEach((img: any) => {
        if (!img.src) return;

        const sectionCategory = section.category || 'Steel Furniture';
        const imgTitle = img.title || section.name || 'Shree Manish Steel Furniture Gallery';

        // Build a minimal product-like object for enrichment
        const pseudoProduct = {
          name: imgTitle,
          category: sectionCategory,
          subcategory: undefined,
          specifications: undefined,
          material: undefined,
        };

        // Enrich caption with dual keywords and location context
        const enrichedCaption = img.description
          || ImageService.generateImageCaption(pseudoProduct, false);

        const enrichedTitle = img.title
          ? `${img.title} | ${sectionCategory} | Shree Manish Steel Furniture`
          : ImageService.generateImageTitle(pseudoProduct, sectionCategory);

        galleryEntries.push({
          url: galleryUrl,
          images: [{
            loc: img.src,
            title: enrichedTitle,
            caption: enrichedCaption,
          }],
        });
      });
    });

    // ---- Blog images ----
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
            caption: blog.excerpt
              || `${blog.title} - Steel furniture tips and guides from Biratnagar, Nepal`,
          }],
        });
      }
    });

    // ---- Build XML ----
    const allEntries: ImageEntry[] = [...imageEntries, ...galleryEntries, ...blogEntries];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allEntries
  .map(
    (entry: ImageEntry) => `  <url>
    <loc>${entry.url}</loc>
${entry.images
  .map(
    (img) => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>`
  )
  .join('\n')}
  </url>`
  )
  .join('\n')}
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
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
