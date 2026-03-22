import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';

interface ActionButtonsProps {
  onDownload: () => void;
  onCopy: () => void;
  disabled?: boolean;
  downloadLabel: string;
  copyLabel: string;
}

export function ActionButtons({ onDownload, onCopy, disabled, downloadLabel, copyLabel }: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      {/* Download Button - Primary with gradient */}
      <Button
        onClick={onDownload}
        disabled={disabled}
        className="flex-1 h-14 rounded-2xl bg-gradient-to-br from-clay-accent to-clay-accent-alt text-white font-bold clay-button transition-all duration-300 hover:-translate-y-1 hover:clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        size="sm"
        title={disabled ? 'No content to download' : downloadLabel}
      >
        <Download className="w-5 h-5 mr-2 shrink-0" />
        <span className="hidden md:inline truncate">{downloadLabel}</span>
      </Button>
      {/* Copy Button - Secondary with clay style */}
      <Button
        variant="outline"
        onClick={onCopy}
        disabled={disabled}
        size="sm"
        className="h-14 rounded-2xl bg-white/80 text-clay-foreground font-bold border-white/20 clay-button transition-all duration-300 hover:-translate-y-1 hover:clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-w-[56px]"
        title={disabled ? 'No content to copy' : copyLabel}
      >
        <Copy className="w-5 h-5 shrink-0" />
        <span className="hidden md:inline ml-2 truncate">{copyLabel}</span>
      </Button>
    </div>
  );
}
