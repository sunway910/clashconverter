import { AboutContent } from '@/components/about/about-content';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { JSONLDStructuredData } from '@/components/seo/seo-head';
import { seoConfig } from '@/lib/seo';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const localizedPath = isZh ? '/zh/about' : '/about';
  const canonicalUrl = `${seoConfig.siteUrl}${localizedPath}`;

  const metadata = {
    en: {
      title: 'About Clash Converter | Free Proxy to Clash YAML Converter Tool',
      description: 'Learn about Clash Converter - a free, secure, and privacy-focused online tool for converting proxy links (SS, SSR, VMess, Trojan, Hysteria, VLESS) to Clash YAML, Sing-Box, Loon, QuantumultX, and Surfboard formats. All conversions happen client-side with no server upload.',
      keywords: [
        'about clash converter',
        'clash converter privacy',
        'secure proxy converter',
        'client-side proxy conversion',
        'free proxy converter',
        'no upload converter',
        'privacy focused converter',
        'clash yaml converter',
        'singbox json converter',
        'loon converter',
        'quantumultx converter',
        'surfboard converter',
        'proxy link converter',
        'vmess converter',
        'trojan converter',
        'vless converter',
        'hysteria converter',
        'ss ssr converter',
        'clash meta converter',
        'mihomo converter'
      ]
    },
    zh: {
      title: '关于Clash转换器 | 免费代理转Clash/Sing-Box/Loon/QuantumultX/Surfboard配置工具',
      description: '了解Clash转换器 - 一个免费、安全且注重隐私的在线工具，可将代理链接（SS、SSR、VMess、Trojan、Hysteria、VLESS）转换为Clash YAML、Sing-Box、Loon、QuantumultX、Surfboard格式。所有转换都在客户端进行，无需上传到服务器。',
      keywords: [
        '关于clash转换器',
        'clash转换器隐私',
        '安全代理转换器',
        '客户端代理转换',
        '免费代理转换器',
        '无上传转换器',
        '隐私保护转换器',
        'clash yaml转换器',
        'singbox json转换器',
        'loon转换器',
        'quantumultx转换器',
        'surfboard转换器',
        '代理链接转换器',
        'vmess转换器',
        'trojan转换器',
        'vless转换器',
        'hysteria转换器',
        'ss ssr转换器',
        'clash meta转换器',
        'mihomo转换器'
      ]
    }
  };

  const meta = metadata[locale as keyof typeof metadata] || metadata.en;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: seoConfig.author }],
    creator: seoConfig.author,
    publisher: seoConfig.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    openGraph: {
      type: 'website',
      locale: isZh ? 'zh_CN' : 'en_US',
      url: canonicalUrl,
      title: meta.title,
      description: meta.description,
      siteName: seoConfig.siteName,
      images: [
        {
          url: seoConfig.ogImage,
          width: 1200,
          height: 630,
          alt: seoConfig.ogImageAlt
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [seoConfig.ogImage],
      creator: seoConfig.twitterHandle
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${seoConfig.siteUrl}/about`,
        'zh': `${seoConfig.siteUrl}/zh/about`
      }
    }
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur supports-[backdrop-filter]:bg-stone-50/60 dark:border-stone-800 dark:bg-stone-950/80 dark:supports-[backdrop-filter]:bg-stone-950/60">
        <div className="mx-auto flex h-14 items-center justify-between px-4 md:px-8 lg:max-w-6xl">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/clash_converter_linear.svg" alt="ClashConverter" width={180} height={60} />
          </Link>
          <div className="flex items-center gap-1 md:gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <AboutContent />
      <JSONLDStructuredData locale={locale} type="all" pageType="about" />
    </div>
  );
}
