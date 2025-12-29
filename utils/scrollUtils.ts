/**
 * Professional Scroll Utility System
 * Provides robust, device-aware scroll behaviors with accessibility features
 * Optimized for Next.js applications with modern browser compatibility
 */

// Configuration constants
const SCROLL_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  DESKTOP_SCROLL_DURATION: 800,
  THROTTLE_DELAY: 16,
  DEBOUNCE_DELAY: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 50,
  DEFAULT_OFFSETS: {
    mobile: 0,
    desktop: 0
  },
  EASING: {
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  }
};

// Device detection utilities
export const DeviceUtils = {
  isMobile: () => typeof window !== 'undefined' && window.innerWidth < SCROLL_CONFIG.MOBILE_BREAKPOINT,
  isTablet: () => typeof window !== 'undefined' && window.innerWidth >= SCROLL_CONFIG.MOBILE_BREAKPOINT && window.innerWidth < 1024,
  isDesktop: () => typeof window !== 'undefined' && window.innerWidth >= 1024,
  hasReducedMotion: () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  supportsScrollBehavior: () => typeof document !== 'undefined' && 'scrollBehavior' in document.documentElement.style,
  isTouchDevice: () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
};

// Performance utilities
export const PerformanceUtils = {
  throttle: <T extends (...args: unknown[]) => unknown>(func: T, delay = SCROLL_CONFIG.THROTTLE_DELAY) => {
    let inThrottle = false;
    return function(this: unknown, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, delay);
      }
    };
  },

  debounce: <T extends (...args: unknown[]) => unknown>(func: T, delay = SCROLL_CONFIG.DEBOUNCE_DELAY) => {
    let timeoutId: NodeJS.Timeout;
    return function(this: unknown, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
};

// Header detection utility
export const getHeaderOffset = () => {
  if (typeof document === 'undefined') return 0;
  const header = document.querySelector('header, .header, .navbar, .nav-header');
  if (header) {
    const headerHeight = (header as HTMLElement).offsetHeight;
    const headerStyle = window.getComputedStyle(header);
    const isFixed = headerStyle.position === 'fixed' || headerStyle.position === 'sticky';
    return isFixed ? headerHeight : 0;
  }
  return 0;
};

// Core scroll utilities
export const ScrollCore = {
  /**
   * Get optimal scroll position with header offset consideration
   */
  getOptimalScrollPosition: (targetPosition = 0, customOffset: number | null = null) => {
    const headerOffset = getHeaderOffset();
    const deviceOffset = customOffset !== null ? customOffset : 
      (DeviceUtils.isMobile() ? SCROLL_CONFIG.DEFAULT_OFFSETS.mobile : SCROLL_CONFIG.DEFAULT_OFFSETS.desktop);
    
    return Math.max(0, targetPosition - headerOffset - deviceOffset);
  },

  /**
   * Perform immediate scroll with fallback attempts
   */
  performInstantScroll: (position: number, attempts = SCROLL_CONFIG.RETRY_ATTEMPTS) => {
    if (typeof window === 'undefined') return;
    
    const scroll = () => {
      try {
        window.scrollTo(0, position);
        document.documentElement.scrollTop = position;
        document.body.scrollTop = position;
      } catch (error) {
        console.warn('Scroll attempt failed:', error);
      }
    };

    scroll();
    
    // Retry mechanism for reliability
    for (let i = 1; i <= attempts; i++) {
      setTimeout(scroll, i * SCROLL_CONFIG.RETRY_DELAY);
    }
  },

  /**
   * Perform smooth scroll with custom easing
   */
  performSmoothScroll: (targetPosition: number, duration = SCROLL_CONFIG.DESKTOP_SCROLL_DURATION) => {
    if (typeof window === 'undefined') return;
    
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = SCROLL_CONFIG.EASING.easeInOutCubic(progress);
      
      const currentPosition = startPosition + (distance * easedProgress);
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }
};

interface ScrollOptions {
  offset?: number | null;
  smooth?: boolean | null;
  instant?: boolean | null;
  duration?: number;
}

/**
 * Professional scroll to top with device optimization and accessibility
 */
export const scrollToTop = (options: ScrollOptions = {}) => {
  if (typeof window === 'undefined') return;
  
  const {
    offset = null,
    smooth = null,
    instant = null,
    duration = SCROLL_CONFIG.DESKTOP_SCROLL_DURATION
  } = options;

  const optimalPosition = ScrollCore.getOptimalScrollPosition(0, offset);
  const shouldUseSmooth = smooth !== null ? smooth : 
    (instant !== null ? !instant : 
      (!DeviceUtils.isMobile() && DeviceUtils.supportsScrollBehavior() && !DeviceUtils.hasReducedMotion()));

  if (shouldUseSmooth) {
    ScrollCore.performSmoothScroll(optimalPosition, duration);
  } else {
    ScrollCore.performInstantScroll(optimalPosition);
  }
};

/**
 * Enhanced force scroll to top for critical scenarios
 * Uses multiple strategies to ensure scroll succeeds
 */
export const forceScrollToTop = (options: { offset?: number } = {}) => {
  if (typeof window === 'undefined') return;
  
  const { offset = 0 } = options;
  const position = ScrollCore.getOptimalScrollPosition(0, offset);
  
  // Multiple immediate attempts with different methods
  ScrollCore.performInstantScroll(position, 5);
  
  // Additional attempts with delays
  const additionalAttempts = [100, 200, 500];
  additionalAttempts.forEach(delay => {
    setTimeout(() => ScrollCore.performInstantScroll(position), delay);
  });
  
  // Final attempt using native browser scroll behavior
  setTimeout(() => {
    try {
      window.scrollTo({ top: position, behavior: 'auto' });
    } catch {
      window.scrollTo(0, position);
    }
  }, 600);
};

interface ScrollToElementOptions extends ScrollOptions {
  block?: ScrollLogicalPosition;
}

/**
 * Scroll to specific element with intelligent offset calculation
 */
export const scrollToElement = (target: string | Element | null, options: ScrollToElementOptions = {}) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  const {
    offset = null,
    smooth = null,
    duration = SCROLL_CONFIG.DESKTOP_SCROLL_DURATION
  } = options;

  let element: Element | null = null;
  if (typeof target === 'string') {
    element = document.getElementById(target) || document.querySelector(target);
  } else {
    element = target;
  }

  if (!element) {
    console.warn(`Element not found: ${target}`);
    return;
  }

  const elementRect = element.getBoundingClientRect();
  const elementPosition = elementRect.top + window.pageYOffset;
  const optimalPosition = ScrollCore.getOptimalScrollPosition(elementPosition, offset);

  const shouldUseSmooth = smooth !== null ? smooth : 
    (!DeviceUtils.isMobile() && DeviceUtils.supportsScrollBehavior() && !DeviceUtils.hasReducedMotion());

  if (shouldUseSmooth) {
    ScrollCore.performSmoothScroll(optimalPosition, duration);
  } else {
    ScrollCore.performInstantScroll(optimalPosition);
  }
};

/**
 * Handle section navigation with proper offset calculation
 */
export const handleSectionClick = (e: Event | null, sectionId: string, options: ScrollToElementOptions = {}) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  const defaultOffset = DeviceUtils.isMobile() ? 60 : 80;
  const finalOptions = {
    offset: defaultOffset,
    ...options
  };

  scrollToElement(sectionId, finalOptions);
};

/**
 * Legacy compatibility function - maintained for backward compatibility
 */
export const scrollToTopWithOffset = (mobileOffset = 0, desktopOffset = 0) => {
  const offset = DeviceUtils.isMobile() ? mobileOffset : desktopOffset;
  scrollToTop({ offset, instant: DeviceUtils.isMobile() });
};

// Scroll restoration utilities
export const ScrollRestore = {
  save: (key = 'scrollPosition') => {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, window.pageYOffset.toString());
    }
  },

  restore: (key = 'scrollPosition', options: ScrollOptions = {}) => {
    if (typeof sessionStorage === 'undefined') return;
    const savedPosition = sessionStorage.getItem(key);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      if (!isNaN(position)) {
        setTimeout(() => {
          scrollToTop({ ...options, instant: true });
        }, 100);
      }
    }
  },

  clear: (key = 'scrollPosition') => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }
};

// Scroll event handlers
export const ScrollHandlers = {
  onPageLoad: PerformanceUtils.throttle(() => {
    // Ensure page starts at top on load
    if (typeof window !== 'undefined' && window.pageYOffset > 0) {
      scrollToTop({ instant: true });
    }
  }),

  onNavigation: () => {
    // Handle navigation scroll - immediate and reliable
    console.log('ScrollHandlers.onNavigation: Forcing scroll to top');
    
    const performNavigationScroll = () => {
      scrollToTop({ instant: true });
      
      setTimeout(() => {
        forceScrollToTop({ offset: 0 });
      }, 50);
      
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.pageYOffset > 0) {
          ScrollCore.performInstantScroll(0, 3);
        }
      }, 150);
    };

    performNavigationScroll();
    
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        if (window.pageYOffset > 0) {
          performNavigationScroll();
        }
      });
    }
  },

  onFilterChange: PerformanceUtils.debounce(() => {
    scrollToTop({ instant: DeviceUtils.isMobile() });
  })
};

// Main exports for backward compatibility
export { scrollToTop as default };

// Export device utilities for external use
export const isMobileDevice = DeviceUtils.isMobile;
