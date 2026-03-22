import Image from 'next/image';

interface ConverterHeaderProps {
  title: string;
  subtitle: string;
}

export function ConverterHeader({ title, subtitle }: ConverterHeaderProps) {
  return (
    <div className="text-center space-y-4 md:space-y-6 mb-6 md:mb-8">
      <div className="relative inline-block">
        <Image
          src="/clash_converter.svg"
          alt={title}
          width={240}
          height={80}
          className="mx-auto max-w-[200px] md:max-w-none hover:scale-105 transition-transform duration-500"
        />
        {/* Decorative glow behind logo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#A78BFA]/30 to-[#EC4899]/30 blur-2xl -z-10 rounded-full" />
      </div>
      <p
        className="text-base md:text-lg text-[#635F69] px-4 max-w-2xl mx-auto leading-relaxed font-medium"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {subtitle}
      </p>
    </div>
  );
}
