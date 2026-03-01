/**
 * Tests to verify feature flags work correctly in client components
 * This tests the runtime behavior of process.env access in client-side code
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isFormatEnabled, getEnabledFormats, getEnabledFormatsMap } from '@/lib/features';

describe('Feature Flags - Runtime Behavior', () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    // Save original env values
    originalEnv['NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER'] = process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER;
    originalEnv['NEXT_PUBLIC_ENABLE_LOON_TRANSFER'] = process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER;
    originalEnv['NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER'] = process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
    originalEnv['NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER'] = process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;
  });

  afterEach(() => {
    // Restore original env values
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  describe('Client-side environment access', () => {
    it('should read process.env values correctly when set to false', () => {
      // Simulate client-side environment where env vars are set at build time
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER = 'true';
      process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER = 'true';

      expect(isFormatEnabled('sing-box')).toBe(false);
      expect(isFormatEnabled('loon')).toBe(false);
      expect(isFormatEnabled('clash-meta')).toBe(true);
      expect(isFormatEnabled('clash-premium')).toBe(true);
    });

    it('should return correct enabled formats when sing-box and loon are disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const formats = getEnabledFormats();

      expect(formats).not.toContain('sing-box');
      expect(formats).not.toContain('loon');
      expect(formats).toContain('txt');
      expect(formats).toContain('clash-meta');
      expect(formats).toContain('clash-premium');
      expect(formats).toContain('subscribe-url');
      expect(formats.length).toBe(4);
    });

    it('should return correct enabled formats map when some formats are disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const map = getEnabledFormatsMap();

      expect(map['sing-box']).toBe(false);
      expect(map['loon']).toBe(false);
      expect(map['clash-meta']).toBe(true);
      expect(map['clash-premium']).toBe(true);
      expect(map['txt']).toBe(true);
      expect(map['subscribe-url']).toBe(true);
    });

    it('should correctly parse "false" string value', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      expect(isFormatEnabled('sing-box')).toBe(false);
    });

    it('should handle empty string as enabled (default)', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = '';
      // Empty string should be treated as truthy (not "false")
      expect(isFormatEnabled('sing-box')).toBe(true);
    });
  });
});
