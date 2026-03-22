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
          className="w-full h-12 rounded-[20px] bg-white/80 text-[#332F3A] font-bold border-white/20 shadow-clay-button transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onClick}
          disabled={disabled}
          size="default"
          title={disabled ? 'Add content to swap formats' : 'Swap input and output formats'}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2 shrink-0" />
          {label}
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="default"
      variant="outline"
      className="group relative w-14 h-14 rounded-full bg-white/90 text-[#7C3AED] border-white/20 shadow-clay-button transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-button-hover active:scale-92 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-clay-button"
      onClick={onClick}
      title={disabled ? 'Add content to swap formats' : 'Swap input and output formats'}
      disabled={disabled}
      aria-label="Swap formats"
    >
      <ArrowRightLeft className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
    </Button>
  );
}
