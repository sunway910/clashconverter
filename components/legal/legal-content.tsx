/**
 * Legal Page Content Component (shared)
 * Renders structured legal documents (Privacy Policy, Terms of Service)
 * from message namespaces with automatic link detection.
 */

'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

const URL_PATTERN = /(https?:\/\/[^\s,)]+)/g;

/** Render plain text, turning bare URLs into external links */
function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('https://') || part.startsWith('http://') ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {part}
          </a>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}

export function LegalContent({ namespace }: { namespace: 'privacyPage' | 'termsPage' }) {
  const t = useTranslations(namespace);
  const tRoot = useTranslations();
  const sections = t.raw('sections') as LegalSection[];

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Back button */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{tRoot('backToHome')}</span>
          </Button>
        </Link>
      </div>

      {/* Title & updated date */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 text-stone-900 dark:text-stone-100">
        {t('title')}
      </h1>
      <p className="text-center text-sm text-stone-500 dark:text-stone-400 mb-10">
        {t('updated')}
      </p>

      {/* Intro */}
      <p className="text-base md:text-lg leading-relaxed text-stone-700 dark:text-stone-300 mb-10">
        <LinkifiedText text={t('intro')} />
      </p>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-stone-600 dark:text-stone-400 mb-3"
              >
                <LinkifiedText text={paragraph} />
              </p>
            ))}
            {section.items && (
              <ul className="space-y-2 mt-3">
                {section.items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-stone-400 dark:text-stone-500 mr-2 mt-0.5">•</span>
                    <span className="text-base leading-relaxed text-stone-600 dark:text-stone-400">
                      <LinkifiedText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
