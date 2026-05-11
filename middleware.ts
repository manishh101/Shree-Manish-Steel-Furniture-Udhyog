/**
 * Middleware for CSRF protection, rate limiting, and security
 * This middleware runs on all requests
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (for basic protection)
// In production, use Redis or Upstash for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // requests per window
const RATE_LIMIT_ENDPOINTS = {
  '/api/inquiries': { window: 15 * 60 * 1000, max: 5 }, // 5 per 15 min
  '/api/auth/login': { window: 15 * 60 * 1000, max: 10 }, // 10 per 15 min
  '/api/auth/register': { window: 60 * 60 * 1000, max: 5 }, // 5 per hour
};

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const direct = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || direct || 'unknown';
}

/**
 * Check rate limit for an IP
 */
function checkRateLimit(ip: string, endpoint: string): boolean {
  const now = Date.now();
  const key = `${ip}:${endpoint}`;
  const limits = (RATE_LIMIT_ENDPOINTS as Record<string, any>)[endpoint] || {
    window: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX,
  };

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitMap.set(key, { count: 1, resetTime: now + limits.window });
    return true;
  }

  if (entry.count < limits.max) {
    entry.count++;
    return true;
  }

  return false;
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check rate limiting for specific endpoints
  for (const [endpoint] of Object.entries(RATE_LIMIT_ENDPOINTS)) {
    if (pathname.startsWith(endpoint)) {
      const ip = getClientIp(request);
      if (!checkRateLimit(ip, endpoint)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429, headers: { 'Retry-After': '900' } }
        );
      }
    }
  }

  // Add security headers to response
  const response = NextResponse.next();
  
  // CSRF Protection - check origin for POST/PUT/DELETE requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // In production, verify origin matches host
    if (origin && host && !origin.includes(host)) {
      // Allow only same-origin requests for state-changing operations
      // Exceptions can be made for specific trusted origins
      if (!isAllowedCrossOriginRequest(origin, host)) {
        return NextResponse.json(
          { error: 'Cross-origin requests not allowed for this operation' },
          { status: 403 }
        );
      }
    }
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

/**
 * Check if cross-origin request is allowed
 */
function isAllowedCrossOriginRequest(origin: string, host: string): boolean {
  // Add any allowed cross-origin hosts here
  const allowedOrigins = [
    'https://manishsteel.com.np',
    'https://www.manishsteel.com.np',
    'http://localhost:3000',
    'http://localhost:5003',
  ];
  
  return allowedOrigins.some(allowed => origin.includes(allowed));
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    '/api/:path*',
    // Add other paths as needed
  ],
};
