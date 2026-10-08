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
  const localizedPath = isZh ? '/zh/privacy' : '/privacy';
  const canonicalUrl = `${seoConfig.siteUrl}${localizedPath}`;

  const metadata = {
    en: {
      title: 'Privacy Policy | ClashConverter - Your Config Data Never Leaves Your Browser',
      description:
        'How ClashConverter handles information: client-side conversion means your proxy links and configs are never uploaded. Read our policy on cookies, Google AdSense advertising, and Google Analytics.',
      keywords: [
        'clash converter privacy policy',
        'proxy converter privacy',
        'client-side converter data',
        'no upload proxy tool',
        'clash converter cookies'
      ]
    },
    zh: {
      title: '隐私政策 | Clash转换器 - 配置数据永不上传',
      description:
        'ClashConverter 如何处理信息：纯客户端转换，你的代理链接和配置文件从不上传。了解本站关于 Cookie、Google AdSense 广告和 Google Analytics 的隐私政策。',
      keywords: [
        'clash转换器隐私政策',
        '代理转换器隐私',
        '客户端转换数据',
        '不上传代理工具',
        'clash转换器cookie'
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
        'en': `${seoConfig.siteUrl}/privacy`,
        'zh': `${seoConfig.siteUrl}/zh/privacy`
      }
    }
  };
}

export default function PrivacyPage() {
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
      <LegalContent namespace="privacyPage" />
    </div>
  );
}
