import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';

interface SwapButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'desktop' | 'mobile';
  label?: string;
}

export function SwapButton({ onClick, disabled, variant = 'desktop', label }: SwapButtonProps) {
  if (variant === 'mobile') {
    return (
      <div className="mt-4 md:mt-6 md:hidden">
        <Button
          variant="outline"
          className="w-full h-14 rounded-2xl bg-white dark:bg-[#242636] text-clay-foreground dark:text-[#e0e0e0] font-bold border-white/20 dark:border-white/10 clay-button dark:clay-button transition-all duration-300 hover:-translate-y-1 hover:clay-button-hover dark:hover:clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onClick}
          disabled={disabled}
          size="default"
          title={disabled ? 'Add content to swap formats' : 'Swap input and output formats'}
        >
          <ArrowRightLeft className="w-5 h-5 mr-2 shrink-0" />
          {label}
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="default"
      variant="outline"
      className="group relative w-16 h-16 rounded-full bg-white/90 dark:bg-[#242636] text-clay-accent dark:text-[#a78bfa] border-white/20 dark:border-white/10 clay-button dark:clay-button transition-all duration-300 hover:-translate-y-2 hover:clay-button-hover dark:hover:clay-button-hover active:scale-92 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      onClick={onClick}
      title={disabled ? 'Add content to swap formats' : 'Swap input and output formats'}
      disabled={disabled}
      aria-label="Swap formats"
    >
      <ArrowRightLeft className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" />
    </Button>
  );
}
