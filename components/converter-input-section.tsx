import { useState, memo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Terminal } from 'lucide-react';
import { PreviewEditor, type LanguageType } from '@/components/preview/preview-editor';
import { FormatSelector } from './converter-format-selector';
import { ProtocolCards } from './converter-protocol-cards';
import { FormatType } from '@/lib/parser';

interface InputSectionProps {
  input: string;
  inputFormat: FormatType;
  inputLanguage: LanguageType;
  inputPlaceholder: string;
  itemCount: number;
  onInputChange: (value: string) => void;
  onFormatChange: (value: FormatType) => void;
  onClear: () => void;
  formatOptions: Array<{ value: FormatType; label: string }>;
  labels: {
    inputLabel: string;
    supportedProtocols: string;
    formatTypes: Record<string, string>;
    clear: string;
    itemsFound: string;
  };
}

export const InputSection = memo(({
  input,
  inputFormat,
  inputLanguage,
  inputPlaceholder,
  itemCount,
  onInputChange,
  onFormatChange,
  onClear,
  formatOptions,
  labels,
}: InputSectionProps) => {
  const t = useTranslations();
  const [dialogOpen, setDialogOpen] = useState(false);

  const infoButton = (
    <DialogTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-neo-border dark:hover:bg-neo-borderDark text-neo-muted dark:text-neo-mutedLight hover:text-neo-foreground dark:hover:text-white transition-colors duration-200 rounded-neo"
      >
        <Info className="w-3.5 h-3.5" />
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Card className="neo-card relative overflow-hidden rounded-neoLg bg-neo-card dark:bg-neo-cardDark border border-neo-border dark:border-neo-borderDark h-full flex flex-col transition-all duration-200 hover:border-neo-borderStrong dark:hover:border-neo-borderStrongDark">
        {/* Accent bar - left side */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neo-foreground/20 dark:bg-white/20" />

        <CardHeader className="relative z-10 pb-2 px-4 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle
              className="flex items-center gap-2 cursor-pointer group select-none"
              onClick={() => setDialogOpen(true)}
              role="button"
              tabIndex={0}
              title="Click to view supported protocols"
            >
              {/* Technical label */}
              <span className="text-xl md:text-2xl font-semibold text-neo-foreground dark:text-white tracking-tight">
                {labels.inputLabel}
              </span>
            </CardTitle>
            <FormatSelector
              value={inputFormat}
              onChange={onFormatChange}
              options={formatOptions}
              infoButton={infoButton}
            />
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex-1 flex flex-col px-4 pb-4">
          {/* Spacer to match output section button height */}
          <div className="mb-3 h-10" />

          {/* Editor Area - recessed, functional */}
          <div className="flex-1 neo-input rounded-neoMd bg-neo-canvas dark:bg-neo-canvasDark border border-neo-border dark:border-neo-borderDark overflow-hidden">
            <PreviewEditor
              value={input}
              language={inputLanguage}
              height="100%"
              placeholder={inputPlaceholder}
              onChange={onInputChange}
            />
          </div>

          {/* Status Bar - technical, informative */}
          <div className="mt-3 flex items-center justify-between text-xs h-5">
            <div className="flex items-center gap-1.5 text-neo-muted dark:text-neo-mutedLight">
              <Terminal className="w-3.5 h-3.5" />
              <span className="mono">READY</span>
            </div>
            <div className="mono text-neo-muted dark:text-neo-mutedLight">
              {labels.itemsFound}
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="max-w-md rounded-neoLg border border-neo-border dark:border-neo-borderDark bg-neo-card dark:bg-neo-cardDark">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neo-foreground dark:text-white tracking-tight">
            {t('dialog.protocolsTitle')}
          </DialogTitle>
          <DialogDescription className="text-neo-muted dark:text-neo-mutedLight">
            {t('dialog.protocolsDescription')}
          </DialogDescription>
        </DialogHeader>
        <ProtocolCards />
      </DialogContent>
    </Dialog>
  );
});

InputSection.displayName = 'InputSection';