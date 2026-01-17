'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { parseMultipleProxies } from '@/lib/parsers';
import { parseYamlToProxies, proxiesToLinks } from '@/lib/yaml-parser';
import { generateSimpleYaml } from '@/lib/yaml-generator';
import { Download, FileText, Copy, ArrowRightLeft, Info, Cpu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type ConversionMode = 'proxies-to-yaml' | 'yaml-to-proxies';
type KernelType = 'clash-meta' | 'clash-premium';

// Protocols not supported by Clash Premium
const CLASH_PREMIUM_UNSUPPORTED_PROTOCOLS = ['vless', 'hysteria', 'hysteria2'];

export function Converter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('proxies-to-yaml');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [kernelType, setKernelType] = useState<KernelType>('clash-meta');
  const t = useTranslations();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingInputRef = useRef<string | null>(null);
  const previousFilteredCountRef = useRef<Record<string, number>>({});

  // Parse input based on mode
  const result = useMemo(() => {
    if (!input.trim()) return '';

    if (mode === 'proxies-to-yaml') {
      let proxies = parseMultipleProxies(input);

      // Filter protocols for Clash Premium
      if (kernelType === 'clash-premium') {
        const filteredCounts: Record<string, number> = {};
        const beforeCount = proxies.length;

        proxies = proxies.filter(proxy => {
          if (CLASH_PREMIUM_UNSUPPORTED_PROTOCOLS.includes(proxy.type)) {
            filteredCounts[proxy.type] = (filteredCounts[proxy.type] || 0) + 1;
            return false;
          }
          return true;
        });

        // Show toast warnings for filtered protocols
        Object.entries(filteredCounts).forEach(([protocol, count]) => {
          const key = `${input}-${protocol}`;
          // Only show toast if the count has changed since last render
          if (previousFilteredCountRef.current[protocol] !== count) {
            toast.warning(
              t('protocolFiltered', { count, protocol: t(`unsupportedProtocols.${protocol}` as any) })
            );
          }
        });

        // Update previous filtered counts
        previousFilteredCountRef.current = filteredCounts;
      } else {
        // Reset filtered counts when switching back to clash-meta
        previousFilteredCountRef.current = {};
      }

      return generateSimpleYaml(proxies);
    } else {
      const proxies = parseYamlToProxies(input);
      return proxiesToLinks(proxies).join('\n');
    }
  }, [input, mode, kernelType, t]);

  // Handle pending input after mode change
  useEffect(() => {
    if (pendingInputRef.current !== null) {
      setInput(pendingInputRef.current);
      pendingInputRef.current = null;
    }
  }, [mode]);

  // Reset textarea scroll position when mode or input changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is updated before resetting scroll
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollLeft = 0;
        textareaRef.current.scrollTop = 0;
      }
    });
  }, [mode, input]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.success(t('copied'));
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: mode === 'proxies-to-yaml' ? 'text/yaml' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t(`downloadFilename.${mode}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully');
  };

  const handleSwapMode = () => {
    // Capture the current result before any state changes
    const currentResult = result;
    const newMode = mode === 'proxies-to-yaml' ? 'yaml-to-proxies' : 'proxies-to-yaml';

    // Store the result to be applied after mode change
    pendingInputRef.current = currentResult;
    // Change mode first - the useEffect will then update the input
    setMode(newMode);
  };

  const itemCount = mode === 'proxies-to-yaml'
    ? parseMultipleProxies(input).length
    : parseYamlToProxies(input).length;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 py-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header with title */}
      <div className="text-center space-y-1 md:space-y-2">
        <Image src="/clash_converter.svg" alt={t('title')} width={240} height={80} className="mx-auto" />
        <p className="text-sm md:text-base text-muted-foreground">
          {t(`subtitle.${mode}`)}
        </p>
      </div>

      <div className="grid gap-4 md:gap-8 md:grid-cols-2 relative">
        {/* Input Section */}
        <Card>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 cursor-pointer hover:text-stone-600 dark:hover:text-stone-400 transition-colors" onClick={() => setDialogOpen(true)}>
                  <FileText className="w-5 h-5" />
                  {t(`inputLabel.${mode}`)}
                </CardTitle>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6">
                    <Info className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </div>
              <CardDescription>
                {t(`inputDescription.${mode}`)}
              </CardDescription>
            </CardHeader>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('supportedProtocols')}</DialogTitle>
                <DialogDescription>
                  All proxy protocols are supported for conversion
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <span className="font-mono text-xs bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded">Shadowsocks</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <span className="font-mono text-xs bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded">ShadowsocksR</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <span className="font-mono text-xs bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded">Vmess</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <span className="font-mono text-xs bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded">VLESS</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <span className="font-mono text-xs bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded">Trojan</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <span className="font-mono text-xs bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded">Hysteria</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <span className="font-mono text-xs bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded">HTTP</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                  <span className="font-mono text-xs bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded">SOCKS5</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <CardContent>
            <Textarea
              ref={textareaRef}
              placeholder={t(`inputPlaceholder.${mode}`)}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="!h-[300px] md:!h-[400px] resize-none font-mono text-xs md:text-sm overflow-auto whitespace-pre"
            />
            <div className="mt-3 md:mt-4 flex items-center justify-between text-xs md:text-sm text-muted-foreground">
              <span>{t('itemsFound', { count: itemCount })}</span>
              {input && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput('')}
                  className="text-xs"
                >
                  {t('clear')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Swap Button (centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-10">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full shadow-lg bg-background"
            onClick={handleSwapMode}
            title="Swap conversion direction"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t(`outputLabel.${mode}`)}
              </CardTitle>
              {mode === 'proxies-to-yaml' && (
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <Select value={kernelType} onValueChange={(value) => setKernelType(value as KernelType)}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clash-meta">{t('kernelTypes.clash-meta')}</SelectItem>
                      <SelectItem value="clash-premium">{t('kernelTypes.clash-premium')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold">{t.raw(`kernelDescriptions.${kernelType}.title` as any)}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{t.raw(`kernelDescriptions.${kernelType}.description` as any)}</p>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {(t.raw(`kernelDescriptions.${kernelType}.features` as any) as string[]).map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-muted-foreground mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              )}
            </div>
            <CardDescription>
              {t(`outputDescription.${mode}`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="h-[300px] md:h-[400px] w-full rounded-md border border-stone-200 bg-stone-50 p-3 md:p-4 text-[10px] md:text-xs font-mono overflow-auto dark:border-stone-800 dark:bg-stone-950">
                {result || t(`outputPlaceholder.${mode}`)}
              </pre>
            </div>
            <div className="mt-3 md:mt-4 flex gap-2">
              <Button
                onClick={handleDownload}
                disabled={itemCount === 0}
                className="flex-1 text-sm"
                size="sm"
              >
                <Download className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">{t('download')}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={itemCount === 0}
                size="sm"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden md:inline ml-1 md:ml-2">{t('copy')}</span>
              </Button>
            </div>
            {/* Mobile swap button */}
            <div className="mt-3 md:mt-4 md:hidden">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSwapMode}
                disabled={!input || !result}
                size="sm"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                {t('swapDirection')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
