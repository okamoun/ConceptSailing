import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://www.blueoneyacht.com/sitemap.xml',
    host: 'https://www.blueoneyacht.com',
  }
}
