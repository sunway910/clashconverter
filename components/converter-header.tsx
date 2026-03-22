import Image from 'next/image';

interface ConverterHeaderProps {
  title: string;
  subtitle: string;
}

export function ConverterHeader({ title, subtitle }: ConverterHeaderProps) {
  return (
    <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-12">
      <Image
        src="/clash_converter.svg"
        alt={title}
        width={240}
        height={80}
        className="mx-auto max-w-[200px] md:max-w-none hover:scale-105 transition-transform duration-500"
      />
      <p
        className="text-base md:text-lg text-clay-muted px-4 max-w-2xl mx-auto leading-relaxed font-medium"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {subtitle}
      </p>
    </div>
  );
}
