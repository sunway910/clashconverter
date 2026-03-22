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
    <div className="mt-4 md:mt-6 flex gap-3">
      {/* Download Button - Primary with gradient */}
      <Button
        onClick={onDownload}
        disabled={disabled}
        className="flex-1 h-12 rounded-[20px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold shadow-clay-button transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-clay-button"
        size="sm"
        title={disabled ? 'No content to download' : downloadLabel}
      >
        <Download className="w-4 h-4 mr-2 shrink-0" />
        <span className="hidden md:inline truncate">{downloadLabel}</span>
      </Button>
      {/* Copy Button - Secondary with clay style */}
      <Button
        variant="outline"
        onClick={onCopy}
        disabled={disabled}
        size="sm"
        className="h-12 rounded-[20px] bg-white/80 text-[#332F3A] font-bold border-white/20 shadow-clay-button transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-clay-button min-w-[56px]"
        title={disabled ? 'No content to copy' : copyLabel}
      >
        <Copy className="w-4 h-4 shrink-0" />
        <span className="hidden md:inline ml-2 truncate">{copyLabel}</span>
      </Button>
    </div>
  );
}
