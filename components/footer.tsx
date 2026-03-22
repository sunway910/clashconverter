"use client"
import { useTranslations } from 'next-intl';
import { Mail, Github } from 'lucide-react';
import { useState } from 'react';

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'clashconverter@gmail.com';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  const [showEmail, setShowEmail] = useState(false);

  return (
    <footer className="w-full py-8 md:py-12 bg-clay-canvas dark:bg-[#0d0e15]">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Claymorphism Card Style Footer */}
        <div className="clay-card dark:clay-card-dark relative overflow-hidden rounded-[32px] bg-white/70 dark:bg-[#1a1b26]/80 backdrop-blur-xl border-white/30 dark:border-white/10 p-8 md:p-10 transition-all duration-500">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-clay-accent/20 to-clay-accent-alt/20 blur-3xl pointer-events-none dark:from-clay-accent/25 dark:to-clay-accent-alt/25" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-clay-accent-tertiary/20 to-blue-500/20 blur-3xl pointer-events-none dark:from-clay-accent-tertiary/25 dark:to-blue-500/25" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-5 text-center">
            {/* Copyright */}
            <p
              className="text-base md:text-lg font-medium text-clay-muted dark:text-[#808080]"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              © {currentYear} ClashConverter. {t('rights')}
            </p>

            {/* Divider */}
            <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-clay-accent via-clay-accent-alt to-clay-accent-tertiary" />

            {/* Contact & GitHub Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {/* Email Button */}
              <button
                onClick={() => setShowEmail(true)}
                className="group flex items-center gap-2.5 clay-button dark:clay-button px-6 py-3 rounded-full bg-white dark:bg-[#24283b] text-clay-foreground dark:text-[#e0e0e0] font-semibold text-sm transition-all duration-300 hover:-translate-y-1 hover:clay-button-hover dark:hover:clay-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1a1b26]"
                type="button"
                aria-label={showEmail ? 'Hide contact email' : 'Show contact email'}
              >
                <Mail className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{showEmail ? CONTACT_EMAIL : t('contact')}</span>
              </button>

              {/* GitHub Button */}
              <a
                href="https://github.com/sunway910/clashconverter"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 clay-button dark:clay-button px-6 py-3 rounded-full bg-white dark:bg-[#24283b] text-clay-foreground dark:text-[#e0e0e0] font-semibold text-sm transition-all duration-300 hover:-translate-y-1 hover:clay-button-hover dark:hover:clay-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1a1b26]"
              >
                <Github className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
