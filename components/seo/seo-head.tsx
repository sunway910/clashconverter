/**
 * SEO Head Component
 * Generates all necessary meta tags for optimal search engine optimization
 */

import { Metadata } from 'next';
import {
  seoConfig,
  getLocalizedMetadata,
  generateSoftwareApplicationSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateHowToSchema,
  generateAboutPageSchema,
  generateWebPageSchema,
  generateCollectionPageSchema,
  getMessages
} from '@/lib/seo';

export interface SEOHeadProps {
  locale: string;
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
}

/**
 * Generate complete metadata object for Next.js
 */
export function generateMetadata({
  locale,
  title,
  description,
  image,
  noindex,
  canonical
}: SEOHeadProps): Metadata {
  const baseUrl = seoConfig.siteUrl;
  const localizedMetadata = getLocalizedMetadata(locale);
  const canonicalUrl = canonical || localizedMetadata.canonical;
  const ogImage = image ? `${baseUrl}${image}` : `${baseUrl}${seoConfig.ogImage}`;

  const pageTitle = title || localizedMetadata.title;
  const pageDescription = description || localizedMetadata.description;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: seoConfig.keywords.join(', '),
    authors: [{ name: seoConfig.author }],
    creator: seoConfig.author,
    publisher: seoConfig.siteName,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': locale === 'en' ? canonicalUrl : `${baseUrl}`,
        'zh': locale === 'zh' ? canonicalUrl : `${baseUrl}/zh`,
        'x-default': `${baseUrl}`
      }
    },

    // Open Graph / Facebook
    openGraph: {
      type: 'website',
      locale: localizedMetadata.locale,
      alternateLocale: localizedMetadata.alternateLocale,
      url: canonicalUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: seoConfig.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seoConfig.ogImageAlt
        }
      ]
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
      creator: seoConfig.twitterHandle,
      site: seoConfig.twitterHandle
    },

    // Robots
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },

    // Verification
    verification: {
      // Add your verification codes here
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },

    // Additional meta tags
    other: {
      'application-name': seoConfig.siteName,
      'apple-mobile-web-app-title': seoConfig.siteName,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'mobile-web-app-capable': 'yes',
      'theme-color': '#1c1917',
      'msapplication-TileColor': '#1c1917'
    }
  };
}

/**
 * JSON-LD Structured Data Component
 *
 * Every schema is derived from the localized message files so the markup
 * always matches the content visibly rendered on each page.
 */
export type SEOPageType = 'home' | 'about' | 'resources' | 'contact' | 'privacy' | 'terms';

export function JSONLDStructuredData({
  locale,
  type = 'all',
  pageType = 'home',
  customBreadcrumbs
}: {
  locale: string;
  type?: 'all' | 'software' | 'faq' | 'faqAbout' | 'breadcrumb' | 'organization' | 'website' | 'howto' | 'about' | 'webpage' | 'collection';
  pageType?: SEOPageType;
  customBreadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const localePath = locale === 'zh' ? '/zh' : '';
  const messages = getMessages(locale);

  const pageLabels: Record<SEOPageType, { name: string; path: string }> = {
    home: { name: seoConfig.siteName, path: '' },
    about: { name: messages.about, path: '/about' },
    resources: { name: messages.resources.menuTitle, path: '/resources' },
    contact: { name: messages.contactPage.title, path: '/contact' },
    privacy: { name: messages.privacyPage.title, path: '/privacy' },
    terms: { name: messages.termsPage.title, path: '/terms' }
  };

  const page = pageLabels[pageType];
  const breadcrumbs = customBreadcrumbs || [
    { name: seoConfig.siteName, url: seoConfig.siteUrl },
    { name: page.name, url: `${seoConfig.siteUrl}${localePath}${page.path}` }
  ];

  const schemas: Record<string, Record<string, unknown>> = {
    software: generateSoftwareApplicationSchema(locale),
    faq: generateFAQSchema(locale, 'home'),
    faqAbout: generateFAQSchema(locale, 'about'),
    breadcrumb: generateBreadcrumbSchema(breadcrumbs),
    organization: generateOrganizationSchema(),
    website: generateWebSiteSchema(),
    howto: generateHowToSchema(locale),
    about: generateAboutPageSchema(locale),
    webpage: generateWebPageSchema(locale, page.path, page.name),
    collection: generateCollectionPageSchema(locale)
  };

  // Select schemas based on page type
  const schemasByPage: Record<SEOPageType, string[]> = {
    home: ['software', 'faq', 'organization', 'website', 'howto'],
    about: ['about', 'faqAbout', 'breadcrumb'],
    resources: ['collection', 'breadcrumb'],
    contact: ['webpage', 'breadcrumb'],
    privacy: ['webpage', 'breadcrumb'],
    terms: ['webpage', 'breadcrumb']
  };

  const schemasToInclude = type === 'all'
    ? (schemasByPage[pageType] || Object.keys(schemas))
    : [type];

  return (
    <>
      {schemasToInclude.map((schemaType) => (
        <script
          key={schemaType}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemas[schemaType])
          }}
        />
      ))}
    </>
  );
}

/**
 * Preconnect to external domains for performance
 */
export function PerformancePreconnects() {
  const domains = [
    'https://www.google-analytics.com',
    'https://pagead2.googlesyndication.com'
  ];

  return (
    <>
      {domains.map((domain) => (
        <link
          key={domain}
          rel="preconnect"
          href={domain}
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}
