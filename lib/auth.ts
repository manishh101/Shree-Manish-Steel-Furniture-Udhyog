import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'manishsteelsecret';

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
