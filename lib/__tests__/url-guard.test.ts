/**
 * Unit tests for the SSRF guard used by /api/subscription
 */

import { describe, it, expect } from 'vitest';
import { isBlockedSubscriptionHost, isBlockedSubscriptionUrl } from '../url-guard';

describe('blocked IPv4 targets', () => {
  it('rejects loopback and unspecified addresses', () => {
    expect(isBlockedSubscriptionHost('127.0.0.1')).toBe(true);
    expect(isBlockedSubscriptionHost('127.8.8.8')).toBe(true);
    expect(isBlockedSubscriptionHost('0.0.0.0')).toBe(true);
  });

  it('rejects private ranges', () => {
    expect(isBlockedSubscriptionHost('10.0.0.1')).toBe(true);
    expect(isBlockedSubscriptionHost('172.16.0.1')).toBe(true);
    expect(isBlockedSubscriptionHost('172.31.255.255')).toBe(true);
    expect(isBlockedSubscriptionHost('192.168.1.1')).toBe(true);
    expect(isBlockedSubscriptionHost('100.64.0.1')).toBe(true);
  });

  it('rejects link-local including the cloud metadata endpoint', () => {
    expect(isBlockedSubscriptionHost('169.254.169.254')).toBe(true);
    expect(isBlockedSubscriptionHost('169.254.0.1')).toBe(true);
  });

  it('allows public addresses', () => {
    expect(isBlockedSubscriptionHost('8.8.8.8')).toBe(false);
    expect(isBlockedSubscriptionHost('1.1.1.1')).toBe(false);
    expect(isBlockedSubscriptionHost('172.32.0.1')).toBe(false);
  });
});

describe('blocked IPv6 targets', () => {
  it('rejects loopback and unspecified', () => {
    expect(isBlockedSubscriptionHost('::1')).toBe(true);
    expect(isBlockedSubscriptionHost('::')).toBe(true);
  });

  it('rejects link-local and unique-local ranges', () => {
    expect(isBlockedSubscriptionHost('fe80::1')).toBe(true);
    expect(isBlockedSubscriptionHost('febf::1')).toBe(true);
    expect(isBlockedSubscriptionHost('fc00::1')).toBe(true);
    expect(isBlockedSubscriptionHost('fd12:3456::1')).toBe(true);
  });

  it('rejects IPv4-mapped IPv6 spellings of private addresses', () => {
    expect(isBlockedSubscriptionHost('::ffff:10.0.0.1')).toBe(true);
    expect(isBlockedSubscriptionHost('::ffff:127.0.0.1')).toBe(true);
    expect(isBlockedSubscriptionHost('::ffff:169.254.169.254')).toBe(true);
  });

  it('allows public IPv6', () => {
    expect(isBlockedSubscriptionHost('2606:4700::1111')).toBe(false);
    expect(isBlockedSubscriptionHost('::ffff:8.8.8.8')).toBe(false);
  });
});

describe('blocked hostnames', () => {
  it('rejects localhost spellings and local suffixes', () => {
    expect(isBlockedSubscriptionHost('localhost')).toBe(true);
    expect(isBlockedSubscriptionHost('ip6-localhost')).toBe(true);
    expect(isBlockedSubscriptionHost('printer.local')).toBe(true);
    expect(isBlockedSubscriptionHost('db.internal')).toBe(true);
    expect(isBlockedSubscriptionHost('nas.lan')).toBe(true);
  });

  it('allows regular hostnames', () => {
    expect(isBlockedSubscriptionHost('example.com')).toBe(false);
    expect(isBlockedSubscriptionHost('sub.example.org')).toBe(false);
  });
});

describe('URL wrapper', () => {
  it('delegates to the hostname check', () => {
    expect(isBlockedSubscriptionUrl(new URL('http://localhost:8080/sub'))).toBe(true);
    expect(isBlockedSubscriptionUrl(new URL('https://example.com/sub'))).toBe(false);
  });
});
