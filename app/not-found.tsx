import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Shree Manish Steel Furniture',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-6">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="inline-block bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Homepage
          </Link>
          <Link 
            href="/products" 
            className="inline-block bg-white text-primary border border-primary font-medium px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
