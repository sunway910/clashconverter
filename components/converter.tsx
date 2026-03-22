'use client';

import { useEffect } from 'react';
import { SubscriptionDialog } from '@/components/dialogs/subscription-dialog';
import { useTranslations } from 'next-intl';
import { ConverterHeader } from './converter-header';
import { InputSection } from './converter-input-section';
import { OutputSection } from './converter-output-section';
import { SwapButton } from './converter-swap-button';
import {
  useConverterState,
  useConverterToasts,
  useSubscriptionDetection,
  useFileOperations,
} from '@/lib/hooks';
import { getInputFormatOptions, getOutputFormatOptions } from '@/lib/utils/converter';

export function Converter() {
  const t = useTranslations();

  // State management hook
  const {
    input,
    setInput,
    inputFormat,
    setInputFormat,
    outputFormat,
    setOutputFormat,
    pendingInputRef,
    output,
    filteredCounts,
    unsupported,
    inputLanguage,
    outputLanguage,
    inputPlaceholder,
    outputPlaceholder,
    itemCount,
    kernelTitle,
    kernelDescription,
    kernelFeatures,
  } = useConverterState();

  // Toast notifications hook
  useConverterToasts({
    input,
    unsupported,
    filteredCounts,
    outputFormat,
  });

  // Subscription detection hook
  const {
    subscriptionDialogOpen,
    setSubscriptionDialogOpen,
    pendingSubscriptionUrl,
    handleSubscriptionConvert,
  } = useSubscriptionDetection({
    input,
    setInput,
    setInputFormat,
    setOutputFormat,
  });

  // File operations hook
  const { handleCopy, handleDownload, handleSwapFormat } = useFileOperations({
    output,
    outputFormat,
    inputFormat,
    setInputFormat,
    setOutputFormat,
    pendingInputRef,
  });

  // Format options
  const inputFormatOptions = getInputFormatOptions(t);
  const outputFormatOptions = getOutputFormatOptions(t);

  // Handle pending input after format change
  useEffect(() => {
    if (pendingInputRef.current !== null) {
      setInput(pendingInputRef.current);
      pendingInputRef.current = null;
    }
  }, [inputFormat, setInput, pendingInputRef]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:p-12 space-y-8 md:space-y-12">
      {/* Header with gradient text */}
      <ConverterHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Main converter grid */}
      <div className="grid gap-6 md:gap-10 md:grid-cols-2 relative">
        {/* Decorative center element */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#A78BFA]/20 to-[#7C3AED]/20 blur-xl pointer-events-none hidden md:block" />

        {/* Input Section - Left Side */}
        <div className="relative">
          <InputSection
            input={input}
            inputFormat={inputFormat}
            inputLanguage={inputLanguage}
            inputPlaceholder={inputPlaceholder}
            itemCount={itemCount}
            onInputChange={setInput}
            onFormatChange={setInputFormat}
            onClear={() => setInput('')}
            formatOptions={inputFormatOptions}
            labels={{
              inputLabel: t('inputLabel'),
              supportedProtocols: t('supportedProtocols'),
              formatTypes: t.raw('formatTypes') as Record<string, string>,
              clear: t('clear'),
              itemsFound: t('itemsFound', { count: itemCount }),
            }}
          />
        </div>

        {/* Swap Button (centered) - Desktop only */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
          <SwapButton onClick={handleSwapFormat} variant="desktop" />
        </div>

        {/* Output Section - Right Side */}
        <div className="relative">
          <OutputSection
            output={output}
            outputFormat={outputFormat}
            outputLanguage={outputLanguage}
            outputPlaceholder={outputPlaceholder}
            itemCount={itemCount}
            kernelTitle={kernelTitle}
            kernelDescription={kernelDescription}
            kernelFeatures={kernelFeatures}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onSwapFormat={handleSwapFormat}
            onFormatChange={setOutputFormat}
            formatOptions={outputFormatOptions}
            labels={{
              outputLabel: t('outputLabel'),
              formatTypes: t.raw('formatTypes') as Record<string, string>,
              download: t('download'),
              copy: t('copy'),
              swapDirection: t('swapDirection'),
            }}
          />
        </div>
      </div>

      {/* Mobile swap button */}
      <div className="md:hidden flex justify-center">
        <SwapButton onClick={handleSwapFormat} variant="mobile" />
      </div>

      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        subscriptionUrl={pendingSubscriptionUrl}
        onConvert={handleSubscriptionConvert}
      />
    </div>
  );
}
