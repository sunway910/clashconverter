import { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo';

/**
 * Dynamic sitemap.xml generation
 * Includes all localized pages and proper SEO metadata
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = seoConfig.siteUrl;
  const currentDate = new Date();
  const lastModified = new Date('2025-01-01'); // Last significant content update

  // Define all supported locales
  const locales = [
    {
      code: 'en',
      path: '',
      priority: 1,
      changeFrequency: 'daily' as const
    },
    {
      code: 'zh',
      path: '/zh',
      priority: 0.9,
      changeFrequency: 'daily' as const
    }
  ];

  // Generate sitemap entries for each locale
  const localeEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}${locale.path}`,
    lastModifiedDate: lastModified,
    changeFrequency: locale.changeFrequency,
    priority: locale.priority,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l.code, `${baseUrl}${l.path}`])
      ),
    },
  }));

  return [
    ...localeEntries,
    // Add any additional pages here as needed
    // Example:
    // {
    //   url: `${baseUrl}/about`,
    //   lastModifiedDate: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
  ];
}
