'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { processSubscriptionLink, proxiesToYaml, SubscriptionResult } from '@/lib/subscription';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionUrl: string;
  onConvert: (content: string, inputFormat: string, suggestedOutputFormat?: string) => void;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  subscriptionUrl,
  onConvert,
}: SubscriptionDialogProps) {
  const t = useTranslations();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleConvert = async () => {
    if (retryCount >= maxRetries) {
      setStatus('error');
      setErrorMessage(t('subscription.maxRetriesReached'));
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const subscriptionResult = await processSubscriptionLink(subscriptionUrl);
      setResult(subscriptionResult);

      if (!subscriptionResult.success) {
        setStatus('error');
        setErrorMessage(subscriptionResult.error || t('subscription.unknownError'));
        return;
      }

      setStatus('success');
      setRetryCount(0); // Reset retry count on success

      // Determine the input format based on content type
      let inputFormat = 'txt';
      if (subscriptionResult.contentType === 'yaml' || subscriptionResult.contentType === 'singbox') {
        // Content is re-serialized as Clash YAML below
        inputFormat = 'clash-meta';
      }

      // Convert to YAML for display
      const yamlContent = proxiesToYaml(subscriptionResult.proxies!);

      // Call the onConvert callback with the parsed content
      onConvert(yamlContent, inputFormat, subscriptionResult.suggestedOutputFormat);
    } catch (error) {
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : t('subscription.fetchError');
      setErrorMessage(errorMsg);
      setRetryCount(prev => prev + 1);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setStatus('idle');
      setResult(null);
      setErrorMessage('');
    }, 300);
  };

  const getDialogContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('subscription.fetching')}</p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div className="text-center space-y-2">
              <p className="font-medium">{t('subscription.converted')}</p>
              <p className="text-sm text-muted-foreground">
                {t('subscription.proxiesFound', { count: result?.proxies?.length || 0 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('subscription.contentType')}: {result?.contentType === 'yaml' ? 'Clash YAML' : result?.contentType === 'singbox' ? 'Sing-Box JSON' : 'Proxy Links'}
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center gap-4 py-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <div className="text-center space-y-2">
              <p className="font-medium text-destructive">{t('subscription.error')}</p>
              <p className="text-sm text-muted-foreground break-all max-w-full">{errorMessage}</p>
              {retryCount < maxRetries && (
                <p className="text-xs text-muted-foreground">
                  {t('subscription.retryAttempt', { current: retryCount, max: maxRetries })}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {t('subscription.detectSubscription')}
            </p>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs font-mono break-all">{subscriptionUrl}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('subscription.autoConvertDescription')}
            </p>
          </div>
        );
    }
  };

  const getDialogFooter = () => {
    switch (status) {
      case 'loading':
        return null;

      case 'success':
        return (
          <Button onClick={handleCancel}>
            {t('subscription.close')}
          </Button>
        );

      case 'error':
        return (
          <>
            <Button variant="outline" onClick={handleCancel}>
              {t('subscription.cancel')}
            </Button>
            <Button onClick={handleConvert}>
              {t('subscription.retry')}
            </Button>
          </>
        );

      default:
        return (
          <>
            <Button variant="outline" onClick={handleCancel}>
              {t('subscription.cancel')}
            </Button>
            <Button onClick={handleConvert}>
              {t('subscription.convert')}
            </Button>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {status === 'idle' ? t('subscription.title') : ''}
            {status === 'loading' ? t('subscription.processing') : ''}
            {status === 'success' ? t('subscription.success') : ''}
            {status === 'error' ? t('subscription.failed') : ''}
          </DialogTitle>
          <DialogDescription>
            {status === 'idle' && t('subscription.description')}
          </DialogDescription>
        </DialogHeader>
        {getDialogContent()}
        <DialogFooter>
          {getDialogFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
