/**
 * SEO Head Component
 * Generates all necessary meta tags for optimal search engine optimization
 */

import { Metadata } from 'next';
import { seoConfig, getLocalizedMetadata, generateSoftwareApplicationSchema, generateFAQSchema, generateBreadcrumbSchema, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

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
  const localizedPath = locale === 'en' ? '' : `/${locale}`;
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
 */
export function JSONLDStructuredData({
  locale,
  type = 'all'
}: {
  locale: string;
  type?: 'all' | 'software' | 'faq' | 'breadcrumb' | 'organization' | 'website';
}) {
  const schemas: Record<string, Record<string, unknown>> = {
    software: generateSoftwareApplicationSchema(locale),
    faq: generateFAQSchema(locale),
    breadcrumb: generateBreadcrumbSchema([
      { name: 'Home', url: seoConfig.siteUrl },
      { name: 'Clash Converter', url: `${seoConfig.siteUrl}${locale === 'en' ? '' : `/${locale}`}` }
    ]),
    organization: generateOrganizationSchema(),
    website: generateWebSiteSchema()
  };

  const schemasToInclude = type === 'all' ? Object.keys(schemas) : [type];

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
 * Generate hreflang links for multilingual SEO
 */
export function HreflangLinks({ locale }: { locale: string }) {
  const baseUrl = seoConfig.siteUrl;

  const locales = [
    { code: 'en', path: '' },
    { code: 'zh', path: '/zh' }
  ];

  return (
    <>
      {locales.map((loc) => (
        <link
          key={loc.code}
          rel="alternate"
          hrefLang={loc.code === 'en' ? 'x-default' : loc.code}
          href={`${baseUrl}${loc.path}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={baseUrl}
      />
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

/**
 * DNS Prefetch for performance
 */
export function DNSPrefetch() {
  const domains = [
    'www.google-analytics.com',
    'pagead2.googlesyndication.com',
    'www.googletagmanager.com'
  ];

  return (
    <>
      {domains.map((domain) => (
        <link
          key={domain}
          rel="dns-prefetch"
          href={`https://${domain}`}
        />
      ))}
    </>
  );
}
