import React, { memo } from 'react';

interface KernelFeaturesProps {
  features: string[];
  title: string;
  description: string;
}

export const KernelFeatures = memo(({ title, description, features }: KernelFeaturesProps) => (
  <div className="space-y-4">
    <div className="p-4 rounded-[20px] bg-gradient-to-br from-[#A78BFA]/10 to-[#7C3AED]/10 border border-[#A78BFA]/20">
      <h4
        className="text-base font-black text-[#332F3A]"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        {title}
      </h4>
      <p className="text-sm text-[#635F69] mt-2 break-words font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {description}
      </p>
    </div>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li
          key={index}
          className="flex items-start gap-3 p-3 rounded-[16px] bg-white/60 border border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-clay-card"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] shadow-clay-button shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-sm font-medium text-[#332F3A] break-words" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
  </div>
));

KernelFeatures.displayName = 'KernelFeatures';
