import { Converter } from '@/components/converter';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { SEOContent } from '@/components/seo-content';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur supports-[backdrop-filter]:bg-stone-50/60 dark:border-stone-800 dark:bg-stone-950/80 dark:supports-[backdrop-filter]:bg-stone-950/60">
        <div className="mx-auto flex h-14 items-center justify-between px-4 md:px-8 lg:max-w-6xl">
          <div className="flex items-center gap-2">
            <Image src="/clash_converter_linear.svg" alt="ClashConverter" width={180} height={60} />
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div id="converter">
        <Converter />
      </div>
      <SEOContent />
    </div>
  );
}
