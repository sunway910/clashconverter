/**
 * SEO Configuration and Utilities
 * Centralized SEO metadata for optimal search engine rankings
 */

import messagesEn from '../messages/en.json';
import messagesZh from '../messages/zh.json';

interface LocalizedFAQItem {
  q: string;
  a: string;
}

interface LocalizedStepItem {
  title: string;
  desc: string;
}

/** Subset of messages/*.json used to build structured data.
 *  Schemas are generated from these files so JSON-LD always matches
 *  the content users actually see on the page. */
interface LocalizedMessages {
  about: string;
  homeContent: {
    faq: { items: LocalizedFAQItem[] };
    steps: { title: string; items: LocalizedStepItem[] };
  };
  seoContent: { title: string; faq: { items: LocalizedFAQItem[] } };
  resources: { menuTitle: string };
  contactPage: { title: string };
  privacyPage: { title: string };
  termsPage: { title: string };
}

const localizedMessages: Record<string, LocalizedMessages> = {
  en: messagesEn as unknown as LocalizedMessages,
  zh: messagesZh as unknown as LocalizedMessages
};

export function getMessages(locale: string): LocalizedMessages {
  return localizedMessages[locale] || localizedMessages.en;
}

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  author: string;
  twitterHandle?: string;
  ogImage: string;
  ogImageAlt: string;
}

export const seoConfig: SEOConfig = {
  siteName: 'ClashConverter',
  siteUrl: 'https://clashconverter.com',
  defaultTitle: 'Clash Converter - Convert Proxy Links to Clash YAML',
  titleTemplate: '%s | ClashConverter',
  description: 'Free online proxy config converter. Convert SS, SSR, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, SOCKS5, WireGuard, AnyTLS & TUIC v5 links to Clash Meta (Mihomo), Clash Premium, Sing-Box, Surge 5, Surfboard, Loon & QuantumultX configs. Fast, secure, client-side conversion.',
  keywords: [
    // Core keywords
    'clash converter',
    'clash yaml converter',
    'proxy to clash',
    'vmess to clash',
    'trojan to clash',
    'ss to clash',
    'ssr to clash',
    'vless to clash',
    'hysteria to clash',
    'hysteria2 to clash',
    'clash meta converter',
    'mihomo converter',
    'clash premium converter',
    'loon converter',
    'loon conf converter',
    'loon config generator',
    'sing-box converter',
    'singbox converter',
    'proxy to sing-box',
    'vmess to sing-box',
    'vless to sing-box',
    'trojan to sing-box',
    'hysteria to sing-box',
    'hysteria2 to sing-box',
    'ss to loon',
    'ssr to loon',
    'vmess to loon',
    'trojan to loon',
    'loon config maker online',
    'proxy config converter',
    'clash config generator',
    'clash subscription converter',
    'convert proxy to yaml',
    'socks5 to clash',
    'http proxy to clash',
    'wireguard to clash',
    'anytls to clash',
    'tuic to clash',
    'tuic to sing-box',
    'tuic v5 converter',
    'surge config converter',
    'surge 5 converter',
    'quantumultx converter',
    'quantumultx conf converter',
    'surfboard converter',
    'surfboard config converter',
    // Long-tail keywords - User intent
    'how to convert proxy links to clash',
    'convert vmess to clash yaml online',
    'convert trojan to clash format',
    'convert vless to clash meta',
    'convert ss ssr to clash',
    'convert hysteria to clash yaml',
    'online proxy converter no upload',
    'free proxy to clash converter',
    'secure proxy conversion client-side',
    'clash config maker online',
    'singbox json generator online',
    'proxy to singbox converter',
    // Tool-specific keywords
    'clash verge config converter',
    'clash nyanpasu config converter',
    'shadowrocket config converter',
    'loon config converter',
    'loon conf converter',
    'loon proxy converter',
    'v2rayng to clash converter',
    'clash for android converter',
    'clash for ios converter',
    'loon for ios converter',
    // Problem-solving keywords
    'clash config not working',
    'proxy link to yaml converter',
    'subscription url to clash',
    'convert multiple proxy links to clash',
    'batch convert proxy to clash',
    'clash yaml editor online',
    // Platform-specific keywords
    'clash converter windows',
    'clash converter mac',
    'clash converter linux',
    'clash converter android',
    'clash converter ios',
    'proxy converter for pc',
    'proxy converter for mobile',
    // Privacy & security keywords
    'privacy focused proxy converter',
    'no upload proxy converter',
    'secure clash converter',
    'client-side proxy conversion',
    'browser-based proxy converter',
    // Comparison & guide keywords
    'clash meta vs clash premium',
    'mihomo vs clash premium',
    'singbox vs clash',
    'loon vs clash',
    'loon vs singbox',
    'loon vs shadowrocket',
    'best proxy converter tool',
    'free online proxy converter',
    'proxy configuration tutorial',
    'loon configuration guide',
    'loon proxy setup tutorial',
    // Location-based keywords
    'china proxy converter',
    'gfw proxy converter',
    'clash converter 中文',
    'clash 转换器',
    '代理转换器',
    // Format-specific keywords
    'yaml to proxy link converter',
    'proxy link to yaml converter',
    'json to clash converter',
    'clash to singbox converter',
    'singbox to clash converter',
    'clash to loon converter',
    'loon to clash converter',
    'convert to loon format',
    'loon conf generator'
  ],
  author: 'ClashConverter',
  twitterHandle: '@clashconverter',
  ogImage: '/og-image.png',
  ogImageAlt: 'ClashConverter - Free Online Proxy to Clash YAML Converter'
};

/**
 * Get localized metadata based on locale
 */
export function getLocalizedMetadata(locale: string) {
  const baseUrl = seoConfig.siteUrl;
  const localizedPath = locale === 'en' ? '' : `/${locale}`;
  const canonicalUrl = `${baseUrl}${localizedPath}`;

  const metadata = {
    en: {
      title: seoConfig.defaultTitle,
      description: seoConfig.description,
      canonical: canonicalUrl,
      locale: 'en_US',
      alternateLocale: 'zh_CN'
    },
    zh: {
      title: 'Clash转换器 - 代理链接转Clash/Sing-Box配置',
      description: '免费在线代理配置转换工具。支持将SS、SSR、VMess、VLESS、Trojan、Hysteria、Hysteria2、HTTP、SOCKS5、WireGuard、AnyTLS与TUIC v5链接转换为Clash Meta (Mihomo)、Clash Premium、Sing-Box、Surge 5、Surfboard、Loon与QuantumultX配置。快速、安全、纯前端转换。',
      canonical: canonicalUrl,
      locale: 'zh_CN',
      alternateLocale: 'en_US'
    }
  };

  return metadata[locale as keyof typeof metadata] || metadata.en;
}

/**
 * Generate structured data for SoftwareApplication
 */
export function generateSoftwareApplicationSchema(locale: string) {
  const metadata = getLocalizedMetadata(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: metadata.description,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    // Freshness signal for AI engines: bump when protocol/format support changes
    dateModified: '2026-10-15',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Convert SS, SSR, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, SOCKS5, WireGuard, AnyTLS and TUIC v5 links',
      'Convert proxy links to Clash Meta (Mihomo) YAML',
      'Convert proxy links to Clash Premium YAML',
      'Convert proxy links to Sing-Box JSON',
      'Convert proxy links to Surge 5 conf',
      'Convert proxy links to Surfboard conf',
      'Convert proxy links to Loon conf',
      'Convert proxy links to QuantumultX conf',
      'Convert Clash YAML back to shareable proxy links',
      'Convert subscription URLs (Clash YAML, base64 links, Sing-Box JSON)',
      'Client-side processing (no server upload)',
      'Privacy-focused conversion'
    ],
    browserRequirements: 'Requires JavaScript. Compatible with all modern browsers.',
    inLanguage: [
      {
        '@type': 'Language',
        name: 'English',
        alternateName: 'en'
      },
      {
        '@type': 'Language',
        name: 'Simplified Chinese',
        alternateName: 'zh'
      }
    ]
  };
}

/**
 * Generate FAQ structured data from the localized message files so the
 * markup always matches the FAQ content visibly rendered on the page.
 * - source 'home':  homeContent.faq.items (homepage accordion)
 * - source 'about': seoContent.faq.items  (about page accordion)
 */
export function generateFAQSchema(locale: string, source: 'home' | 'about' = 'home') {
  const messages = getMessages(locale);
  const items = source === 'about'
    ? messages.seoContent.faq.items
    : messages.homeContent.faq.items;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };
}

/**
 * Generate Breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/clash_converter_linear.svg`,
    description: seoConfig.description
  };
}

/**
 * Generate WebSite structured data (supports site-name display in search).
 * No SearchAction: the sitelinks search box was retired by Google in
 * November 2024 and this site has no /search endpoint.
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.description
  };
}

/**
 * Generate HowTo structured data from the localized 3-step guide that is
 * visibly rendered on the homepage (homeContent.steps).
 */
export function generateHowToSchema(locale: string) {
  const messages = getMessages(locale);
  const { title, items } = messages.homeContent.steps;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    image: `${seoConfig.siteUrl}/og-image.png`,
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    step: items.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.desc
    }))
  };
}

/**
 * Generate AboutPage structured data for the about page.
 * AboutPage (not ProfilePage) is the correct type for a page describing an
 * organization/product; the mainEntity is the Organization itself.
 */
export function generateAboutPageSchema(locale: string) {
  const localePath = locale === 'zh' ? '/zh' : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: getMessages(locale).seoContent.title,
    url: `${seoConfig.siteUrl}${localePath}/about`,
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
    mainEntity: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      logo: `${seoConfig.siteUrl}/clash_converter_linear.svg`,
      description: seoConfig.description
    }
  };
}

/**
 * Generate WebPage structured data for simple content pages
 * (contact, privacy, terms).
 */
export function generateWebPageSchema(locale: string, path: string, name: string) {
  const localePath = locale === 'zh' ? '/zh' : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url: `${seoConfig.siteUrl}${localePath}${path}`,
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en'
  };
}

/**
 * Generate CollectionPage structured data for resources/downloads pages
 */
export function generateCollectionPageSchema(locale: string) {
  const collectionData = {
    en: {
      name: 'Clash & Sing-Box Resources - Proxy Clients and Installation Guides',
      description: 'Download proxy clients (Clash Verge, Clash Nyanpasu, Sing-Box, Shadowrocket, V2RayNG) and installation scripts for setting up your proxy system.'
    },
    zh: {
      name: 'Clash & Sing-Box资源 - 代理客户端和安装指南',
      description: '下载代理客户端（Clash Verge、Clash Nyanpasu、Sing-Box、Shadowrocket、V2RayNG）和安装脚本，用于设置您的代理系统。'
    }
  };

  const data = collectionData[locale as keyof typeof collectionData] || collectionData.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.name,
    description: data.description,
    url: `${seoConfig.siteUrl}${locale === 'zh' ? '/zh' : ''}/resources`,
    about: [
      {
        '@type': 'SoftwareApplication',
        name: 'Clash Verge Rev',
        applicationCategory: 'NetworkApplication',
        operatingSystem: 'Windows, macOS, Linux'
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Sing-Box',
        applicationCategory: 'NetworkApplication',
        operatingSystem: 'Android, iOS, Windows, macOS, Linux'
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Shadowrocket',
        applicationCategory: 'NetworkApplication',
        operatingSystem: 'iOS'
      },
      {
        '@type': 'SoftwareApplication',
        name: 'V2RayNG',
        applicationCategory: 'NetworkApplication',
        operatingSystem: 'Android'
      }
    ]
  };
}
