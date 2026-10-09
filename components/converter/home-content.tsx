/**
 * Home Page SEO Content Component
 * Renders in-depth explanatory content below the converter tool:
 * formats, protocol matrix, steps, privacy, open source, and FAQ.
 */

'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/** Language-neutral protocol support matrix (verified against lib/ adapters) */
const MATRIX_HEAD = ['Protocol', 'Clash Meta', 'Clash Premium', 'Sing-Box', 'Loon', 'QuantumultX', 'Surfboard'];
const MATRIX_ROWS: string[][] = [
  ['SS', '✓', '✓', '✓', '✓', '✓', '✓'],
  ['SSR', '✓', '✓', '—', '✓', '✓', '—'],
  ['VMess', '✓', '✓', '✓', '✓', '✓', '✓'],
  ['VLESS', '✓', '—', '✓', '—', '—', '—'],
  ['Trojan', '✓', '✓', '✓', '✓', '✓', '✓'],
  ['Hysteria', '✓', '—', '✓', '—', '—', '—'],
  ['Hysteria2', '✓', '—', '✓', '—', '—', '✓'],
  ['HTTP', '✓', '✓', '✓', '—', '✓', '✓'],
  ['SOCKS5', '✓', '✓', '—', '—', '✓', '✓'],
  ['WireGuard', '✓', '✓', '✓', '—', '—', '—'],
  ['AnyTLS', '✓', '—', '✓', '—', '—', '—'],
];

interface Subsection {
  title: string;
  paragraphs: string[];
}

export function HomeContent() {
  const t = useTranslations('homeContent');
  const tRoot = useTranslations();
  const locale = useLocale();

  const introParagraphs = t.raw('intro.paragraphs') as string[];
  const inputSubs = t.raw('inputs.subsections') as Subsection[];
  const outputSubs = t.raw('outputs.subsections') as Subsection[];
  const steps = t.raw('steps.items') as Array<{ title: string; desc: string }>;
  const privacyParagraphs = t.raw('privacy.paragraphs') as string[];
  const openSourceParagraphs = t.raw('opensource.paragraphs') as string[];
  const faqItems = t.raw('faq.items') as Array<{ q: string; a: string }>;

  const h2Class = 'text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 border-t border-stone-200 dark:border-stone-800 pt-10 mb-6';
  const h3Class = 'text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2';
  const pClass = 'text-base leading-relaxed text-stone-600 dark:text-stone-400 mb-3';

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16" aria-label={t('intro.title')}>
      {/* Intro */}
      <h2 className="text-3xl md:text-4xl font-bold text-center text-stone-900 dark:text-stone-100 mb-8">
        {t('intro.title')}
      </h2>
      <div className="mb-12">
        {introParagraphs.map((paragraph, index) => (
          <p key={index} className={`${pClass} ${index === 0 ? 'text-lg' : ''}`}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* Inputs */}
      <h2 className={h2Class}>{t('inputs.title')}</h2>
      <p className={pClass}>{t('inputs.intro')}</p>
      <div className="space-y-5 mb-12">
        {inputSubs.map((sub) => (
          <div key={sub.title}>
            <h3 className={h3Class}>{sub.title}</h3>
            {sub.paragraphs.map((paragraph, index) => (
              <p key={index} className={pClass}>{paragraph}</p>
            ))}
          </div>
        ))}
      </div>

      {/* Outputs */}
      <h2 className={h2Class}>{t('outputs.title')}</h2>
      <p className={pClass}>{t('outputs.intro')}</p>
      <div className="space-y-5 mb-12">
        {outputSubs.map((sub) => (
          <div key={sub.title}>
            <h3 className={h3Class}>{sub.title}</h3>
            {sub.paragraphs.map((paragraph, index) => (
              <p key={index} className={pClass}>{paragraph}</p>
            ))}
          </div>
        ))}
      </div>

      {/* Protocol matrix */}
      <h2 className={h2Class}>{t('matrix.title')}</h2>
      <p className={pClass}>{t('matrix.intro')}</p>
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-sm border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-stone-100 dark:bg-stone-900">
              {MATRIX_HEAD.map((cell) => (
                <th key={cell} className="px-3 py-2 text-left font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_ROWS.map((row) => (
              <tr key={row[0]} className="border-t border-stone-200 dark:border-stone-800">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-3 py-2 whitespace-nowrap ${
                      cellIndex === 0
                        ? 'font-medium text-stone-900 dark:text-stone-100'
                        : cell === '✓'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-stone-400 dark:text-stone-600'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`${pClass} text-sm`}>{t('matrix.note')}</p>

      {/* Steps */}
      <h2 className={h2Class}>{t('steps.title')}</h2>
      <div className="space-y-4 mb-12">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <div>
              <h3 className={h3Class}>{step.title}</h3>
              <p className={pClass}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy */}
      <h2 className={h2Class}>{t('privacy.title')}</h2>
      <div className="mb-2">
        {privacyParagraphs.map((paragraph, index) => (
          <p key={index} className={pClass}>{paragraph}</p>
        ))}
      </div>
      <p className="mb-12">
        <Link
          href={`/${locale}/privacy`}
          className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {tRoot('footerNav.privacy')} →
        </Link>
      </p>

      {/* Open source */}
      <h2 className={h2Class}>{t('opensource.title')}</h2>
      <div className="mb-12">
        {openSourceParagraphs.map((paragraph, index) => (
          <p key={index} className={pClass}>{paragraph}</p>
        ))}
      </div>

      {/* FAQ */}
      <div className="border-t border-stone-200 dark:border-stone-800 pt-10 mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-stone-900 dark:text-stone-100">
          {t('faq.title')}
        </h2>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqItems.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-stone-900 dark:text-stone-100 hover:text-stone-700 dark:hover:text-stone-300">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-stone-600 dark:text-stone-400">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Last updated + CTA */}
      <div className="text-center">
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">{t('lastUpdated')}</p>
        <p className="text-lg text-stone-700 dark:text-stone-300">{t('cta')}</p>
      </div>
    </section>
  );
}
