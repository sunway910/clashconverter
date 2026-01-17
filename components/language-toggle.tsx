'use client';

import * as React from 'react';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="size-9 rounded-md border border-stone-200 dark:border-stone-800 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-center text-sm font-medium"
      aria-label="Toggle language"
    >
      {locale === 'en' ? 'EN' : 'CN'}
    </button>
  );
}
