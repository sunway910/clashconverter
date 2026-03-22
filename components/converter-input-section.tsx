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
import { FileText, Info, Lightbulb } from 'lucide-react';
import { PreviewEditor, type LanguageType } from '@/components/preview/preview-editor';
import { FormatSelector } from './converter-format-selector';
import { ItemCount } from './converter-item-count';
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
        className="h-7 w-7 p-0 rounded-full hover:bg-clay-accent/10 hover:text-clay-accent transition-all duration-300"
      >
        <Info className="w-3.5 h-3.5" />
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Card className="clay-card dark:clay-card-dark relative overflow-hidden rounded-[32px] bg-white dark:bg-[#1a1b26] border-white/20 dark:border-white/10 transition-all duration-500 hover:-translate-y-1 hover:clay-card-hover dark:hover:clay-card-hover-dark h-[560px] flex flex-col">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-clay-accent/15 to-clay-accent-alt/15 blur-3xl pointer-events-none dark:from-clay-accent/20 dark:to-clay-accent-alt/20" />

        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle
              className="flex items-center gap-2 cursor-pointer group select-none"
              onClick={() => setDialogOpen(true)}
              role="button"
              tabIndex={0}
              title="Click to view supported protocols"
            >
              <span
                className="text-2xl font-black text-[#1a1a1a] dark:text-[#e0e0e0]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
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
        <CardContent className="relative z-10 flex-1 flex flex-col px-6 pb-6">
          {/* Editor Area with inset shadow */}
          <div className="flex-1 clay-pressed dark:clay-pressed-dark rounded-2xl p-4 bg-[#F8F7FF] dark:bg-[#242636] border border-white/40 dark:border-white/10">
            <PreviewEditor
              value={input}
              language={inputLanguage}
              height="100%"
              placeholder={inputPlaceholder}
              onChange={onInputChange}
            />
          </div>
          {/* Tip Section */}
          <div className="mt-4 flex items-center gap-2 text-xs text-clay-muted dark:text-[#808080]">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Tip · Paste your proxy links here - one per line
            </span>
          </div>
          {/* Item Count */}
          <div className="mt-3 text-right">
            <span className="text-sm font-medium text-clay-muted dark:text-[#808080]">
              {labels.itemsFound}
            </span>
          </div>
        </CardContent>
      </Card>
      <DialogContent className="max-w-md rounded-[32px] border-white/20 bg-white/90 dark:bg-[#1a1b26]/95 backdrop-blur-xl clay-card dark:clay-card-dark">
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-black text-[#1a1a1a] dark:text-[#e0e0e0]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {t('dialog.protocolsTitle')}
          </DialogTitle>
          <DialogDescription className="text-clay-muted dark:text-[#808080]">
            {t('dialog.protocolsDescription')}
          </DialogDescription>
        </DialogHeader>
        <ProtocolCards />
      </DialogContent>
    </Dialog>
  );
});

InputSection.displayName = 'InputSection';
