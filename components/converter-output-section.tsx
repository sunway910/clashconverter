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
import { Download, Info, Copy, Check, Cpu } from 'lucide-react';
import { PreviewEditor, type LanguageType } from '@/components/preview/preview-editor';
import { FormatSelector } from './converter-format-selector';
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
  onFormatChange: (value: FormatType) => void;
  formatOptions: Array<{ value: FormatType; label: string }>;
  labels: {
    outputLabel: string;
    formatTypes: Record<string, string>;
    download: string;
    copy: string;
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
  onFormatChange,
  formatOptions,
  labels,
}: OutputSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Card className="neo-card relative overflow-hidden rounded-neoLg bg-neo-card dark:bg-neo-cardDark border border-neo-border dark:border-neo-borderDark h-full flex flex-col transition-all duration-200 hover:border-neo-borderStrong dark:hover:border-neo-borderStrongDark">
          {/* Accent bar - right side for output */}
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-neo-foreground/20 dark:bg-white/20" />

          <CardHeader className="relative z-10 pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle
                className="flex items-center gap-2 cursor-pointer group select-none"
                onClick={() => setDialogOpen(true)}
                role="button"
                tabIndex={0}
                title="Click to view kernel features"
              >
                {/* Technical label */}
                <span className="text-xl md:text-2xl font-semibold text-neo-foreground dark:text-white tracking-tight">
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

          <CardContent className="relative z-10 flex-1 flex flex-col px-4 pb-4">
            {/* Action Buttons - Sharp, functional */}
            <div className="mb-3 flex gap-2 h-10">
              {/* Download Button - Primary action */}
              <Button
                onClick={onDownload}
                disabled={itemCount === 0}
                className="flex-1 h-full rounded-neoMd bg-neo-foreground dark:bg-white text-neo-canvas dark:text-neo-canvasDark font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border-0 hover:opacity-90"
                title={labels.download}
              >
                <Download className="w-4 h-4 mr-2 shrink-0" />
                {labels.download}
              </Button>

              {/* Copy Button - Secondary action */}
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={itemCount === 0}
                className="h-full px-4 rounded-neoMd bg-transparent hover:bg-neo-border dark:hover:bg-neo-borderDark text-neo-foreground dark:text-white font-medium border border-neo-border dark:border-neo-borderDark transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                title={labels.copy}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-neo-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Editor Area - recessed, functional */}
            <div className="flex-1 neo-input rounded-neoMd bg-neo-canvas dark:bg-neo-canvasDark border border-neo-border dark:border-neo-borderDark overflow-hidden">
              <PreviewEditor
                key={outputFormat}
                value={output}
                language={outputLanguage}
                height="100%"
                placeholder={outputPlaceholder}
              />
            </div>

            {/* Status Bar - technical, informative */}
            <div className="mt-3 flex items-center justify-between text-xs h-5">
              <div className="flex items-center gap-1.5 text-neo-muted dark:text-neo-mutedLight">
                <Cpu className="w-3.5 h-3.5" />
                <span className="mono">{kernelTitle}</span>
              </div>
              <div className="mono text-neo-muted dark:text-neo-mutedLight">
                {itemCount} NODES
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogContent className="max-w-md rounded-neoLg border border-neo-border dark:border-neo-borderDark bg-neo-card dark:bg-neo-cardDark">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neo-foreground dark:text-white tracking-tight">
              Kernel Features
            </DialogTitle>
            <DialogDescription className="text-neo-muted dark:text-neo-mutedLight">
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