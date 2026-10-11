/**
 * Unit tests for shared share-link parameter helpers
 */

import { describe, it, expect } from 'vitest';
import {
  buildGrpcOpts,
  buildH2Opts,
  buildSsPlugin,
  buildWsOpts,
  isTruthyParam,
  parseAlpn,
  parseFingerprint,
} from '../../parsers/link-params';

describe('isTruthyParam', () => {
  it('accepts true/1 case-insensitively', () => {
    expect(isTruthyParam('true')).toBe(true);
    expect(isTruthyParam('1')).toBe(true);
    expect(isTruthyParam('TRUE')).toBe(true);
    expect(isTruthyParam('0')).toBe(false);
    expect(isTruthyParam('false')).toBe(false);
    expect(isTruthyParam(undefined)).toBe(false);
  });
});

describe('parseFingerprint / parseAlpn', () => {
  it('supports fp / client-fingerprint / fingerprint keys', () => {
    expect(parseFingerprint({ fp: 'chrome' })).toBe('chrome');
    expect(parseFingerprint({ 'client-fingerprint': 'firefox' })).toBe('firefox');
    expect(parseFingerprint({ fingerprint: 'safari' })).toBe('safari');
    expect(parseFingerprint({})).toBeUndefined();
  });

  it('splits and cleans comma separated ALPN values', () => {
    expect(parseAlpn({ alpn: 'h3, h2 ,' })).toEqual(['h3', 'h2']);
    expect(parseAlpn({})).toBeUndefined();
    expect(parseAlpn({ alpn: ' , ' })).toBeUndefined();
  });
});

describe('buildWsOpts', () => {
  it('maps path and Host header', () => {
    expect(buildWsOpts({ path: '/ws', host: 'a.com' })).toEqual({
      path: '/ws',
      headers: { Host: 'a.com' },
    });
  });

  it('maps early data via the ed shorthand', () => {
    expect(buildWsOpts({ path: '/', ed: '2048', 'early-data-header-name': 'Sec-WebSocket-Protocol' })).toEqual({
      path: '/',
      'max-early-data': 2048,
      'early-data-header-name': 'Sec-WebSocket-Protocol',
    });
  });

  it('returns undefined when nothing is set', () => {
    expect(buildWsOpts({})).toBeUndefined();
  });
});

describe('buildGrpcOpts', () => {
  it('prefers serviceName and falls back to path', () => {
    expect(buildGrpcOpts({ serviceName: 'svc' })).toEqual({ 'grpc-service-name': 'svc' });
    expect(buildGrpcOpts({ path: 'fallback' })).toEqual({ 'grpc-service-name': 'fallback' });
    expect(buildGrpcOpts({})).toBeUndefined();
  });
});

describe('buildH2Opts', () => {
  it('maps host list and path', () => {
    expect(buildH2Opts({ host: 'a.com,b.com', path: '/h2' })).toEqual({
      host: ['a.com', 'b.com'],
      path: '/h2',
    });
    expect(buildH2Opts({})).toBeUndefined();
  });
});

describe('buildSsPlugin', () => {
  it('parses obfs-local plugin params', () => {
    expect(buildSsPlugin('obfs-local;obfs=http;obfs-host=example.com')).toEqual({
      plugin: 'obfs',
      'plugin-opts': { mode: 'http', host: 'example.com' },
    });
  });

  it('parses v2ray-plugin with tls flag', () => {
    expect(buildSsPlugin('v2ray-plugin;mode=websocket;path=/ws;tls')).toEqual({
      plugin: 'v2ray-plugin',
      'plugin-opts': { mode: 'websocket', path: '/ws', tls: true },
    });
  });

  it('returns undefined for unknown plugins', () => {
    expect(buildSsPlugin('unknown-plugin;x=1')).toBeUndefined();
    expect(buildSsPlugin(undefined)).toBeUndefined();
  });
});
