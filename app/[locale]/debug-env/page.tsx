'use client';

import { useEffect, useState } from 'react';

export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Capture environment variables on client side
    setEnvVars({
      NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER as string,
      NEXT_PUBLIC_ENABLE_LOON_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER as string,
      NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER as string,
      NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER as string,
    });

    // Dynamic import to get fresh module state
    import('@/lib/features').then(({ isFormatEnabled, ENABLED_FORMATS }) => {
      setFeatureFlags({
        'isFormatEnabled(sing-box)': isFormatEnabled('sing-box'),
        'isFormatEnabled(loon)': isFormatEnabled('loon'),
        'ENABLED_FORMATS.sing-box': ENABLED_FORMATS['sing-box'],
        'ENABLED_FORMATS.loon': ENABLED_FORMATS['loon'],
      });
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Environment Variable Debug Page</h1>
      <p style={{ color: 'red' }}>Open browser console (F12) for more details</p>

      <section style={{ marginBottom: '20px' }}>
        <h2>process.env values (Client-side):</h2>
        <pre style={{ background: '#f0f0f0', padding: '10px' }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>Feature Flags:</h2>
        <pre style={{ background: '#f0f0f0', padding: '10px' }}>
          {JSON.stringify(featureFlags, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Expected behavior:</h2>
        <ul>
          <li>NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER should be "false"</li>
          <li>NEXT_PUBLIC_ENABLE_LOON_TRANSFER should be "false"</li>
          <li>isFormatEnabled('sing-box') should be false</li>
          <li>isFormatEnabled('loon') should be false</li>
        </ul>
      </section>
    </div>
  );
}
