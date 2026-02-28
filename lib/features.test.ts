/**
 * Tests for feature flag module
 * TDD Phase: RED → GREEN
 */

import { describe, it, expect } from 'vitest';
import {
  isFormatEnabled,
  getEnabledFormats,
  ENABLED_FORMATS,
} from './features';

describe('Feature Flags', () => {
  describe('isFormatEnabled', () => {
    it('should return true for txt format (always enabled)', () => {
      expect(isFormatEnabled('txt')).toBe(true);
    });

    it('should return true for subscribe-url format (always enabled)', () => {
      expect(isFormatEnabled('subscribe-url')).toBe(true);
    });

    it('should return true by default for clash-premium when env var is not set', () => {
      expect(isFormatEnabled('clash-premium')).toBe(true);
    });

    it('should return true by default for clash-meta when env var is not set', () => {
      expect(isFormatEnabled('clash-meta')).toBe(true);
    });

    it('should return true by default for sing-box when env var is not set', () => {
      expect(isFormatEnabled('sing-box')).toBe(true);
    });

    it('should return true by default for loon when env var is not set', () => {
      expect(isFormatEnabled('loon')).toBe(true);
    });

    it('should throw error for invalid format type', () => {
      expect(() =>
        isFormatEnabled('invalid-format' as any)
      ).toThrow('Unknown format type');
    });
  });

  describe('getEnabledFormats', () => {
    it('should return all formats by default when env vars are not set', () => {
      const enabledFormats = getEnabledFormats();

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

    it('should have true for all formats when env vars are not set', () => {
      expect(ENABLED_FORMATS['clash-meta']).toBe(true);
      expect(ENABLED_FORMATS['clash-premium']).toBe(true);
      expect(ENABLED_FORMATS['sing-box']).toBe(true);
      expect(ENABLED_FORMATS['loon']).toBe(true);
    });
  });

  describe('parseBooleanEnv helper', () => {
    it('should parse environment variable values correctly via ENABLED_FORMATS', () => {
      // When env vars are not set, all should be true (default behavior)
      expect(ENABLED_FORMATS['clash-meta']).toBe(true);
      expect(ENABLED_FORMATS['clash-premium']).toBe(true);
      expect(ENABLED_FORMATS['sing-box']).toBe(true);
      expect(ENABLED_FORMATS['loon']).toBe(true);
    });
  });
});
