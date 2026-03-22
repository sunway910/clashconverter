import { useState, memo } from 'react';
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
import { Download, Info, Lightbulb } from 'lucide-react';
import { PreviewEditor, type LanguageType } from '@/components/preview/preview-editor';
import { FormatSelector } from './converter-format-selector';
import { SwapButton } from './converter-swap-button';
import { KernelFeatures } from './converter-kernel-features';
import { FormatType } from '@/lib/parser';

interface OutputSectionProps {
  output: string;
  outputFormat: FormatType;
  outputLanguage: LanguageType;
  outputPlaceholder: string;
  itemCount: number;
  kernelTitle: string;
  kernelDescription: string;
  kernelFeatures: string[];
  onCopy: () => void;
  onDownload: () => void;
  onSwapFormat: () => void;
  onFormatChange: (value: FormatType) => void;
  formatOptions: Array<{ value: FormatType; label: string }>;
  labels: {
    outputLabel: string;
    formatTypes: Record<string, string>;
    download: string;
    copy: string;
    swapDirection: string;
  };
}

export const OutputSection = memo(({
  output,
  outputFormat,
  outputLanguage,
  outputPlaceholder,
  itemCount,
  kernelTitle,
  kernelDescription,
  kernelFeatures: kernelFeaturesList,
  onCopy,
  onDownload,
  onSwapFormat,
  onFormatChange,
  formatOptions,
  labels,
}: OutputSectionProps) => {
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
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Card className="clay-card dark:clay-card-dark relative overflow-hidden rounded-[32px] bg-white dark:bg-[#1a1b26] border-white/20 dark:border-white/10 transition-all duration-500 hover:-translate-y-1 hover:clay-card-hover dark:hover:clay-card-hover-dark h-[560px] flex flex-col">
          {/* Decorative gradient orb */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-clay-accent-alt/15 to-pink-500/15 blur-3xl pointer-events-none dark:from-clay-accent-alt/20 dark:to-pink-500/20" />

          <CardHeader className="relative z-10 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle
                className="flex items-center gap-2 cursor-pointer group select-none"
                onClick={() => setDialogOpen(true)}
                role="button"
                tabIndex={0}
                title="Click to view kernel features"
              >
                <span
                  className="text-2xl font-black text-[#1a1a1a] dark:text-[#e0e0e0]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {labels.outputLabel}
                </span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <FormatSelector
                  value={outputFormat}
                  onChange={onFormatChange}
                  options={formatOptions}
                  infoButton={infoButton}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 flex-1 flex flex-col px-6 pb-6">
            {/* Editor Area with inset shadow */}
            <div className="flex-1 clay-pressed dark:clay-pressed-dark rounded-2xl p-4 bg-[#F8F7FF] dark:bg-[#242636] border border-white/40 dark:border-white/10">
              <PreviewEditor
                key={outputFormat}
                value={output}
                language={outputLanguage}
                height="100%"
                placeholder={outputPlaceholder}
              />
            </div>
            {/* Tip Section */}
            <div className="mt-4 flex items-center gap-2 text-xs text-clay-muted dark:text-[#808080]">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Tip · Shadow-clayPressed
              </span>
            </div>
            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              {/* Download Button - Gradient Purple to Pink */}
              <Button
                onClick={onDownload}
                disabled={itemCount === 0}
                className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold clay-button dark:clay-button transition-all duration-300 hover:-translate-y-1 hover:clay-button-hover dark:hover:clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
                title={labels.download}
              >
                <Download className="w-5 h-5 mr-2 shrink-0" />
                {labels.download}
              </Button>
              {/* Copy Button - White */}
              <Button
                variant="outline"
                onClick={onCopy}
                disabled={itemCount === 0}
                className="h-12 px-6 rounded-full bg-white dark:bg-[#242636] text-clay-foreground dark:text-[#e0e0e0] font-semibold border-white/20 dark:border-white/10 clay-button dark:clay-button transition-all duration-300 hover:-translate-y-1 hover:clay-button-hover dark:hover:clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
                title={labels.copy}
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <DialogContent className="max-w-md rounded-[32px] border-white/20 bg-white/90 dark:bg-[#1a1b26]/95 backdrop-blur-xl clay-card dark:clay-card-dark">
          <DialogHeader>
            <DialogTitle
              className="text-2xl font-black text-[#1a1a1a] dark:text-[#e0e0e0]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Kernel Features
            </DialogTitle>
            <DialogDescription className="text-clay-muted dark:text-[#808080]">
              Supported features for this kernel
            </DialogDescription>
          </DialogHeader>
          <KernelFeatures
            title={kernelTitle}
            description={kernelDescription}
            features={kernelFeaturesList}
          />
        </DialogContent>
      </Dialog>
    </>
  );
});

OutputSection.displayName = 'OutputSection';
