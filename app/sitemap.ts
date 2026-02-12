import type { MetadataRoute } from 'next';
import { getTemplates } from '@/lib/meme-templates';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dankdrafts.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Dynamic template pages
  try {
    const templates = await getTemplates();
    const templatePages: MetadataRoute.Sitemap = templates.map((template) => ({
      url: `${baseUrl}/editor/${template.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...templatePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
