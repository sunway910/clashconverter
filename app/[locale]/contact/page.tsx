import { ContactContent } from '@/components/legal/contact-content';
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
  const localizedPath = isZh ? '/zh/contact' : '/contact';
  const canonicalUrl = `${seoConfig.siteUrl}${localizedPath}`;

  const metadata = {
    en: {
      title: 'Contact Us | ClashConverter - Free Proxy Config Converter',
      description:
        'Contact the ClashConverter team: email for privacy requests and abuse reports, GitHub Issues for bug reports, protocol support requests, and feature ideas.',
      keywords: [
        'contact clash converter',
        'clash converter support',
        'proxy converter contact',
        'report bug clash converter'
      ]
    },
    zh: {
      title: '联系我们 | Clash转换器 - 免费代理配置转换工具',
      description:
        '联系 ClashConverter 团队：隐私请求与滥用举报请发邮件，缺陷报告、协议支持请求与功能建议请提交 GitHub Issues。',
      keywords: [
        '联系clash转换器',
        'clash转换器支持',
        '代理转换器联系方式'
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
        'en': `${seoConfig.siteUrl}/contact`,
        'zh': `${seoConfig.siteUrl}/zh/contact`
      }
    }
  };
}

export default function ContactPage() {
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
      <ContactContent />
    </div>
  );
}
