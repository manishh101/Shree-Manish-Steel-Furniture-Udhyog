import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// JWT_SECRET must be provided via environment variables
// Never use hardcoded defaults in production
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required. Please set it in your .env.local file.'
  );
}

export interface JWTPayload {
  user: {
    id: string;
    role: string;
  };
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const token = request.cookies.get('token')?.value;
  return token || null;
}

export function getUserFromRequest(request: NextRequest): JWTPayload['user'] | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  
  const payload = verifyToken(token);
  return payload?.user || null;
}
