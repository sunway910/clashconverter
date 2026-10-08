/**
 * Contact Page Content Component
 * Lists contact channels, pre-contact guidance, and response expectations.
 */

'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Github, Clock } from 'lucide-react';
import Link from 'next/link';
import { interpolateMessage } from '@/lib/site';

interface ContactChannel {
  name: string;
  desc: string;
  note: string;
  href: string;
  cta: string;
}

export function ContactContent() {
  const t = useTranslations('contactPage');
  const tRoot = useTranslations();
  const channels = (t.raw('channels') as ContactChannel[]).map((channel) => ({
    ...channel,
    desc: interpolateMessage(channel.desc),
    note: interpolateMessage(channel.note),
    href: interpolateMessage(channel.href),
  }));
  const beforeItems = (t.raw('beforeItems') as string[]).map(interpolateMessage);

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

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 text-stone-900 dark:text-stone-100">
        {t('title')}
      </h1>

      {/* Intro */}
      <p className="text-base md:text-lg leading-relaxed text-stone-700 dark:text-stone-300 mb-12 text-center max-w-2xl mx-auto">
        {t('intro')}
      </p>

      {/* Contact channels */}
      <div className="grid gap-6 sm:grid-cols-2 mb-12">
        {channels.map((channel, index) => (
          <div
            key={channel.name}
            className="flex flex-col p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
          >
            <div className="flex items-center gap-3 mb-3">
              {index === 0 ? (
                <Mail className="w-5 h-5 text-stone-700 dark:text-stone-300" />
              ) : (
                <Github className="w-5 h-5 text-stone-700 dark:text-stone-300" />
              )}
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                {channel.name}
              </h2>
            </div>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mb-2 break-all">
              {channel.desc}
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed flex-1 mb-4">
              {channel.note}
            </p>
            <a
              href={channel.href}
              target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={channel.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            >
              {channel.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Before you write */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">
          {t('beforeTitle')}
        </h2>
        <ul className="space-y-3">
          {beforeItems.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-stone-400 dark:text-stone-500 mr-2 mt-0.5">•</span>
              <span className="text-base leading-relaxed text-stone-600 dark:text-stone-400">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Response time */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-800 border border-stone-200 dark:border-stone-700">
        <div className="flex gap-4">
          <Clock className="w-6 h-6 flex-shrink-0 text-stone-600 dark:text-stone-400" />
          <div>
            <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
              {t('responseTitle')}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {t('response')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
