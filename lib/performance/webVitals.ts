/**
 * Web Vitals tracking and reporting
 * Monitors Core Web Vitals (LCP, FID, CLS) and other performance metrics
 * Requirements: 10.1, 14.4
 */

export interface Metric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

// Thresholds based on Google's recommendations
const THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500,
    poor: 4000,
  },
  // First Input Delay (FID)
  FID: {
    good: 100,
    poor: 300,
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1,
    poor: 0.25,
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800,
    poor: 3000,
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800,
    poor: 1800,
  },
  // Interaction to Next Paint (INP)
  INP: {
    good: 200,
    poor: 500,
  },
};

/**
 * Determine rating based on metric name and value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to Google Analytics
 */
function sendToGoogleAnalytics(metric: Metric) {
  // Check if gtag is available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      metric_rating: metric.rating,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }
}

/**
 * Send metric to Vercel Analytics (if available)
 */
function sendToVercelAnalytics(metric: Metric) {
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', {
      name: metric.name,
      data: {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      },
    });
  }
}

/**
 * Log metric to console in development
 */
function logMetricToConsole(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `${emoji} ${metric.name}:`,
      `${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`,
      `(${metric.rating})`
    );
  }
}

/**
 * Store metric in session storage for performance dashboard
 */
function storeMetric(metric: Metric) {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const metrics = JSON.parse(sessionStorage.getItem('webVitals') || '[]');
      metrics.push({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
      });
      // Keep only last 50 metrics
      if (metrics.length > 50) {
        metrics.shift();
      }
      sessionStorage.setItem('webVitals', JSON.stringify(metrics));
    } catch (error) {
      // Ignore storage errors
    }
  }
}

/**
 * Main reporting function for Web Vitals
 */
export function reportWebVitals(metric: Metric) {
  // Add rating to metric
  const enrichedMetric = {
    ...metric,
    rating: getRating(metric.name, metric.value),
  };

  // Send to multiple destinations
  sendToGoogleAnalytics(enrichedMetric);
  sendToVercelAnalytics(enrichedMetric);
  logMetricToConsole(enrichedMetric);
  storeMetric(enrichedMetric);
}

/**
 * Get all stored metrics from session storage
 */
export function getStoredMetrics() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      return JSON.parse(sessionStorage.getItem('webVitals') || '[]');
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Clear stored metrics
 */
export function clearStoredMetrics() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.removeItem('webVitals');
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  const metrics = getStoredMetrics();
  if (metrics.length === 0) return null;

  const summary: Record<string, any> = {};
  const metricNames = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'];

  metricNames.forEach(name => {
    const metricValues = metrics.filter((m: any) => m.name === name);
    if (metricValues.length > 0) {
      const latest = metricValues[metricValues.length - 1];
      const average = metricValues.reduce((sum: number, m: any) => sum + m.value, 0) / metricValues.length;
      summary[name] = {
        latest: latest.value,
        average,
        rating: latest.rating,
        count: metricValues.length,
      };
    }
  });

  return summary;
}
