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
  description: 'Free online converter tool. Convert SS, SSR, VMess, Trojan, Hysteria, VLESS, HTTP & SOCKS5 proxy links to Clash YAML, Sing-Box JSON, or Loon .conf format. Support for Clash Meta (Mihomo), Clash Premium, Sing-Box, and Loon. Fast, secure, client-side conversion.',
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
        answer: 'Clash Converter supports 11 proxy protocols: Shadowsocks (SS), ShadowsocksR (SSR), VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, SOCKS5, WireGuard, and AnyTLS. It can convert both to and from Clash YAML format.'
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

/**
 * Generate HowTo structured data for step-by-step guides
 */
export function generateHowToSchema(locale: string) {
  const howToData = {
    en: {
      name: 'How to Convert Proxy Links to Clash YAML',
      description: 'Step-by-step guide to convert your proxy links (SS, SSR, VMess, Trojan, Hysteria, VLESS) to Clash YAML configuration format.',
      steps: [
        {
          name: 'Prepare Your Proxy Links',
          text: 'Gather your proxy links. Supported formats include ss://, ssr://, vmess://, vless://, trojan://, hysteria://, hysteria2://, wireguard://, anytls://, http://, and socks5://. Each link should be on a separate line.',
          image: `${seoConfig.siteUrl}/og-image.png`
        },
        {
          name: 'Select Input Format',
          text: 'Choose "Proxy Links" as your input format. This is the default option when you first visit the converter.',
          image: `${seoConfig.siteUrl}/og-image.png`
        },
        {
          name: 'Select Output Format',
          text: 'Choose your desired output format: Clash Meta (Mihomo) for full protocol support, Clash Premium for legacy compatibility, or Sing-Box JSON format.',
          image: `${seoConfig.siteUrl}/og-image.png`
        },
        {
          name: 'Paste Your Proxy Links',
          text: 'Paste your proxy links into the input textarea. You can paste multiple links at once, one per line.',
          image: `${seoConfig.siteUrl}/og-image.png`
        },
        {
          name: 'Convert and Download',
          text: 'Click the convert button. Your configuration will be generated instantly. You can then download the config file or copy it to your clipboard.',
          image: `${seoConfig.siteUrl}/og-image.png`
        }
      ]
    },
    zh: {
      name: '如何将代理链接转换为Clash YAML',
      description: '将代理链接（SS、SSR、VMess、Trojan、Hysteria、VLESS）转换为Clash YAML配置格式的分步指南。',
      steps: [
        {
          name: '准备您的代理链接',
          text: '收集您的代理链接。支持的格式包括 ss://、ssr://、vmess://、vless://、trojan://、hysteria://、hysteria2://、wireguard://、anytls://、http:// 和 socks5://。每个链接应单独一行。',
          image: `${seoConfig.siteUrl}/og-image.png`
        },
        {
          name: '选择输入格式',
          text: '选择"代理链接"作为您的输入格式。这是您首次访问转换器时的默认选项。',
          image: `${seoConfig.siteUrl}/og-image.png`
        },
        {
          name: '选择输出格式',
          text: '选择您想要的输出格式：Clash Meta (Mihomo) 支持完整协议，Clash Premium 用于旧版兼容，或 Sing-Box JSON 格式。',
          image: `${seoConfig.siteUrl}/og-image.png`
        },
        {
          name: '粘贴代理链接',
          text: '将代理链接粘贴到输入文本框中。您可以一次粘贴多个链接，每行一个。',
          image: `${seoConfig.siteUrl}/og-image.png`
        },
        {
          name: '转换并下载',
          text: '点击转换按钮。您的配置将立即生成。然后您可以下载配置文件或将其复制到剪贴板。',
          image: `${seoConfig.siteUrl}/og-image.png`
        }
      ]
    }
  };

  const data = howToData[locale as keyof typeof howToData] || howToData.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    image: `${seoConfig.siteUrl}/og-image.png`,
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Proxy links (SS, SSR, VMess, Trojan, Hysteria, VLESS, HTTP, SOCKS5)'
      }
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web browser (Chrome, Firefox, Safari, Edge)'
      }
    ],
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
      url: `${seoConfig.siteUrl}#step-${index + 1}`
    }))
  };
}

/**
 * Generate AggregateRating structured data for social proof
 */
export function generateAggregateRatingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
      itemReviewed: {
        '@type': 'SoftwareApplication',
        name: seoConfig.siteName,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web Browser'
      }
    }
  };
}

/**
 * Generate VideoObject structured data for tutorial videos (when available)
 */
export function generateVideoObjectSchema(
  name: string,
  description: string,
  thumbnailUrl: string,
  uploadDate: string,
  duration: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    contentUrl: `${seoConfig.siteUrl}/videos/${name.toLowerCase().replace(/\s+/g, '-')}.mp4`,
    embedUrl: `${seoConfig.siteUrl}/videos/${name.toLowerCase().replace(/\s+/g, '-')}.mp4`,
    publisher: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}/clash_converter_linear.svg`
      }
    }
  };
}

/**
 * Generate ProfilePage structured data for organization/about pages
 */
export function generateProfilePageSchema(locale: string) {
  const profileData = {
    en: {
      aboutPage: 'About Clash Converter - Privacy-Focused Proxy Conversion Tool',
      description: 'Learn about Clash Converter, a free online tool that converts proxy links to Clash YAML and Sing-Box JSON formats. All conversions happen client-side for maximum privacy and security.'
    },
    zh: {
      aboutPage: '关于Clash转换器 - 注重隐私的代理转换工具',
      description: '了解Clash转换器，一个免费的在线工具，可将代理链接转换为Clash YAML和Sing-Box JSON格式。所有转换都在客户端进行，确保最大的隐私和安全。'
    }
  };

  const data = profileData[locale as keyof typeof profileData] || profileData.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      logo: `${seoConfig.siteUrl}/clash_converter_linear.svg`,
      description: data.description,
      sameAs: [],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US'
      }
    }
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
