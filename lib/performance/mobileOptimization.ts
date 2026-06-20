/**
 * Mobile Optimization Utilities
 * 
 * Provides utilities for mobile-specific performance optimization,
 * mobile viewport handling, and mobile-friendly interactions.
 * 
 * Requirements: 8.1, 8.2, 8.3, 10.1
 */

export interface MobileOptimizationConfig {
  enablePreconnect?: boolean;
  enablePrefetch?: boolean;
  optimizeImages?: boolean;
  reducedMotion?: boolean;
}

export interface TapTargetValidation {
  element: HTMLElement;
  width: number;
  height: number;
  isValid: boolean;
  recommendation?: string;
}

/**
 * Check if the current device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768
  );
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimal image size for mobile viewport
 */
export const getMobileImageSize = (
  containerWidth: number,
  devicePixelRatio: number = 1
): number => {
  // Account for device pixel ratio (retina displays)
  return Math.ceil(containerWidth * devicePixelRatio);
};

/**
 * Validate tap target size (minimum 48x48px)
 * Requirements: 8.3
 */
export const validateTapTarget = (
  element: HTMLElement
): TapTargetValidation => {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  const MIN_TAP_SIZE = 48;
  const isValid = width >= MIN_TAP_SIZE && height >= MIN_TAP_SIZE;
  
  let recommendation: string | undefined;
  if (!isValid) {
    if (width < MIN_TAP_SIZE && height < MIN_TAP_SIZE) {
      recommendation = `Increase both width and height to at least ${MIN_TAP_SIZE}px`;
    } else if (width < MIN_TAP_SIZE) {
      recommendation = `Increase width to at least ${MIN_TAP_SIZE}px`;
    } else {
      recommendation = `Increase height to at least ${MIN_TAP_SIZE}px`;
    }
  }
  
  return {
    element,
    width,
    height,
    isValid,
    recommendation,
  };
};

/**
 * Audit all tap targets on the page
 * Requirements: 8.3
 */
export const auditTapTargets = (): {
  total: number;
  valid: number;
  invalid: TapTargetValidation[];
} => {
  if (typeof window === 'undefined') {
    return { total: 0, valid: 0, invalid: [] };
  }
  
  // Select all interactive elements
  const interactiveSelectors = [
    'button',
    'a',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    '[role="button"]',
    '[onclick]',
  ];
  
  const elements = document.querySelectorAll<HTMLElement>(
    interactiveSelectors.join(', ')
  );
  
  const results: TapTargetValidation[] = [];
  let validCount = 0;
  
  elements.forEach((element) => {
    const validation = validateTapTarget(element);
    if (validation.isValid) {
      validCount++;
    } else {
      results.push(validation);
    }
  });
  
  return {
    total: elements.length,
    valid: validCount,
    invalid: results,
  };
};

/**
 * Add preconnect links for external resources
 * Improves mobile load time by establishing early connections
 * Requirements: 10.1
 */
export const addPreconnectLinks = (domains: string[]): void => {
  if (typeof document === 'undefined') return;
  
  domains.forEach((domain) => {
    // Check if preconnect already exists
    const existing = document.querySelector(
      `link[rel="preconnect"][href="${domain}"]`
    );
    
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
};

/**
 * Optimize viewport for mobile devices
 * Prevents layout shift and ensures proper mobile rendering
 */
export const optimizeMobileViewport = (): void => {
  if (typeof document === 'undefined') return;
  
  // Check if viewport meta tag exists
  let viewport = document.querySelector('meta[name="viewport"]');
  
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }
  
  // Set optimal viewport configuration
  viewport.setAttribute(
    'content',
    'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
  );
};

/**
 * Lazy load images below the fold for mobile
 * Requirements: 4.2, 10.1
 */
export const setupLazyLoading = (): void => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }
  
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          imageObserver.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading slightly before viewport
    }
  );
  
  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
};

/**
 * Reduce JavaScript execution time on mobile
 * Defers non-critical scripts to improve initial load
 * Requirements: 8.2, 10.1
 */
export const deferNonCriticalScripts = (): void => {
  if (typeof document === 'undefined') return;
  
  // Find all non-critical scripts
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[data-defer-mobile]'
  );
  
  scripts.forEach((script) => {
    if (!isMobileDevice()) return;
    
    // Defer script execution
    const newScript = document.createElement('script');
    newScript.src = script.src;
    newScript.defer = true;
    
    // Copy attributes
    Array.from(script.attributes).forEach((attr) => {
      if (attr.name !== 'src') {
        newScript.setAttribute(attr.name, attr.value);
      }
    });
    
    script.parentNode?.replaceChild(newScript, script);
  });
};

/**
 * Monitor and report mobile performance metrics
 * Requirements: 10.1, 8.2
 */
export const measureMobilePerformance = (): {
  lcp?: number;
  fid?: number;
  cls?: number;
  tbt?: number;
} => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return {};
  }
  
  const metrics: {
    lcp?: number;
    fid?: number;
    cls?: number;
    tbt?: number;
  } = {};
  
  try {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
      };
      metrics.lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & {
          processingStart?: number;
          startTime?: number;
        };
        metrics.fid = fidEntry.processingStart
          ? fidEntry.processingStart - fidEntry.startTime
          : 0;
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const layoutEntry = entry as PerformanceEntry & { value?: number };
        if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
          clsValue += layoutEntry.value || 0;
        }
      });
      metrics.cls = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    console.warn('Error measuring mobile performance:', error);
  }
  
  return metrics;
};

/**
 * Initialize mobile optimizations
 * Requirements: 8.1, 8.2, 10.1
 */
export const initMobileOptimizations = (
  config: MobileOptimizationConfig = {}
): void => {
  if (typeof window === 'undefined') return;
  
  const {
    enablePreconnect = true,
    enablePrefetch = true,
    optimizeImages = true,
    reducedMotion = prefersReducedMotion(),
  } = config;
  
  // Optimize viewport
  optimizeMobileViewport();
  
  // Add preconnect for critical resources
  if (enablePreconnect) {
    addPreconnectLinks([
      'https://res.cloudinary.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ]);
  }
  
  // Setup lazy loading for images
  if (optimizeImages) {
    setupLazyLoading();
  }
  
  // Defer non-critical scripts on mobile
  if (isMobileDevice()) {
    deferNonCriticalScripts();
  }
  
  // Add reduced motion class if needed
  if (reducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  }
  
  // Measure performance metrics
  measureMobilePerformance();
};

/**
 * Export default configuration
 */
export default {
  init: initMobileOptimizations,
  isMobile: isMobileDevice,
  validateTapTarget,
  auditTapTargets,
  measurePerformance: measureMobilePerformance,
};
