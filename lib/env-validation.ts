/**
 * Environment Variable Validation
 * Ensures all required environment variables are set at build/runtime
 * This module throws errors if required env vars are missing
 */

export interface EnvConfig {
  // JWT Configuration
  JWT_SECRET: string;

  // API Configuration
  NEXT_PUBLIC_API_URL: string;

  // Database Configuration
  MONGODB_URI: string;

  // Cloudinary Configuration
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  NEXT_PUBLIC_CLOUDINARY_API_KEY: string;
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: string;
  NEXT_PUBLIC_CLOUDINARY_FOLDER?: string;
  CLOUDINARY_API_SECRET?: string;

  // Notification Configuration
  TEXTMEBOT_API_KEY?: string;
  TEXTMEBOT_NOTIFICATION_PHONE?: string;

  // Node Environment
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validate environment variables
 * Call this at application startup (in middleware or layout)
 */
export function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'JWT_SECRET',
    'NEXT_PUBLIC_API_URL',
    'MONGODB_URI',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_CLOUDINARY_API_KEY',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
  ];

  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nPlease check your .env.local file.`;
    console.error(message);
    throw new Error(message);
  }

  return {
    JWT_SECRET: process.env.JWT_SECRET!,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!,
    MONGODB_URI: process.env.MONGODB_URI!,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    NEXT_PUBLIC_CLOUDINARY_FOLDER: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    TEXTMEBOT_API_KEY: process.env.TEXTMEBOT_API_KEY,
    TEXTMEBOT_NOTIFICATION_PHONE: process.env.TEXTMEBOT_NOTIFICATION_PHONE,
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'production'
  };
}

/**
 * Validate environment variables at server startup
 * This ensures all required env vars are present before the app runs
 */
export function validateServerEnv(): void {
  if (typeof window !== 'undefined') {
    // Don't validate in browser
    return;
  }

  try {
    validateEnv();
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Environment validation failed:', error.message);
    }
    process.exit(1);
  }
}
