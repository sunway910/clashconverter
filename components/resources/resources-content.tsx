/**
 * Resources Page Content Component
 * Displays proxy clients and installation scripts for proxy nodes
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Server, ArrowLeft, Smartphone, Shield, Radar } from 'lucide-react';
import Link from 'next/link';

const clients = [
  {
    id: 'clash-party',
    icon: '⚡',
  },
  {
    id: 'clash-verge',
    icon: '🚀',
  },
  {
    id: 'loon',
    icon: '🌙',
  },
  {
    id: 'sing-box',
    icon: '📦',
  },
  {
    id: 'shadowrocket',
    icon: '🎯',
  },
  {
    id: 'v2rayng',
    icon: '📱',
  },
] as const;

const proxyScripts = [
  {
    id: 'v2ray-wss',
    icon: '🌐',
  },
  {
    id: 'v2ray',
    icon: '⚙️',
  },
  {
    id: 'v2ray-agent',
    icon: '🔧',
  },
  {
    id: 'marzban',
    icon: '🎛️',
  },
] as const;

export function ResourcesContent() {
  const t = useTranslations();

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* Back button */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('backToHome')}</span>
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-stone-900 dark:text-stone-100">
          {t('resources.title')}
        </h1>
        <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
          {t('resources.subtitle')}
        </p>
      </div>

      {/* Proxy Clients Section */}
      <div className="mb-16 md:mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {t('resources.clients.title')}
            </h2>
            <p className="text-stone-600 dark:text-stone-400">
              {t('resources.clients.description')}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="group flex flex-col hover:border-stone-400 dark:hover:border-stone-600 hover:shadow-lg transition-all duration-200 h-full"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {client.icon}
                  </span>
                  {t(`clientDialog.clients.${client.id}.name`)}
                </CardTitle>
                <CardDescription className="text-base">
                  {t(`clientDialog.clients.${client.id}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <a
                  href={t(`clientDialog.clients.${client.id}.url`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 w-full px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {t('clientDialog.downloadButton')}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Proxy Node Installation Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 shadow-lg">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {t('resources.scripts.title')}
            </h2>
            <p className="text-stone-600 dark:text-stone-400">
              {t('resources.scripts.description')}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {proxyScripts.map((script) => (
            <Card
              key={script.id}
              className="group flex flex-col hover:border-stone-400 dark:hover:border-stone-600 hover:shadow-lg transition-all duration-200 h-full"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {script.icon}
                  </span>
                  {t(`proxyNodeDialog.scripts.${script.id}.name`)}
                </CardTitle>
                <CardDescription className="text-base">
                  {t(`proxyNodeDialog.scripts.${script.id}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <a
                  href={t(`proxyNodeDialog.scripts.${script.id}.url`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 w-full px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                >
                  <Server className="h-4 w-4" />
                  {t('proxyNodeDialog.viewButton')}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notice Box */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-800 border border-amber-200 dark:border-stone-700">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('resources.scripts.noticeTitle')}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {t('proxyNodeDialog.notice')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detector/Probe Tools Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 shadow-lg">
            <Radar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {t('resources.detectors.title')}
            </h2>
            <p className="text-stone-600 dark:text-stone-400">
              {t('resources.detectors.description')}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.raw('resources.detectors.tools').map((tool: { name: string; desc: string; url: string }, index: number) => (
            <Card
              key={index}
              className="group flex flex-col hover:border-stone-400 dark:hover:border-stone-600 hover:shadow-lg transition-all duration-200 h-full"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Radar className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {tool.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 w-full px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                >
                  <Radar className="h-4 w-4" />
                  {t('resources.detectors.visitButton')}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-stone-900 dark:to-stone-800 border border-purple-200 dark:border-stone-700">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Radar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('resources.detectors.infoTitle')}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {t('resources.detectors.info')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center p-8 md:p-12 rounded-2xl bg-gradient-to-r from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-800">
        <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
          {t('resources.cta.title')}
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-xl mx-auto">
          {t('resources.cta.description')}
        </p>
        <Link href="/">
          <Button size="lg" className="bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200">
            {t('resources.cta.button')}
          </Button>
        </Link>
      </div>
    </section>
  );
}
