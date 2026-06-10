import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import Blog, { IBlog } from '@/models/Blog';
import { FaClock, FaArrowRight, FaCalendarAlt, FaUser } from 'react-icons/fa';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'ब्लग र उपयोगी लेखहरू | Blogs & Furniture Guides - श्री मनिष स्टील फर्निचर',
  description: 'फर्निचर खरिद गर्दा ध्यान दिनुपर्ने कुराहरू, रङ र डिजाइन छनोट, र गुणस्तरीय स्टील फर्निचर सम्बन्धी उपयोगी ब्लगहरू। Furniture guides & buying tips in Nepal.',
  keywords: [
    'फर्निचर ब्लग',
    'steel furniture guide nepal',
    'furniture buying tips biratnagar',
    'cheapest furniture biratnagar',
    'home decor tips nepal',
    'office furniture setup'
  ],
  openGraph: {
    locale: 'ne_NP',
    type: 'website',
  },
};

async function getPublishedBlogs(): Promise<IBlog[]> {
  try {
    await connectDB();
    return await Blog.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .lean() as unknown as IBlog[];
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    return [];
  }
}

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs();

  // JSON-LD Breadcrumb List
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
        name: 'Blogs & Guides',
        item: 'https://manishsteel.com.np/blogs',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* JSON-LD Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>

        <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10 text-center max-w-4xl">
          <span className="bg-white/10 text-white border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-block mb-4">
            Expert Resources & Buying Guides
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            हाम्रो ब्लग र उपयोगी लेखहरू
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            आफ्नो घर र अफिसको लागि सबैभन्दा बलियो, सस्तो र राम्रो फर्निचर कसरी छनोट गर्ने? यहाँ पाउनुहोस् विज्ञहरूको सल्लाह र उपयोगी लेखहरू।
          </p>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="py-16 container mx-auto px-6 md:px-12 lg:px-24">
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-150 shadow-sm max-w-2xl mx-auto px-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2m-2 3h.01M5.5 12h.01M11 8h.01M9 16H5m14 0h-6m-2-5H5" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">हामी नयाँ लेखहरू तयार गर्दैछौं</h3>
            <p className="text-gray-500 mb-6">
              फर्निचर डिजाइन, सस्तो मूल्य र उपयुक्त मर्मत सम्भार सम्बन्धी उपयोगी लेखहरू छिट्टै प्रकाशित हुनेछन्।
            </p>
            <Link
              href="/products"
              className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow shadow-primary/20"
            >
              हाम्रा उत्पादनहरू हेर्नुहोस्
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article 
                key={blog._id as unknown as string} 
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-350 transition-all flex flex-col h-full group"
              >
                {/* Image Block */}
                <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden border-b border-gray-100">
                  {blog.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2m-2 3h.01M5.5 12h.01M11 8h.01M9 16H5m14 0h-6m-2-5H5" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content Block */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3.5">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" />
                      {new Date(blog.createdAt).toLocaleDateString('ne-NP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-gray-400" />
                      {blog.readTime || 5} मिनेट पढ्नुहोस्
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2.5 line-clamp-2 leading-snug">
                    <Link href={`/blogs/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed flex-1">
                    {blog.excerpt}
                  </p>

                  {/* Link action */}
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <FaUser className="text-gray-400" /> {blog.author}
                    </span>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      थप पढ्नुहोस् <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Structured Local Bio Banner */}
      <section className="bg-blue-50/50 py-16 border-t border-gray-150">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-4xl text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            विराटनगरको अग्रणी स्टील उद्योग
          </h3>
          <p className="text-gray-650 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-6">
            श्री मनिष स्टील फर्निचर उद्योग विगत १० वर्ष भन्दा बढी समयदेखि पूर्वाञ्चल क्षेत्रमा गुणस्तरीय दराज, खाट, दराज आलमारी, अफिस फर्निचर र स्कुल बेन्चहरू उत्पादन गरी सुपथ मूल्यमा उपलब्ध गराउँदै आएको छ।
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="bg-primary hover:bg-primary/95 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow shadow-primary/10"
            >
              सम्पर्क गर्नुहोस्
            </Link>
            <Link
              href="/products"
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              उत्पादन सूची
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
