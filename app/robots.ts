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
          '/images/adventures/',
          '/images/destinations/',
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
    sitemap: 'https://blueone-yacht.com/sitemap.xml',
    host: 'https://blueone-yacht.com',
  }
}
