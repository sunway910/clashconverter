"use client"
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Github, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { CONTACT_EMAIL, GITHUB_URL } from '@/lib/site';

export function Footer() {
  const t = useTranslations('footerNav');
  const tFooter = useTranslations('footer');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: `/${locale}`, label: t('tool') },
    { href: `/${locale}/resources`, label: t('resources') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/contact`, label: t('contact') },
    { href: `/${locale}/privacy`, label: t('privacy') },
    { href: `/${locale}/terms`, label: t('terms') },
  ];

  return (
    <footer className="w-full py-8 md:py-12 bg-neo-card/50 dark:bg-neo-card-dark/50 backdrop-blur-sm border-t border-neo-border dark:border-neo-border-dark">
      <div className="mx-auto max-w-6xl px-4 md:px-8">

        {/* Main Footer Content - Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">

          {/* Column 1: Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
            <span className="neo-label text-neo-muted dark:text-neo-muted-light tracking-wide">
              CLASH CONVERTER
            </span>
            <p className="text-sm text-neo-muted dark:text-neo-muted-light max-w-xs">
              {t('tagline')}
            </p>
            <p className="text-sm text-neo-muted dark:text-neo-muted-light font-medium">
              © {currentYear} {tFooter('rights')}
            </p>
          </div>

          {/* Column 2: Site Navigation */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-col items-center md:items-start gap-2"
          >
            <span className="neo-label text-neo-muted dark:text-neo-muted-light tracking-wide mb-1">
              {t('siteTitle')}
            </span>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-neo-muted dark:text-neo-muted-light hover:text-neo-foreground dark:hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Column 3: Connect */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="neo-label text-neo-muted dark:text-neo-muted-light tracking-wide mb-1">
              {t('connectTitle')}
            </span>

            {/* Email */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-neo-muted dark:text-neo-muted-light hover:text-neo-foreground dark:hover:text-white transition-all duration-200 border border-neo-border dark:border-neo-border-dark hover:border-neo-foreground/30 dark:hover:border-white/30 rounded-md"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">{CONTACT_EMAIL}</span>
              <span className="sm:hidden">{tFooter('contact')}</span>
            </a>

            {/* GitHub */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-neo-muted dark:text-neo-muted-light hover:text-neo-foreground dark:hover:text-white transition-all duration-200 border border-neo-border dark:border-neo-border-dark hover:border-neo-foreground/30 dark:hover:border-white/30 rounded-md"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
