'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

interface GalleryHeroProps {
  title?: string;
  subtitle?: string;
  heroImage?: string;
  stats?: {
    totalImages: number;
    totalCategories: number;
    featuredProducts: number;
  } | null;
}

// Animation variants
const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: "easeOut" 
    }
  }
};

const decorVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 1.2, 
      ease: "easeOut",
      delay: 0.3
    }
  }
};

/**
 * Enhanced Hero section for the Gallery page with a professional design
 */
const GalleryHero: React.FC<GalleryHeroProps> = ({ 
  title = 'Product Gallery', 
  subtitle = 'Browse our comprehensive collection of premium products', 
  heroImage,
  stats 
}) => {
  const scrollToGallery = () => {
    document.querySelector('#gallery-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <section className="relative bg-gradient-to-r from-primary-dark to-secondary overflow-hidden">
      {/* Background elements for visual appeal */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Decorative shapes */}
        <motion.div 
          className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-xl"
          variants={decorVariants}
          initial="hidden"
          animate="visible"
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-lg"
          variants={decorVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full transform translate-x-1/3 translate-y-1/3 blur-xl"
          variants={decorVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        />
        
        {/* Optional hero image with overlay */}
        {heroImage && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={heroImage} 
              alt="Gallery Cover" 
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/5"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 xl:py-28 relative z-10">
        {/* Header Content with Enhanced Visual Hierarchy */}
        <div className="max-w-3xl mx-auto text-white">
          <motion.div 
            className="flex items-center justify-center mb-4 sm:mb-6"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="h-px w-12 bg-white/40"></div>
            <div className="px-4">
              <span className="text-sm sm:text-base uppercase tracking-widest text-white/80 font-light">Our Collection</span>
            </div>
            <div className="h-px w-12 bg-white/40"></div>
          </motion.div>
          
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6 text-center"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h1>
          
          <motion.div 
            className="w-24 h-1 mx-auto bg-accent mb-6 sm:mb-8 rounded-full"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          ></motion.div>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-white/90 text-center max-w-2xl mx-auto leading-relaxed"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            {subtitle}
          </motion.p>
          
          {/* Call to action buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center mt-8 sm:mt-10 gap-3 sm:gap-5"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <button 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary hover:bg-accent hover:text-white 
                transition-colors duration-300 font-medium sm:font-semibold rounded-xl shadow-xl 
                hover:shadow-2xl focus:ring-4 focus:ring-white/30 focus:outline-none"
              onClick={scrollToGallery}
            >
              Browse Products
            </button>
            <Link 
              href="/contact"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white 
                transition-colors duration-300 font-medium sm:font-semibold rounded-xl shadow-lg 
                hover:shadow-xl border border-white/20 focus:ring-4 focus:ring-white/30 focus:outline-none text-center"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GalleryHero;
