'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';

type AnimationType = 'fade' | 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'zoom' | 'zoomFadeUp';

interface ScrollAnimatorProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

/**
 * Check if user prefers reduced motion
 */
const hasReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * ScrollAnimator - Professional scroll-triggered animation component
 * 
 * Features:
 * - Multiple animation effects (fade, slide, zoom)
 * - Configurable thresholds and delays
 * - Accessibility support (respects reduced motion)
 * - Optimized for performance
 */
const ScrollAnimator: React.FC<ScrollAnimatorProps> = ({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.7,
  threshold = 0.2,
  className = '',
  ...props
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: threshold,
    margin: "0px 0px -100px 0px"
  });
  
  // Define animation variants
  const getVariants = (): Variants => {
    // Check for reduced motion preference
    if (hasReducedMotion()) {
      return {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1, 
          transition: { 
            duration: Math.min(duration, 0.3),
            delay 
          }
        }
      };
    }
    
    // Full animation variants
    const variants: Record<AnimationType, Variants> = {
      fade: {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1.0] }
        }
      },
      fadeUp: {
        hidden: { opacity: 0, y: 40 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration, 
            delay, 
            ease: [0.215, 0.61, 0.355, 1.0] 
          }
        }
      },
      fadeDown: {
        hidden: { opacity: 0, y: -40 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration, 
            delay, 
            ease: [0.215, 0.61, 0.355, 1.0] 
          }
        }
      },
      fadeLeft: {
        hidden: { opacity: 0, x: -40 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: { 
            duration, 
            delay, 
            ease: [0.215, 0.61, 0.355, 1.0] 
          }
        }
      },
      fadeRight: {
        hidden: { opacity: 0, x: 40 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: { 
            duration, 
            delay, 
            ease: [0.215, 0.61, 0.355, 1.0] 
          }
        }
      },
      zoom: {
        hidden: { opacity: 0, scale: 0.92 },
        visible: { 
          opacity: 1, 
          scale: 1,
          transition: { 
            duration, 
            delay, 
            ease: [0.175, 0.885, 0.32, 1.275] 
          }
        }
      },
      zoomFadeUp: {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { 
          opacity: 1, 
          scale: 1,
          y: 0,
          transition: { 
            duration, 
            delay: delay + 0.1, 
            ease: [0.175, 0.885, 0.32, 1.275] 
          }
        }
      }
    };
    
    return variants[animation] || variants.fadeUp;
  };
  
  // Trigger animation when in view
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={getVariants()}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimator;
