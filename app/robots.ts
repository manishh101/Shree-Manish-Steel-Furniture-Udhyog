import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://manishsteel.com.np';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/_next', '/static'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/admin'],
      },
      {
        // TikTok's web crawler - allow full access for better TikTok SEO
        userAgent: 'Bytespider',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      {
        // Facebook/Instagram crawler
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`,
    ],
  };
}
