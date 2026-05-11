/**
 * Input Validation & Sanitization Utilities
 * Prevents injection attacks, XSS, and ensures data integrity
 */

import * as z from 'zod';

/**
 * Escape regex special characters to prevent RegExp injection
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  let sanitized = input.trim();

  // Check length
  if (sanitized.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // Check for suspicious patterns
  if (sanitized.includes('<script') || sanitized.includes('javascript:')) {
    throw new Error('Input contains suspicious patterns');
  }

  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate phone number (basic format)
 */
export function validatePhone(phone: string): boolean {
  // Allow + prefix and digits/spaces
  const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
  return phoneRegex.test(phone) && phone.length <= 20;
}

/**
 * Common Zod schemas for API validation
 */
export const ValidationSchemas = {
  // Inquiry validation
  inquiry: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone: z.string().min(7).max(20),
    message: z.string().min(10).max(2000),
    category: z.string().max(50).optional(),
  }),

  // Product creation validation
  product: z.object({
    name: z.string().min(1).max(200),
    description: z.string().min(10).max(2000),
    categoryId: z.string().min(1),
    subcategoryId: z.string().optional(),
    image: z.string().url(),
    price: z.number().positive().optional(),
    isAvailable: z.boolean().optional(),
    featured: z.boolean().optional(),
  }),

  // Search validation
  search: z.object({
    q: z.string().min(1).max(100),
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  }),

  // Pagination validation
  pagination: z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20),
  }),

  // Login validation
  login: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  }),
};

/**
 * Validate and sanitize search query (prevents NoSQL injection)
 */
export function validateSearchQuery(search: string): string {
  try {
    const validated = sanitizeString(search, 100);
    return escapeRegex(validated);
  } catch (error) {
    throw new Error('Invalid search query');
  }
}

/**
 * Validate request size
 */
export function validateRequestSize(bodySize: number, maxSizeInBytes: number = 1048576): void {
  if (bodySize > maxSizeInBytes) {
    throw new Error(
      `Request body too large. Maximum size is ${maxSizeInBytes / 1024 / 1024}MB`
    );
  }
}
