import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import Blog, { IBlog } from '@/models/Blog';
import { FaClock, FaCalendarAlt, FaUser, FaArrowLeft, FaPhone, FaTags, FaEnvelope } from 'react-icons/fa';

interface PageParams {
  params: Promise<{ slug: string }>;
}

async function getBlogBySlug(slug: string): Promise<IBlog | null> {
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug: slug.toLowerCase(), status: 'published' }).lean();
    return blog as unknown as IBlog | null;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Post Not Found',
    };
  }

  const title = blog.metaTitle || `${blog.title} - श्री मनिष स्टील फर्निचर`;
  const description = blog.metaDescription || blog.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://manishsteel.com.np/blogs/${blog.slug}`,
      images: blog.image ? [{ url: blog.image }] : [],
      publishedTime: blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
      modifiedTime: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
      authors: [blog.author || 'Shree Manish Steel Furniture'],
      locale: 'ne_NP',
    },
    alternates: {
      canonical: `https://manishsteel.com.np/blogs/${blog.slug}`,
    },
  };
}

export default async function BlogDetailsPage({ params }: PageParams) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // Schema.org Article structured data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://manishsteel.com.np/blogs/${blog.slug}`,
    },
    headline: blog.title,
    description: blog.excerpt,
    image: blog.image || 'https://manishsteel.com.np/images/og-image.jpg',
    datePublished: new Date(blog.createdAt).toISOString(),
    dateModified: new Date(blog.updatedAt).toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Shree Manish Steel Furniture Udhyog',
      url: 'https://manishsteel.com.np',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Shree Manish Steel Furniture Udhyog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://manishsteel.com.np/logo192.png',
      },
    },
  };

  // Breadcrumb List Schema
  const breadcrumbSchema = {
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
        name: 'Blogs',
        item: 'https://manishsteel.com.np/blogs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: `https://manishsteel.com.np/blogs/${blog.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Schema.org Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-24 pt-8 max-w-6xl">
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary text-sm font-semibold mb-8 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> ब्लग सूचीमा फर्कनुहोस्
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Article Content */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-6 md:p-10 shadow-sm">
            {/* Header info */}
            <div className="space-y-4 mb-6">
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="bg-primary/5 text-primary border border-primary/10 px-2.5 py-0.5 rounded text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-gray-500 border-y border-gray-100 py-3.5">
                <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <FaUser className="text-gray-400" /> {blog.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-gray-400" />
                  {new Date(blog.createdAt).toLocaleDateString('ne-NP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-gray-400" /> {blog.readTime || 5} मिनेट पढ्नुहोस्
                </span>
              </div>
            </div>

            {/* Cover Image */}
            {blog.image && (
              <div className="rounded-xl overflow-hidden border border-gray-150 aspect-[2/1] relative mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Excerpt Summary */}
            <p className="text-lg font-medium text-gray-700 leading-relaxed italic border-l-4 border-accent pl-4 py-1 mb-8">
              {blog.excerpt}
            </p>

            {/* Body Content */}
            <div 
              className="prose prose-blue max-w-none text-gray-800 leading-relaxed space-y-6 text-base md:text-lg"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Direct local CTA card */}
            <div className="bg-gradient-to-br from-primary to-primary/95 text-white p-6 rounded-2xl border border-primary/20 shadow-md">
              <h3 className="text-lg md:text-xl font-bold mb-3">सुपथ मूल्यमा गुणस्तरीय फर्निचर!</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-6">
                विराटनगर, धरान र इटहरी क्षेत्रमा निशुल्क होम डेलिभरीको साथमा आकर्षक डिजाइनका दराज, आलमारी, टेबल, कुर्सी र खाटहरू उपलब्ध छन्।
              </p>
              
              <div className="space-y-3">
                <a 
                  href="tel:+9779824336371" 
                  className="bg-white hover:bg-gray-55 text-primary text-sm font-bold w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <FaPhone className="w-3.5 h-3.5" /> फोन गर्नुहोस्: 9824336371
                </a>
                <Link 
                  href="/contact" 
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <FaEnvelope className="w-3.5 h-3.5" /> सोधपुछ फारम भर्नुहोस्
                </Link>
              </div>
            </div>

            {/* About the Business bio */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">श्री मनिष स्टील फर्निचर</h4>
              <p className="text-xs md:text-sm text-gray-650 leading-relaxed">
                हामी विराटनगर, नेपालमा आधारित दक्ष र अनुभवी कालिगढहरूद्वारा अत्याधुनिक मेसिनहरूको प्रयोग गरी घर, स्कुल, कलेज तथा अफिसको लागि सबै प्रकारका आधुनिक फर्निचरहरू उत्पादन गर्दछौं।
              </p>
              <div className="flex gap-2">
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded">ISO प्रमाणित सामग्री</span>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded">५ वर्षको वारेन्टी</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
