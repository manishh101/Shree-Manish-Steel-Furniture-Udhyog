import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// JWT_SECRET must be provided via environment variables
// Never use hardcoded defaults in production
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET environment variable is required. Please set it in your .env.local file.'
  );
}

const JWT_SECRET: string = jwtSecret;

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
    const verified = jwt.verify(token, JWT_SECRET);

    if (typeof verified === 'string' || !verified || typeof verified !== 'object' || !('user' in verified)) {
      return null;
    }

    return verified as JWTPayload;
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
