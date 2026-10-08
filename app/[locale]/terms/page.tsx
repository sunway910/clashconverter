import { LegalContent } from '@/components/legal/legal-content';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
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
  const localizedPath = isZh ? '/zh/terms' : '/terms';
  const canonicalUrl = `${seoConfig.siteUrl}${localizedPath}`;

  const metadata = {
    en: {
      title: 'Terms of Service | ClashConverter - Free Proxy Config Converter',
      description:
        'Terms of Service for ClashConverter: acceptable use, no warranty, limitation of liability, third-party links, and intellectual property for the free online proxy link to Clash/Sing-Box converter.',
      keywords: [
        'clash converter terms',
        'terms of service proxy converter',
        'clash converter acceptable use'
      ]
    },
    zh: {
      title: '服务条款 | Clash转换器 - 免费代理配置转换工具',
      description:
        'ClashConverter 服务条款：合理使用、免责声明、责任限制、第三方链接与知识产权。免费在线代理链接转 Clash/Sing-Box 配置工具。',
      keywords: [
        'clash转换器条款',
        '代理转换器服务条款',
        'clash转换器使用条款'
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
        'en': `${seoConfig.siteUrl}/terms`,
        'zh': `${seoConfig.siteUrl}/zh/terms`
      }
    }
  };
}

export default function TermsPage() {
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
      <LegalContent namespace="termsPage" />
    </div>
  );
}
