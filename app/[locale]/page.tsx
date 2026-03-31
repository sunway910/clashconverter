import { Converter } from '@/components/converter';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Info, Download } from 'lucide-react';
import { JSONLDStructuredData } from '@/components/seo/seo-head';
import { locales } from '@/i18n';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Validate locale and set request locale for next-intl
  if (!locales.includes(locale as any)) {
    return <div>Unsupported locale</div>;
  }

  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="relative min-h-screen bg-neo-canvas dark:bg-neo-canvasDark">
      {/* Structural Grid Background - subtle, functional */}
      <div className="fixed inset-0 -z-10 neo-grid-lines opacity-30 dark:opacity-20" />

      {/* Header - Clean, sharp, functional */}
      <header className="sticky top-0 z-50 w-full border-b border-neo-border dark:border-neo-borderDark bg-neo-card/95 dark:bg-neo-cardDark/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 items-center justify-between px-4 md:px-8 lg:max-w-6xl">
          {/* Logo - sharper hover */}
          <div className="flex items-center gap-3">
            <span className="neo-label text-neo-muted dark:text-neo-mutedLight hidden sm:inline">
              CLASH CONVERTER
            </span>
          </div>

          {/* Navigation - Clean buttons, no rounded excess */}
          <nav className="flex items-center gap-1 md:gap-2" aria-label="Main navigation">
            <Link href="/resources">
              <button
                className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neo-muted dark:text-neo-mutedLight hover:text-neo-foreground dark:hover:text-white transition-colors duration-200 border border-transparent hover:border-neo-border dark:hover:border-neo-borderDark rounded-neoMd"
                aria-label={t('resources.menuTitle')}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t('resources.menuTitle')}</span>
              </button>
            </Link>
            <Link href="/about">
              <button
                className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neo-muted dark:text-neo-mutedLight hover:text-neo-foreground dark:hover:text-white transition-colors duration-200 border border-transparent hover:border-neo-border dark:hover:border-neo-borderDark rounded-neoMd"
                aria-label={t('about')}
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">{t('about')}</span>
              </button>
            </Link>

            {/* Separator - sharp line */}
            <div className="w-px h-4 bg-neo-border dark:bg-neo-borderDark mx-1 hidden sm:block" aria-hidden="true" />

            <LanguageToggle />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content - Entrance animation */}
      <main className="relative z-0 animate-neo-enter">
        <Converter />
        <JSONLDStructuredData locale={locale} type="all" pageType="home" />
      </main>

      {/* Footer Accent Line - structural element */}
      <footer className="fixed bottom-0 left-0 right-0 h-px bg-neo-border dark:bg-neo-borderDark" />
    </div>
  );
}