/**
 * Tests for feature flag module
 * TDD Phase: RED → GREEN
 */

import { describe, it, expect } from 'vitest';
import {
  isFormatEnabled,
  getEnabledFormats,
  ENABLED_FORMATS,
  ALL_FORMAT_TYPES,
  CONFIGURABLE_FORMATS,
} from './features';

describe('Feature Flags', () => {
  const CONFIGURABLE_FORMATS_ARRAY = ['clash-premium', 'clash-meta', 'sing-box', 'loon'] as const;
  const ALWAYS_ENABLED_FORMATS = ['txt', 'subscribe-url'] as const;

  describe('isFormatEnabled', () => {
    describe('always-enabled formats', () => {
      it.each(ALWAYS_ENABLED_FORMATS)('should return true for %s (always enabled)', (format) => {
        expect(isFormatEnabled(format)).toBe(true);
      });
    });

    describe('configurable formats', () => {
      it.each(CONFIGURABLE_FORMATS_ARRAY)(
        'should return true by default for %s when env var is not set',
        (format) => {
          expect(isFormatEnabled(format)).toBe(true);
        }
      );
    });

    it('should throw error for invalid format type', () => {
      expect(() => isFormatEnabled('invalid-format' as any)).toThrow('Unknown format type');
    });
  });

  describe('getEnabledFormats', () => {
    it('should return all formats by default when env vars are not set', () => {
      const enabledFormats = getEnabledFormats();

      expect(enabledFormats).toHaveLength(ALL_FORMAT_TYPES.length);
      expect(enabledFormats).toContain('txt');
      expect(enabledFormats).toContain('clash-meta');
      expect(enabledFormats).toContain('clash-premium');
      expect(enabledFormats).toContain('sing-box');
      expect(enabledFormats).toContain('loon');
      expect(enabledFormats).toContain('subscribe-url');
    });

    it('should always include txt and subscribe-url', () => {
      const enabledFormats = getEnabledFormats();

      expect(enabledFormats).toContain('txt');
      expect(enabledFormats).toContain('subscribe-url');
    });
  });

  describe('ENABLED_FORMATS constant', () => {
    it('should have boolean values for all configurable formats', () => {
      expect(typeof ENABLED_FORMATS['clash-meta']).toBe('boolean');
      expect(typeof ENABLED_FORMATS['clash-premium']).toBe('boolean');
      expect(typeof ENABLED_FORMATS['sing-box']).toBe('boolean');
      expect(typeof ENABLED_FORMATS['loon']).toBe('boolean');
    });

    it('should always have txt and subscribe-url as true', () => {
      expect(ENABLED_FORMATS['txt']).toBe(true);
      expect(ENABLED_FORMATS['subscribe-url']).toBe(true);
    });

    it.each(CONFIGURABLE_FORMATS_ARRAY)(
      'should have true value for %s when env var is not set',
      (format) => {
        expect(ENABLED_FORMATS[format]).toBe(true);
      }
    );
  });

  describe('exported constants', () => {
    it('should export ALL_FORMAT_TYPES constant', () => {
      expect(ALL_FORMAT_TYPES).toBeInstanceOf(Array);
      expect(ALL_FORMAT_TYPES).toContain('txt');
      expect(ALL_FORMAT_TYPES).toContain('subscribe-url');
    });

    it('should export CONFIGURABLE_FORMATS constant', () => {
      expect(CONFIGURABLE_FORMATS).toBeInstanceOf(Array);
      expect(CONFIGURABLE_FORMATS).not.toContain('txt');
      expect(CONFIGURABLE_FORMATS).not.toContain('subscribe-url');
      expect(CONFIGURABLE_FORMATS).toContain('clash-meta');
    });
  });

  describe('parseBooleanEnv behavior', () => {
    it('should default to enabled when env vars are not set', () => {
      // When env vars are not set, all configurable formats should be true
      CONFIGURABLE_FORMATS_ARRAY.forEach((format) => {
        expect(isFormatEnabled(format)).toBe(true);
      });
    });
  });
});
