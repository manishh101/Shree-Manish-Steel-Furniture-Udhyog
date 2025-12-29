'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

/**
 * Production Error Boundary Component
 * 
 * Features:
 * - Catches JavaScript errors anywhere in the child component tree
 * - Logs errors for monitoring
 * - Provides fallback UI with retry mechanism
 * - Accessible error states
 * - Analytics error tracking
 */

interface ProductionErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | null, retry: () => void) => ReactNode;
  fallbackComponent?: string;
  title?: string;
  message?: string;
  showReloadButton?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ProductionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

declare const gtag: (command: string, event: string, params: Record<string, unknown>) => void;

class ProductionErrorBoundary extends Component<ProductionErrorBoundaryProps, ProductionErrorBoundaryState> {
  static defaultProps = {
    showReloadButton: true,
  };

  constructor(props: ProductionErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ProductionErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('ProductionErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Track error in analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
        custom_map: {
          component: this.props.fallbackComponent || 'Unknown',
          error_boundary: 'ProductionErrorBoundary'
        }
      });
    }

    // Log to external error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-8 max-w-md">
            <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {this.props.title || 'Something went wrong'}
            </h3>
            <p className="text-gray-600 mb-6">
              {this.props.message || 'We encountered an unexpected error. Please try again.'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left bg-red-50 p-4 rounded border">
                <summary className="font-medium text-red-800 cursor-pointer">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-700 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2 mx-auto"
                type="button"
              >
                <FaSync className="h-4 w-4" />
                Try Again
              </button>
              
              {this.props.showReloadButton && (
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-600 hover:text-gray-800 text-sm underline block mx-auto"
                  type="button"
                >
                  Reload Page
                </button>
              )}
            </div>

            {this.state.retryCount > 2 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <p>Still having issues? Please contact support.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProductionErrorBoundary;
