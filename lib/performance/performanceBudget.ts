/**
 * Performance Budget Configuration and Monitoring
 * Defines performance thresholds and checks against them
 * Requirements: 10.1, 14.4
 */

export interface PerformanceBudget {
  name: string;
  metric: string;
  threshold: number;
  unit: 'ms' | 'score' | 'bytes' | 'count';
  priority: 'high' | 'medium' | 'low';
}

/**
 * Performance budget thresholds
 * Based on Google's recommendations and real-world targets
 */
export const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  // Core Web Vitals
  {
    name: 'Largest Contentful Paint (LCP)',
    metric: 'LCP',
    threshold: 2500,
    unit: 'ms',
    priority: 'high',
  },
  {
    name: 'First Input Delay (FID)',
    metric: 'FID',
    threshold: 100,
    unit: 'ms',
    priority: 'high',
  },
  {
    name: 'Cumulative Layout Shift (CLS)',
    metric: 'CLS',
    threshold: 0.1,
    unit: 'score',
    priority: 'high',
  },
  {
    name: 'Interaction to Next Paint (INP)',
    metric: 'INP',
    threshold: 200,
    unit: 'ms',
    priority: 'high',
  },

  // Other Performance Metrics
  {
    name: 'First Contentful Paint (FCP)',
    metric: 'FCP',
    threshold: 1800,
    unit: 'ms',
    priority: 'medium',
  },
  {
    name: 'Time to First Byte (TTFB)',
    metric: 'TTFB',
    threshold: 800,
    unit: 'ms',
    priority: 'medium',
  },
  {
    name: 'Speed Index',
    metric: 'speedIndex',
    threshold: 3000,
    unit: 'ms',
    priority: 'medium',
  },
  {
    name: 'Total Blocking Time (TBT)',
    metric: 'TBT',
    threshold: 200,
    unit: 'ms',
    priority: 'medium',
  },

  // Resource Budgets
  {
    name: 'JavaScript Bundle Size',
    metric: 'javascriptSize',
    threshold: 300000, // 300KB
    unit: 'bytes',
    priority: 'high',
  },
  {
    name: 'CSS Bundle Size',
    metric: 'cssSize',
    threshold: 100000, // 100KB
    unit: 'bytes',
    priority: 'medium',
  },
  {
    name: 'Total Page Size',
    metric: 'totalSize',
    threshold: 2000000, // 2MB
    unit: 'bytes',
    priority: 'medium',
  },
  {
    name: 'Image Count',
    metric: 'imageCount',
    threshold: 20,
    unit: 'count',
    priority: 'low',
  },

  // Lighthouse Scores
  {
    name: 'Performance Score',
    metric: 'performanceScore',
    threshold: 85,
    unit: 'score',
    priority: 'high',
  },
  {
    name: 'Accessibility Score',
    metric: 'accessibilityScore',
    threshold: 90,
    unit: 'score',
    priority: 'high',
  },
  {
    name: 'Best Practices Score',
    metric: 'bestPracticesScore',
    threshold: 90,
    unit: 'score',
    priority: 'medium',
  },
  {
    name: 'SEO Score',
    metric: 'seoScore',
    threshold: 95,
    unit: 'score',
    priority: 'high',
  },
];

/**
 * Check if a metric value is within budget
 */
export function isWithinBudget(metric: string, value: number): boolean {
  const budget = PERFORMANCE_BUDGETS.find(b => b.metric === metric);
  if (!budget) return true;

  // For scores, higher is better
  if (budget.unit === 'score') {
    return value >= budget.threshold;
  }

  // For other metrics, lower is better
  return value <= budget.threshold;
}

/**
 * Get budget status for a metric
 */
export function getBudgetStatus(metric: string, value: number): 'pass' | 'warning' | 'fail' {
  const budget = PERFORMANCE_BUDGETS.find(b => b.metric === metric);
  if (!budget) return 'pass';

  const isWithin = isWithinBudget(metric, value);
  
  if (isWithin) return 'pass';

  // Calculate how far off we are
  const deviation = budget.unit === 'score'
    ? (budget.threshold - value) / budget.threshold
    : (value - budget.threshold) / budget.threshold;

  // If within 20% of threshold, it's a warning, otherwise it's a fail
  return deviation <= 0.2 ? 'warning' : 'fail';
}

/**
 * Get all budget violations
 */
export function getBudgetViolations(metrics: Record<string, number>): PerformanceBudget[] {
  return PERFORMANCE_BUDGETS.filter(budget => {
    const value = metrics[budget.metric];
    return value !== undefined && !isWithinBudget(budget.metric, value);
  });
}

/**
 * Format metric value for display
 */
export function formatMetricValue(value: number, unit: string): string {
  switch (unit) {
    case 'ms':
      return `${value.toFixed(0)}ms`;
    case 'score':
      return value.toFixed(1);
    case 'bytes':
      if (value < 1024) return `${value}B`;
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`;
      return `${(value / (1024 * 1024)).toFixed(1)}MB`;
    case 'count':
      return value.toString();
    default:
      return value.toString();
  }
}

/**
 * Get performance budget summary
 */
export function getPerformanceBudgetSummary(metrics: Record<string, number>) {
  const violations = getBudgetViolations(metrics);
  const total = PERFORMANCE_BUDGETS.filter(b => metrics[b.metric] !== undefined).length;
  const passing = total - violations.length;
  
  return {
    total,
    passing,
    violations: violations.length,
    passRate: total > 0 ? (passing / total) * 100 : 0,
    criticalViolations: violations.filter(v => v.priority === 'high').length,
  };
}
