/**
 * Middleware for CSRF protection, rate limiting, security, and URL redirects.
 * Runs on all requests matched by the `config.matcher` below.
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

// In-memory redirect cache to reduce DB lookups
// Key: "from" path, Value: { to, permanent, cachedAt }
const redirectCache = new Map<string, { to: string; permanent: boolean; cachedAt: number }>();
const REDIRECT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── URL Redirect Check ──────────────────────────────────────────────────────
  // Only check page routes (not API, static, or _next paths)
  if (
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next/') &&
    !pathname.startsWith('/favicon') &&
    !pathname.includes('.')
  ) {
    const now = Date.now();
    const cached = redirectCache.get(pathname);

    if (cached && now - cached.cachedAt < REDIRECT_CACHE_TTL) {
      // Serve from cache
      const status = cached.permanent ? 301 : 302;
      // Increment hit counter in background (fire-and-forget)
      fetch(`${request.nextUrl.origin}/api/redirects/hit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: pathname }),
      }).catch(() => {});
      return NextResponse.redirect(new URL(cached.to, request.url), { status });
    } else if (!cached || now - cached.cachedAt >= REDIRECT_CACHE_TTL) {
      // Check the database via internal API
      try {
        const res = await fetch(
          `${request.nextUrl.origin}/api/redirects/lookup?from=${encodeURIComponent(pathname)}`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.redirect) {
            const { to, permanent } = data.redirect;
            redirectCache.set(pathname, { to, permanent, cachedAt: now });
            const status = permanent ? 301 : 302;
            return NextResponse.redirect(new URL(to, request.url), { status });
          }
        }
      } catch {
        // If redirect lookup fails, continue normally — don't block the request
      }
    }
  }

  // ── Rate Limiting ───────────────────────────────────────────────────────────
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

  // ── Security Headers & CSRF ─────────────────────────────────────────────────
  const response = NextResponse.next();

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && host && !origin.includes(host)) {
      if (!isAllowedCrossOriginRequest(origin, host)) {
        return NextResponse.json(
          { error: 'Cross-origin requests not allowed for this operation' },
          { status: 403 }
        );
      }
    }
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

/**
 * Check if cross-origin request is allowed
 */
function isAllowedCrossOriginRequest(origin: string, host: string): boolean {
  const allowedOrigins = [
    'https://manishsteel.com.np',
    'https://www.manishsteel.com.np',
    'http://localhost:3000',
    'http://localhost:5003',
  ];
  return allowedOrigins.some((allowed) => origin.includes(allowed));
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    '/api/:path*',
    // Match all page routes for redirect checking
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
