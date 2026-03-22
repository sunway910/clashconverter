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
import { FileText, Info } from 'lucide-react';
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
        className="h-8 w-8 p-0 rounded-full hover:bg-[#8B5CF6]/10 hover:text-[#7C3AED] transition-all duration-300"
      >
        <Info className="w-4 h-4" />
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Card className="relative overflow-hidden rounded-[32px] bg-white/60 backdrop-blur-xl border-white/20 shadow-clay-card transition-all duration-500 hover:-translate-y-1 hover:shadow-clay-card-hover">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-[#A78BFA]/10 to-[#7C3AED]/10 blur-2xl pointer-events-none" />

        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle
              className="flex items-center gap-2 cursor-pointer group select-none"
              onClick={() => setDialogOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setDialogOpen(true);
                }
              }}
              title="Click to view supported protocols"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-clay-button transition-all duration-300 group-hover:scale-105 group-hover:shadow-clay-button-hover">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-lg md:text-xl font-bold text-[#332F3A] group-hover:text-[#7C3AED] transition-colors duration-300"
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
        <CardContent className="relative z-10 space-y-4">
          <PreviewEditor
            value={input}
            language={inputLanguage}
            height="300px"
            placeholder={inputPlaceholder}
            onChange={onInputChange}
          />
          <ItemCount
            count={itemCount}
            onClear={onClear}
            clearLabel={labels.clear}
            countLabel={labels.itemsFound}
          />
        </CardContent>
      </Card>
      <DialogContent className="max-w-md rounded-[32px] border-white/20 bg-white/80 backdrop-blur-xl shadow-clay-card">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-black text-[#332F3A]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {t('dialog.protocolsTitle')}
          </DialogTitle>
          <DialogDescription className="text-[#635F69]">
            {t('dialog.protocolsDescription')}
          </DialogDescription>
        </DialogHeader>
        <ProtocolCards />
      </DialogContent>
    </Dialog>
  );
});

InputSection.displayName = 'InputSection';
