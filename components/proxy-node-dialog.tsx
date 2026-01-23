'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';

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

export function ProxyNodeDialog() {
  const t = useTranslations('proxyNodeDialog');
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-stone-200 dark:border-stone-800"
        >
          <Server className="h-4 w-4" />
          <span className="hidden sm:inline">{t('buttonLabel')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('title')}</DialogTitle>
          <DialogDescription className="text-base">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {proxyScripts.map((script) => (
            <Card
              key={script.id}
              className="group hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{script.icon}</span>
                  {t(`scripts.${script.id}.name`)}
                </CardTitle>
                <CardDescription>
                  {t(`scripts.${script.id}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={t(`scripts.${script.id}.url`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-50 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
                >
                  <Server className="h-4 w-4" />
                  {t('viewButton')}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t('notice')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
