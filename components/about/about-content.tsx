/**
 * About Page Content Component
 * Provides information about the converter with SEO-optimized content
 */

'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AboutContent() {
  const t = useTranslations();

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Back button */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('backToHome')}</span>
          </Button>
        </Link>
      </div>

      {/* H1 - Main heading */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 text-stone-900 dark:text-stone-100">
        {t('seoContent.title')}
      </h1>

      {/* Main content with target keywords */}
      <div className="prose prose-stone dark:prose-invert max-w-none mb-12">
        <p className="text-lg leading-relaxed text-stone-700 dark:text-stone-300 mb-6">
          {t('seoContent.intro')}
        </p>

        <p className="text-base leading-relaxed text-stone-600 dark:text-stone-400 mb-6">
          {t('seoContent.privacy')}
        </p>

        {/* H2 - Features section */}
        <h2 className="border-t border-stone-200 dark:border-stone-800 pt-10 text-center text-2xl md:text-3xl font-bold mt-10 mb-6 text-stone-900 dark:text-stone-100">
          {t('seoContent.features.title')}
        </h2>

        <ul className="space-y-3 mb-8">
          {t.raw('seoContent.features.items').map((item: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
              <span className="text-stone-700 dark:text-stone-300">{item}</span>
            </li>
          ))}
        </ul>

        {/* H2 - Supported protocols section */}
        <h2 className="border-t border-stone-200 dark:border-stone-800 pt-10 text-center text-2xl md:text-3xl font-bold mt-10 mb-6 text-stone-900 dark:text-stone-100">
          {t('seoContent.protocols.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {t.raw('seoContent.protocols.items').map((protocol: { name: string; desc: string }, index: number) => (
            <Card key={index} className="p-4 border-stone-200 dark:border-stone-800">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {protocol.name}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {protocol.desc}
              </p>
            </Card>
          ))}
        </div>

        {/* H2 - How to use section */}
        <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-stone-900 dark:text-stone-100 border-t border-stone-200 dark:border-stone-800 pt-10 text-center">
          {t('seoContent.howToUse.title')}
        </h2>

        <div className="space-y-4 mb-8">
          {t.raw('seoContent.howToUse.steps').map((step: { title: string; desc: string }, index: number) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                  {step.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-400">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* H2 - Open source & maintenance */}
      <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-stone-900 dark:text-stone-100 border-t border-stone-200 dark:border-stone-800 pt-10 text-center">
        {t('aboutExtras.openSourceTitle')}
      </h2>
      <div className="mb-8">
        {t.raw('aboutExtras.openSourceParagraphs').map((paragraph: string, index: number) => (
          <p key={index} className="text-base leading-relaxed text-stone-600 dark:text-stone-400 mb-3">
            {paragraph}
          </p>
        ))}
      </div>

      {/* FAQ Section - H2 with structured accordion */}
      <div className="border-t border-stone-200 dark:border-stone-800 pt-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-stone-900 dark:text-stone-100">
          {t('seoContent.faq.title')}
        </h2>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {t.raw('seoContent.faq.items').map((faq: { q: string; a: string }, index: number) => (
            <AccordionItem key={index} value={`item-${index}`}>
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

      {/* CTA Section */}
      <div className="mt-12 text-center">
        <p className="text-lg text-stone-700 dark:text-stone-300 mb-4">
          {t('seoContent.cta.text')}
        </p>
        <Link href="/">
          <Button size="lg" className="bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200">
            {t('seoContent.cta.button')}
          </Button>
        </Link>
      </div>
    </section>
  );
}
