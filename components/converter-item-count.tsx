import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ItemCountProps {
  count: number;
  onClear: () => void;
  clearLabel: string;
  countLabel: string;
}

export function ItemCount({ count, onClear, clearLabel, countLabel }: ItemCountProps) {
  return (
    <div className="mt-4 md:mt-6 flex items-center justify-between gap-2 text-xs md:text-sm">
      <span
        className="truncate flex-1 min-w-0 font-medium text-clay-muted"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {countLabel.replace('{count}', String(count))}
      </span>
      {count > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs shrink-0 h-8 px-3 rounded-full bg-white/60 hover:bg-red-50 hover:text-red-500 text-clay-muted font-semibold transition-all duration-300 border border-white/20"
          title="Clear all items"
          type="button"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          {clearLabel}
        </Button>
      )}
    </div>
  );
}
