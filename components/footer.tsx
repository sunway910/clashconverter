import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'clashconverter@gmail.com';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center text-sm text-stone-600 dark:text-stone-400">
          {/* Copyright */}
          <p>
            © {currentYear} ClashConverter. {t('rights')}
          </p>

          {/* Contact */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-1.5 text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            <Mail className="h-4 w-4" />
            <span>{CONTACT_EMAIL}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
