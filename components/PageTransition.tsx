'use client';

import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Check if user prefers reduced motion
 */
const hasReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Enhanced animation variants for professional page transitions
const pageVariants: Variants = {
  initial: {
    opacity: 0.2,  // Start mostly visible to reduce LCP impact (Req 10.1)
    y: 8,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,  // Reduced from 0.5s to minimize LCP delay
      ease: [0.22, 1, 0.36, 1],
    }
  },
  out: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.47, 0, 0.745, 0.715]
    }
  }
};

// Simplified variants for users who prefer reduced motion
const accessibleVariants: Variants = {
  initial: { opacity: 0.5 },
  in: { 
    opacity: 1,
    transition: { duration: 0.15 }
  },
  out: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

/**
 * PageTransition - Creates smooth, professional transitions between pages
 * 
 * Features:
 * - Respects reduced motion preferences
 * - Optimized for both mobile and desktop
 * - Staggered reveal of child elements
 * - Smooth fade transitions
 * - Auto scroll to top on route change
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const reducedMotion = typeof window !== 'undefined' ? hasReducedMotion() : false;
  
  // Use appropriate variants based on user preferences
  const variants = reducedMotion ? accessibleVariants : pageVariants;
  
  // Force scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
