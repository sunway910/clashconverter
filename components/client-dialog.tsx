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
import { Download } from 'lucide-react';

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

export function ClientDialog() {
  const t = useTranslations('clientDialog');
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-stone-200 dark:border-stone-800"
        >
          <Download className="h-4 w-4" />
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
          {clients.map((client) => (
            <Card
              key={client.id}
              className="group hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{client.icon}</span>
                  {t(`clients.${client.id}.name`)}
                </CardTitle>
                <CardDescription>
                  {t(`clients.${client.id}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={t(`clients.${client.id}.url`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-50 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {t('downloadButton')}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
