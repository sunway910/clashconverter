import React, { memo } from 'react';

interface KernelFeaturesProps {
  features: string[];
  title: string;
  description: string;
}

export const KernelFeatures = memo(({ title, description, features }: KernelFeaturesProps) => (
  <div className="space-y-4">
    <div className="p-5 rounded-3xl bg-gradient-to-br from-clay-accent/10 to-clay-accent-alt/10 border border-clay-accent/20">
      <h4
        className="text-lg font-black text-clay-foreground"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        {title}
      </h4>
      <p className="text-sm text-clay-muted mt-2 break-words font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {description}
      </p>
    </div>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li
          key={index}
          className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-white/20 transition-all duration-300 hover:-translate-y-1 hover:clay-card-hover"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-clay-success to-emerald-600 clay-button shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-sm font-medium text-clay-foreground break-words" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
  </div>
));

KernelFeatures.displayName = 'KernelFeatures';
