/**
 * Custom hooks for smart scroll behavior
 * Provides show/hide state based on scroll direction with immediate response
 */
'use client';

import { useState, useEffect } from 'react';

interface UseSmartScrollOptions {
  /** Scroll distance before hiding (default: 80px) */
  hideThreshold?: number;
  /** Distance from top to always show (default: 10px) */
  showOnTop?: number;
  /** Apply only on mobile devices (default: false) */
  onlyMobile?: boolean;
  /** Throttle delay in milliseconds (default: 8) */
  throttleMs?: number;
}

/**
 * Custom hook for smart scroll behavior
 * @param options - Configuration options
 * @returns isVisible - Whether the element should be visible
 */
export const useSmartScroll = (options: UseSmartScrollOptions = {}): boolean => {
  const {
    hideThreshold = 80,
    showOnTop = 10,
    onlyMobile = false,
    throttleMs = 8
  } = options;

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if we should only apply on mobile
      if (onlyMobile && window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }
      
      // Always show when at top of page
      if (currentScrollY < showOnTop) {
        setIsVisible(true);
      }
      // Hide when scrolling down past threshold
      else if (currentScrollY > lastScrollY && currentScrollY > hideThreshold) {
        setIsVisible(false);
      }
      // Show IMMEDIATELY when scrolling up (no conditions)
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for performance
    let timeoutId: NodeJS.Timeout | null = null;
    const throttledHandleScroll = () => {
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, throttleMs);
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    window.addEventListener('resize', handleScroll); // Reset on window resize
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY, hideThreshold, showOnTop, onlyMobile, throttleMs]);

  return isVisible;
};

interface ScrollDirectionResult {
  direction: 'up' | 'down';
  position: number;
  isAtTop: boolean;
}

/**
 * Custom hook for scroll direction detection
 * @param threshold - Minimum scroll distance to detect direction change
 * @returns { direction, position, isAtTop }
 */
export const useScrollDirection = (threshold: number = 5): ScrollDirectionResult => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (Math.abs(currentScrollY - lastScrollY) > threshold) {
        if (currentScrollY > lastScrollY) {
          setScrollDirection('down');
        } else {
          setScrollDirection('up');
        }
        setLastScrollY(currentScrollY);
      }
      
      setScrollPosition(currentScrollY);
    };

    let timeoutId: NodeJS.Timeout | null = null;
    const throttledHandleScroll = () => {
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 8);
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY, threshold]);

  return {
    direction: scrollDirection,
    position: scrollPosition,
    isAtTop: scrollPosition < 10
  };
};

export default useSmartScroll;
