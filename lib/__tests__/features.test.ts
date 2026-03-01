/**
 * Unit tests for feature flag system
 * Tests environment variable-based format enablement control
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as features from '@/lib/features';
import { getInputFormatOptions, getOutputFormatOptions } from '@/lib/utils/converter';

describe('Feature Flags', () => {
  // Store original env values before each test
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

  describe('isFormatEnabled()', () => {
    describe('Always-enabled formats', () => {
      it('should always return true for "txt" format', () => {
        // Even if somehow disabled, txt should always be enabled
        expect(features.isFormatEnabled('txt')).toBe(true);
      });

      it('should always return true for "subscribe-url" format', () => {
        expect(features.isFormatEnabled('subscribe-url')).toBe(true);
      });
    });

    describe('Configurable formats - default behavior (env var unset)', () => {
      it('should return true for "sing-box" when env var is unset', () => {
        delete process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER;
        expect(features.isFormatEnabled('sing-box')).toBe(true);
      });

      it('should return true for "loon" when env var is unset', () => {
        delete process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER;
        expect(features.isFormatEnabled('loon')).toBe(true);
      });

      it('should return true for "clash-meta" when env var is unset', () => {
        delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
        expect(features.isFormatEnabled('clash-meta')).toBe(true);
      });

      it('should return true for "clash-premium" when env var is unset', () => {
        delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;
        expect(features.isFormatEnabled('clash-premium')).toBe(true);
      });
    });

    describe('Configurable formats - explicitly disabled (env var = "false")', () => {
      it('should return false for "sing-box" when env var is "false"', () => {
        process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
        expect(features.isFormatEnabled('sing-box')).toBe(false);
      });

      it('should return false for "loon" when env var is "false"', () => {
        process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
        expect(features.isFormatEnabled('loon')).toBe(false);
      });

      it('should return false for "clash-meta" when env var is "false"', () => {
        process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER = 'false';
        expect(features.isFormatEnabled('clash-meta')).toBe(false);
      });

      it('should return false for "clash-premium" when env var is "false"', () => {
        process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER = 'false';
        expect(features.isFormatEnabled('clash-premium')).toBe(false);
      });
    });

    describe('Configurable formats - explicitly enabled (env var = "true")', () => {
      it('should return true for "sing-box" when env var is "true"', () => {
        process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'true';
        expect(features.isFormatEnabled('sing-box')).toBe(true);
      });

      it('should return true for "loon" when env var is "true"', () => {
        process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'true';
        expect(features.isFormatEnabled('loon')).toBe(true);
      });
    });

    describe('Case insensitivity', () => {
      it('should return false for "FALSE" (uppercase)', () => {
        process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'FALSE';
        expect(features.isFormatEnabled('sing-box')).toBe(false);
      });

      it('should return false for "False" (mixed case)', () => {
        process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'False';
        expect(features.isFormatEnabled('sing-box')).toBe(false);
      });

      it('should return true for "TRUE" (uppercase)', () => {
        process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER = 'TRUE';
        expect(features.isFormatEnabled('clash-meta')).toBe(true);
      });

      it('should return true for any other value (e.g., "yes", "1")', () => {
        process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'yes';
        expect(features.isFormatEnabled('sing-box')).toBe(true);

        process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = '1';
        expect(features.isFormatEnabled('sing-box')).toBe(true);
      });
    });
  });

  describe('getEnabledFormats()', () => {
    it('should return all formats when all env vars are unset or "true"', () => {
      // Reset all to enabled
      delete process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const formats = features.getEnabledFormats();

      expect(formats).toContain('txt');
      expect(formats).toContain('clash-meta');
      expect(formats).toContain('clash-premium');
      expect(formats).toContain('sing-box');
      expect(formats).toContain('loon');
      expect(formats).toContain('subscribe-url');
      expect(formats.length).toBe(6);
    });

    it('should exclude "sing-box" when disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      delete process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const formats = features.getEnabledFormats();

      expect(formats).not.toContain('sing-box');
      expect(formats).toContain('txt');
      expect(formats).toContain('loon');
      expect(formats.length).toBe(5);
    });

    it('should exclude "loon" when disabled', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER;
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const formats = features.getEnabledFormats();

      expect(formats).toContain('sing-box');
      expect(formats).not.toContain('loon');
      expect(formats.length).toBe(5);
    });

    it('should exclude multiple formats when multiple are disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER = 'false';
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const formats = features.getEnabledFormats();

      expect(formats).not.toContain('sing-box');
      expect(formats).not.toContain('loon');
      expect(formats).not.toContain('clash-meta');
      expect(formats).toContain('txt');
      expect(formats).toContain('clash-premium');
      expect(formats).toContain('subscribe-url');
      expect(formats.length).toBe(3);
    });

    it('should always include "txt" and "subscribe-url" even if env var is "false"', () => {
      // These formats don't have env vars, but let's verify they're always present
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER = 'false';

      const formats = features.getEnabledFormats();

      expect(formats).toContain('txt');
      expect(formats).toContain('subscribe-url');
    });
  });

  describe('getEnabledFormatsMap()', () => {
    it('should return correct map with all formats enabled', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const map = features.getEnabledFormatsMap();

      expect(map['txt']).toBe(true);
      expect(map['subscribe-url']).toBe(true);
      expect(map['sing-box']).toBe(true);
      expect(map['loon']).toBe(true);
      expect(map['clash-meta']).toBe(true);
      expect(map['clash-premium']).toBe(true);
    });

    it('should return correct map with some formats disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const map = features.getEnabledFormatsMap();

      expect(map['txt']).toBe(true);
      expect(map['subscribe-url']).toBe(true);
      expect(map['sing-box']).toBe(false);
      expect(map['loon']).toBe(false);
      expect(map['clash-meta']).toBe(true);
      expect(map['clash-premium']).toBe(true);
    });

    it('should reflect runtime env var changes (not cached)', () => {
      // Start with enabled
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'true';
      expect(features.getEnabledFormatsMap()['sing-box']).toBe(true);

      // Change to disabled
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      expect(features.getEnabledFormatsMap()['sing-box']).toBe(false);

      // Change back to enabled
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'true';
      expect(features.getEnabledFormatsMap()['sing-box']).toBe(true);
    });
  });

  describe('Constants', () => {
    it('should export ALL_FORMAT_TYPES with correct values', () => {
      expect(features.ALL_FORMAT_TYPES).toEqual([
        'txt',
        'clash-meta',
        'clash-premium',
        'sing-box',
        'loon',
        'subscribe-url',
      ]);
    });

    it('should export CONFIGURABLE_FORMATS with correct values', () => {
      expect(features.CONFIGURABLE_FORMATS).toEqual([
        'clash-meta',
        'clash-premium',
        'sing-box',
        'loon',
      ]);
    });

    it('should export FORMAT_ENV_VARS with correct mapping', () => {
      expect(features.FORMAT_ENV_VARS['clash-meta']).toBe('NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER');
      expect(features.FORMAT_ENV_VARS['clash-premium']).toBe('NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER');
      expect(features.FORMAT_ENV_VARS['sing-box']).toBe('NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER');
      expect(features.FORMAT_ENV_VARS['loon']).toBe('NEXT_PUBLIC_ENABLE_LOON_TRANSFER');
    });
  });
});

describe('Converter Utils - Format Options', () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    originalEnv['NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER'] = process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER;
    originalEnv['NEXT_PUBLIC_ENABLE_LOON_TRANSFER'] = process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER;
    originalEnv['NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER'] = process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
    originalEnv['NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER'] = process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  describe('getInputFormatOptions()', () => {
    it('should return all format options when all enabled', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      // Mock translation function
      const mockT = vi.fn((key: string) => key);
      const options = getInputFormatOptions(mockT);

      expect(options.length).toBe(6);
      expect(options.map(o => o.value)).toEqual([
        'txt',
        'clash-meta',
        'clash-premium',
        'sing-box',
        'loon',
        'subscribe-url',
      ]);
    });

    it('should exclude disabled formats', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const mockT = vi.fn((key: string) => key);
      const options = getInputFormatOptions(mockT);

      expect(options.length).toBe(4);
      expect(options.map(o => o.value)).toEqual([
        'txt',
        'clash-meta',
        'clash-premium',
        'subscribe-url',
      ]);
    });
  });

  describe('getOutputFormatOptions()', () => {
    it('should return all format options except subscribe-url when all enabled', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const mockT = vi.fn((key: string) => key);
      const options = getOutputFormatOptions(mockT);

      // Should be 5 (all except subscribe-url)
      expect(options.length).toBe(5);
      expect(options.map(o => o.value)).toEqual([
        'txt',
        'clash-meta',
        'clash-premium',
        'sing-box',
        'loon',
      ]);
    });

    it('should exclude disabled formats and subscribe-url', () => {
      process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false';
      process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER = 'false';
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER;
      delete process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER;

      const mockT = vi.fn((key: string) => key);
      const options = getOutputFormatOptions(mockT);

      // Should be 3 (txt, clash-meta, clash-premium)
      expect(options.length).toBe(3);
      expect(options.map(o => o.value)).toEqual([
        'txt',
        'clash-meta',
        'clash-premium',
      ]);
    });
  });
});
