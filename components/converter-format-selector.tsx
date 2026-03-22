import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cpu, Info } from 'lucide-react';
import { FormatType } from '@/lib/parser';

interface FormatSelectorProps {
  value: FormatType;
  onChange: (value: FormatType) => void;
  options: Array<{ value: FormatType; label: string }>;
  infoButton?: React.ReactNode;
}

export function FormatSelector({ value, onChange, options, infoButton }: FormatSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(val) => onChange(val as FormatType)} aria-label="Select format">
        <SelectTrigger className="w-full min-w-[140px] max-w-[180px] h-10 rounded-2xl bg-white/80 border-white/20 text-sm font-semibold text-clay-foreground clay-pressed focus:ring-2 focus:ring-clay-accent/30 focus:bg-white transition-all duration-300">
          <SelectValue className="truncate" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-white/20 bg-white/95 backdrop-blur-xl clay-card">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-xl mb-1 font-medium text-clay-foreground hover:bg-clay-accent/10 hover:text-clay-accent transition-colors duration-200 last:mb-0"
            >
              <span className="truncate block max-w-[200px]">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {infoButton}
    </div>
  );
}
