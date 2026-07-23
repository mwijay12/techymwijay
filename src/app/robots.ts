import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL
  ?? 'https://mwijaytech.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ai-stt', '/ai-tts', '/meeting', '/contact'],
        disallow: [
          '/blog',
          '/spending',
          '/todos',
          '/memory',
          '/settings',
          '/signin',
          '/health',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
