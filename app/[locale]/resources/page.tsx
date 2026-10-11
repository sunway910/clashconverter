import { ResourcesContent } from '@/components/resources/resources-content';
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
  const localizedPath = isZh ? '/zh/resources' : '/resources';
  const canonicalUrl = `${seoConfig.siteUrl}${localizedPath}`;

  const metadata = {
    en: {
      title: 'Clash & Sing-Box Resources | Proxy Clients & Installation Guides',
      description: 'Download proxy clients (Clash Verge, Clash Nyanpasu, Sing-Box, Shadowrocket, V2RayNG) and installation scripts. Complete resources for setting up your proxy system with Clash and Sing-Box.',
      keywords: [
        'clash client download',
        'clash verge download',
        'clash nyanpasu download',
        'clash meta download',
        'mihomo download',
        'singbox download',
        'shadowrocket download',
        'v2rayng download',
        'proxy client download',
        'clash premium download',
        'clash for windows',
        'clash for android',
        'clash for ios',
        'clash for mac',
        'clash for linux',
        'singbox client',
        'proxy installation script',
        'v2ray installation',
        'xray installation',
        'marzban panel',
        'v2ray wss',
        'proxy server setup',
        'clash config tutorial',
        'singbox config tutorial',
        'proxy tool download',
        'gfw detection tool',
        'port checker',
        'tcp ping',
        'ip connectivity test'
      ]
    },
    zh: {
      title: 'Clash & Sing-Box资源下载 | 代理客户端与安装教程',
      description: '下载代理客户端（Clash Verge、Clash Nyanpasu、Sing-Box、Shadowrocket、V2RayNG）和安装脚本。设置Clash和Sing-Box代理系统的完整资源。',
      keywords: [
        'clash客户端下载',
        'clash verge下载',
        'clash nyanpasu下载',
        'clash meta下载',
        'mihomo下载',
        'singbox下载',
        'shadowrocket下载',
        'v2rayng下载',
        '代理客户端下载',
        'clash premium下载',
        'clash windows版',
        'clash安卓版',
        'clash ios版',
        'clash mac版',
        'clash linux版',
        'singbox客户端',
        '代理安装脚本',
        'v2ray安装',
        'xray安装',
        'marzban面板',
        'v2ray wss',
        '代理服务器搭建',
        'clash配置教程',
        'singbox配置教程',
        '代理工具下载',
        'gfw检测工具',
        '端口检测',
        'tcp ping',
        'ip连通性测试'
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
        'en': `${seoConfig.siteUrl}/resources`,
        'zh': `${seoConfig.siteUrl}/zh/resources`
      }
    }
  };
}

export default async function ResourcesPage({ params }: PageProps) {
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
      <ResourcesContent />
      <JSONLDStructuredData locale={locale} type="all" pageType="resources" />
    </div>
  );
}
