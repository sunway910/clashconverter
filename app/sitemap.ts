import { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo';

/**
 * Dynamic sitemap.xml generation
 * Includes all localized pages with proper hreflang support
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = seoConfig.siteUrl;
  const currentDate = new Date();
  const lastModified = new Date('2025-02-01');

  // Define all pages with their SEO metadata
  const pages = [
    {
      path: '',
      priority: 1.0,
      changeFrequency: 'daily' as const,
      lastModified
    },
    {
      path: '/about',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      lastModified
    },
    {
      path: '/resources',
      priority: 0.8,
      changeFrequency: 'weekly' as const,
      lastModified: currentDate
    },
    {
      path: '/privacy',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
      lastModified: currentDate
    },
    {
      path: '/terms',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
      lastModified: currentDate
    },
    {
      path: '/contact',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
      lastModified: currentDate
    }
  ];

  // Generate sitemap entries for each page
  // Each page has both English and Chinese versions as separate URL entries
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    // English version
    const enUrl = `${baseUrl}${page.path}`;
    entries.push({
      url: enUrl,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority
    });

    // Chinese version
    const zhUrl = `${baseUrl}/zh${page.path}`;
    entries.push({
      url: zhUrl,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority * 0.9
    });
  }

  return entries;
}
