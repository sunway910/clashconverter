/**
 * SEO Configuration and Utilities
 * Centralized SEO metadata for optimal search engine rankings
 */

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
  description: 'Free online converter tool. Convert SS, SSR, VMess, Trojan, Hysteria, VLESS, HTTP & SOCKS5 proxy links to Clash YAML or Sing-Box JSON format. Support for Clash Meta (Mihomo), Clash Premium, and Sing-Box. Fast, secure, client-side conversion.',
  keywords: [
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
    'sing-box converter',
    'singbox converter',
    'proxy to sing-box',
    'vmess to sing-box',
    'vless to sing-box',
    'trojan to sing-box',
    'hysteria to sing-box',
    'hysteria2 to sing-box',
    'sing-box config generator',
    'proxy config converter',
    'clash config generator',
    'clash subscription converter',
    'convert proxy to yaml',
    'socks5 to clash',
    'http proxy to clash'
  ],
  author: 'ClashConverter',
  twitterHandle: '@clashconverter',
  ogImage: '/og-image.png',
  ogImageAlt: 'ClashConverter - Free Online Proxy to Clash YAML Converter'
};

/**
 * Generate full title with template
 */
export function generateTitle(title: string): string {
  return seoConfig.titleTemplate.replace('%s', title);
}

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
      description: '免费在线转换工具。支持将SS、SSR、VMess、Trojan、Hysteria、VLESS、HTTP和SOCKS5代理链接转换为Clash YAML或Sing-Box JSON格式。支持Clash Meta (Mihomo)、Clash Premium和Sing-Box。快速、安全、纯前端转换。',
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
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Convert SS links to Clash YAML',
      'Convert SSR links to Clash YAML',
      'Convert VMess links to Clash YAML',
      'Convert Trojan links to Clash YAML',
      'Convert VLESS links to Clash YAML',
      'Convert Hysteria links to Clash YAML',
      'Convert Hysteria2 links to Clash YAML',
      'Convert HTTP proxy to Clash YAML',
      'Convert SOCKS5 proxy to Clash YAML',
      'Convert proxy links to Sing-Box JSON',
      'Convert Clash YAML to proxy links',
      'Support for Clash Meta (Mihomo)',
      'Support for Clash Premium',
      'Support for Sing-Box',
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
 * Generate FAQ structured data
 */
export function generateFAQSchema(locale: string) {
  const faqs = {
    en: [
      {
        question: 'What is Clash Converter?',
        answer: 'Clash Converter is a free online tool that converts various proxy protocols (SS, SSR, VMess, Trojan, Hysteria, VLESS, HTTP, SOCKS5) into Clash YAML configuration format. It supports both Clash Meta (Mihomo) and Clash Premium kernels.'
      },
      {
        question: 'Is Clash Converter safe to use?',
        answer: 'Yes, Clash Converter is completely safe and privacy-focused. All conversion happens client-side in your browser. Your proxy configurations are never uploaded to any server, ensuring complete privacy and security.'
      },
      {
        question: 'Which proxy protocols are supported?',
        answer: 'Clash Converter supports 9 proxy protocols: Shadowsocks (SS), ShadowsocksR (SSR), VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, and SOCKS5. It can convert both to and from Clash YAML format.'
      },
      {
        question: 'What is the difference between Clash Meta and Clash Premium?',
        answer: 'Clash Meta (Mihomo) is the actively maintained version that supports all modern protocols including VLESS, Hysteria, and Hysteria2. Clash Premium is the original kernel that is no longer maintained and does not support these newer protocols.'
      },
      {
        question: 'How do I convert proxy links to Clash format?',
        answer: 'Simply paste your proxy links (one per line) into the input box. Each link should be in the format like ss://base64#name, vmess://base64#name, etc. Click "Convert" and the Clash YAML configuration will be generated instantly.'
      },
      {
        question: 'Can I convert Clash YAML back to proxy links?',
        answer: 'Yes! Click the "Swap Direction" button to switch from "Proxies to YAML" mode to "YAML to Proxies" mode. Paste your Clash YAML config and the tool will extract and convert all proxy nodes back to shareable links.'
      },
      {
        question: 'What is Sing-Box and does this tool support it?',
        answer: 'Sing-Box is a universal proxy platform that supports multiple protocols. Clash Converter now supports converting proxy links to Sing-Box JSON configuration format. It supports SS, VMess, VLESS, Trojan, Hysteria, Hysteria2, and HTTP protocols for Sing-Box output.'
      }
    ],
    zh: [
      {
        question: '什么是Clash转换器？',
        answer: 'Clash转换器是一个免费的在线工具，可以将各种代理协议（SS、SSR、VMess、Trojan、Hysteria、VLESS、HTTP、SOCKS5）转换为Clash YAML配置格式。支持Clash Meta (Mihomo) 和 Clash Premium内核。'
      },
      {
        question: 'Clash转换器安全吗？',
        answer: '是的，Clash转换器完全安全且注重隐私。所有转换都在您的浏览器客户端进行。您的代理配置永远不会上传到任何服务器，确保完全的隐私和安全。'
      },
      {
        question: '支持哪些代理协议？',
        answer: 'Clash转换器支持9种代理协议：Shadowsocks (SS)、ShadowsocksR (SSR)、VMess、VLESS、Trojan、Hysteria、Hysteria2、HTTP和SOCKS5。可以双向转换到和从Clash YAML格式。'
      },
      {
        question: 'Clash Meta和Clash Premium有什么区别？',
        answer: 'Clash Meta (Mihomo) 是积极维护的版本，支持所有现代协议，包括VLESS、Hysteria和Hysteria2。Clash Premium是原始内核，不再维护，不支持这些新协议。'
      },
      {
        question: '如何将代理链接转换为Clash格式？',
        answer: '只需将您的代理链接（每行一个）粘贴到输入框中。每个链接应采用ss://base64#name、vmess://base64#name等格式。点击"转换"按钮，Clash YAML配置将立即生成。'
      },
      {
        question: '我可以将Clash YAML转换回代理链接吗？',
        answer: '可以！点击"切换方向"按钮，从"代理转YAML"模式切换到"YAML转代理"模式。粘贴您的Clash YAML配置，工具将提取所有代理节点并转换回可分享的链接。'
      },
      {
        question: '什么是Sing-Box，这个工具支持吗？',
        answer: 'Sing-Box是一个支持多种协议的通用代理平台。Clash转换器现在支持将代理链接转换为Sing-Box JSON配置格式。支持SS、VMess、VLESS、Trojan、Hysteria、Hysteria2和HTTP协议输出为Sing-Box格式。'
      }
    ]
  };

  const localeFAQs = faqs[locale as keyof typeof faqs] || faqs.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: localeFAQs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
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
    description: seoConfig.description,
    sameAs: []
  };
}

/**
 * Generate WebSite structured data for search box
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`
      },
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string'
      }
    }
  };
}
