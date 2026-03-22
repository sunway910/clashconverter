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
    <div className="relative min-h-screen bg-[#F4F1FA] overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        {/* Violet blob - top left */}
        <div
          className="absolute -top-[10%] -left-[10%] h-[60vh] w-[60vh] rounded-full bg-[#8B5CF6]/10 blur-3xl animate-clay-float"
          style={{ animationDelay: '0s' }}
        />
        {/* Pink blob - top right */}
        <div
          className="absolute -top-[5%] -right-[10%] h-[50vh] w-[50vh] rounded-full bg-[#EC4899]/10 blur-3xl animate-clay-float-delayed"
          style={{ animationDelay: '2s' }}
        />
        {/* Blue blob - bottom left */}
        <div
          className="absolute -bottom-[10%] -left-[5%] h-[55vh] w-[55vh] rounded-full bg-[#0EA5E9]/10 blur-3xl animate-clay-float"
          style={{ animationDelay: '4s' }}
        />
        {/* Purple blob - bottom right */}
        <div
          className="absolute -bottom-[15%] -right-[5%] h-[65vh] w-[65vh] rounded-full bg-[#A78BFA]/10 blur-3xl animate-clay-float-delayed"
          style={{ animationDelay: '6s' }}
        />
      </div>

      {/* Glass-morphic Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/20">
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-8 lg:max-w-6xl">
          <div className="flex items-center gap-2">
            <Image
              src="/clash_converter_linear.svg"
              alt="ClashConverter"
              width={180}
              height={60}
              className="max-w-[140px] md:max-w-none hover:opacity-80 transition-opacity duration-300"
            />
          </div>
          <nav className="flex items-center gap-1 md:gap-1.5" aria-label="Main navigation">
            <Link href="/resources">
              <button
                className="group flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#635F69] hover:text-[#7C3AED] transition-all duration-300 rounded-[20px] hover:bg-white/50 min-h-[44px] min-w-[44px]"
                aria-label={t('resources.menuTitle')}
              >
                <Download className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline">{t('resources.menuTitle')}</span>
              </button>
            </Link>
            <Link href="/about">
              <button
                className="group flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#635F69] hover:text-[#7C3AED] transition-all duration-300 rounded-[20px] hover:bg-white/50 min-h-[44px] min-w-[44px]"
                aria-label={t('about')}
              >
                <Info className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline">{t('about')}</span>
              </button>
            </Link>
            <div className="w-px h-6 bg-[#D9D4E3] mx-0.5 hidden sm:block" aria-hidden="true" />
            <LanguageToggle />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-0">
        <Converter />
        <JSONLDStructuredData locale={locale} type="all" pageType="home" />
      </main>

      {/* Decorative floating elements */}
      <div className="pointer-events-none fixed bottom-20 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#A78BFA]/5 to-[#7C3AED]/5 blur-2xl animate-clay-float-slow -z-10" />
      <div className="pointer-events-none fixed top-40 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#EC4899]/5 to-[#DB2777]/5 blur-2xl animate-clay-float-delayed -z-10" />
    </div>
  );
}
