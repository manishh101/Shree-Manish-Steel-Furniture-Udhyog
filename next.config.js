/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // Only Cloudinary is used for product images - no external placeholder sites
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance Optimizations
  experimental: {
    optimizeCss: true,
  },
  
  // Compression
  compress: true,
  
  // Power optimization for production
  poweredByHeader: false,
  
  // Generate ETags for caching
  generateEtags: true,
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO - www to non-www
  // NOTE: Make sure Vercel Dashboard has manishsteel.com.np as PRIMARY domain
  // and www.manishsteel.com.np redirects TO the primary (not the other way around)
  async redirects() {
    return [
      // Redirect www to non-www (canonical URL)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.manishsteel.com.np' }],
        destination: 'https://manishsteel.com.np/:path*',
        permanent: true,
      },
      // Redirect malformed product URLs (products.id -> products/id)
      // This handles old indexed URLs or external links with wrong format
      {
        source: '/products\\.:productId',
        destination: '/products/:productId',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
