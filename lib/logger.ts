/**
 * Production-ready Logger Service
 * Handles logging with different levels for development and production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  error?: Error;
}

class LoggerService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Debug log - only shown in development
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * Info log - shown in development and production
   */
  info(message: string, data?: unknown): void {
    console.log(`[INFO] ${message}`, data);
  }

  /**
   * Warning log - shown in development and production
   */
  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data);
  }

  /**
   * Error log - always shown with full details in development, sanitized in production
   */
  error(message: string, error?: Error | unknown, context?: unknown): void {
    const timestamp = new Date().toISOString();
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${timestamp} ${message}`, error, context);
    } else {
      // In production, only log the message and sanitized error info
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] ${timestamp} ${message}: ${errorMsg}`);
      
      // Send to error tracking service (Sentry, etc.) in production
      this.sendToErrorTracking({
        message,
        errorMessage: errorMsg,
        context,
        timestamp
      });
    }
  }

  /**
   * Send error to error tracking service
   * Override this in production to send to Sentry, LogRocket, etc.
   */
  private sendToErrorTracking(entry: unknown): void {
    // TODO: Integrate with Sentry or similar error tracking service
    // Example:
    // Sentry.captureException(new Error(entry.message), { extra: entry.context });
  }

  /**
   * Format sensitive data for logging (don't log full details)
   */
  sanitize(data: unknown): unknown {
    if (!this.isDevelopment && typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Skip sensitive fields
        if (['password', 'token', 'secret', 'apiKey', 'apiSecret', 'email'].includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    return data;
  }
}

export const logger = new LoggerService();

/**
 * Alternative: Create a global logger for use in API routes
 */
export function createLogger(context: string) {
  return {
    debug: (msg: string, data?: unknown) => logger.debug(`[${context}] ${msg}`, data),
    info: (msg: string, data?: unknown) => logger.info(`[${context}] ${msg}`, data),
    warn: (msg: string, data?: unknown) => logger.warn(`[${context}] ${msg}`, data),
    error: (msg: string, error?: Error | unknown, context?: unknown) => 
      logger.error(`[${context}] ${msg}`, error, context)
  };
}
