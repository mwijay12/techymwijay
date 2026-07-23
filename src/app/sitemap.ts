import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL
  ?? 'https://mwijaytech.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/',         priority: 1.0,  changeFrequency: 'weekly'  as const },
    { path: '/ai-stt',   priority: 0.9,  changeFrequency: 'monthly' as const },
    { path: '/ai-tts',   priority: 0.9,  changeFrequency: 'monthly' as const },
    { path: '/blog',     priority: 0.8,  changeFrequency: 'daily'   as const },
    { path: '/meeting',  priority: 0.8,  changeFrequency: 'monthly' as const },
    { path: '/spending', priority: 0.7,  changeFrequency: 'daily'   as const },
    { path: '/todos',    priority: 0.7,  changeFrequency: 'daily'   as const },
    { path: '/memory',   priority: 0.6,  changeFrequency: 'weekly'  as const },
    { path: '/contact',  priority: 0.5,  changeFrequency: 'monthly' as const },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
