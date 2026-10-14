/**
 * Tests for TUIC v5: link parsing, validation, and adapter output
 */

import { describe, it, expect } from 'vitest';
import { parseTuic } from '../../parsers/protocol-parsers';
import { parseProxyLink } from '../../parsers';
import { TuicAdapter } from '../../adapters/tuic-adapter';
import { isValidProxyNode } from '../../types/validators';

describe('TUIC v5', () => {
  const FULL_LINK =
    'tuic://uuid-123:pass%40word@tuic.example.com:8443?sni=example.com&alpn=h3&congestion_control=bbr&udp_relay_mode=native&allow_insecure=1&reduce-rtt=1#MyTUIC';

  describe('parseTuic', () => {
    it('should parse a full TUIC v5 link', () => {
      const parsed = parseTuic(FULL_LINK);
      expect(parsed).toBeTruthy();
      const config = parsed!.config as any;

      expect(parsed!.name).toBe('MyTUIC');
      expect(config.type).toBe('tuic');
      expect(config.server).toBe('tuic.example.com');
      expect(config.port).toBe(8443);
      expect(config.uuid).toBe('uuid-123');
      expect(config.password).toBe('pass@word');
      expect(config.sni).toBe('example.com');
      expect(config.alpn).toEqual(['h3']);
      expect(config['congestion-controller']).toBe('bbr');
      expect(config['udp-relay-mode']).toBe('native');
      expect(config['skip-cert-verify']).toBe(true);
      expect(config['reduce-rtt']).toBe(true);
      expect(config.udp).toBe(true);
    });

    it('should apply defaults for a bare link (port 443, default name, udp on)', () => {
      const parsed = parseTuic('tuic://u:p@1.2.3.4');
      expect(parsed).toBeTruthy();
      const config = parsed!.config as any;

      expect(parsed!.name).toBe('TUIC');
      expect(config.port).toBe(443);
      expect(config.udp).toBe(true);
      expect(config['skip-cert-verify']).toBe(false);
      expect(config.sni).toBeUndefined();
    });

    it('should reject legacy v4 token-only links', () => {
      expect(parseTuic('tuic://token-only@1.2.3.4:443#v4')).toBeNull();
    });

    it('should reject garbage', () => {
      expect(parseTuic('tuic://nouserinfo')).toBeNull();
    });

    it('should pass zod validation', () => {
      const parsed = parseTuic(FULL_LINK)!;
      expect(isValidProxyNode(parsed.config)).toBe(true);
    });

    it('should be reachable through parseProxyLink dispatch', () => {
      const parsed = parseProxyLink(FULL_LINK);
      expect(parsed).toBeTruthy();
      expect((parsed!.config as any).type).toBe('tuic');
    });
  });

  describe('TuicAdapter', () => {
    const adapter = new TuicAdapter();

    it('should emit Clash Meta fields', () => {
      const parsed = parseTuic(FULL_LINK)!;
      const clash = adapter.toClashJson(parsed.config) as any;

      expect(clash.type).toBe('tuic');
      expect(clash.uuid).toBe('uuid-123');
      expect(clash.password).toBe('pass@word');
      expect(clash.udp).toBe(true);
      expect(clash['congestion-controller']).toBe('bbr');
      expect(clash['udp-relay-mode']).toBe('native');
      expect(clash['reduce-rtt']).toBe(true);
      expect(clash['skip-cert-verify']).toBe(true);
      expect(clash.sni).toBe('example.com');
      expect(clash.alpn).toEqual(['h3']);
    });

    it('should emit Sing-Box fields with snake_case mapping', () => {
      const parsed = parseTuic(FULL_LINK)!;
      const sb = adapter.toSingBoxJson(parsed.config) as any;

      expect(sb.type).toBe('tuic');
      expect(sb.uuid).toBe('uuid-123');
      expect(sb.congestion_control).toBe('bbr');
      expect(sb.udp_relay_mode).toBe('native');
      expect(sb.zero_rtt_handshake).toBe(true);
      expect(sb.tls.enabled).toBe(true);
      expect(sb.tls.server_name).toBe('example.com');
      expect(sb.tls.insecure).toBe(true);
      expect(sb.tls.alpn).toEqual(['h3']);
    });

    it('should roundtrip through toLink -> parseTuic', () => {
      const parsed = parseTuic(FULL_LINK)!;
      const link = adapter.toLink(parsed.config);
      const reparsed = parseTuic(link)!;

      expect(reparsed).toBeTruthy();
      const config = reparsed.config as any;
      expect(config.uuid).toBe('uuid-123');
      expect(config.password).toBe('pass@word');
      expect(config['congestion-controller']).toBe('bbr');
      expect(config['udp-relay-mode']).toBe('native');
      expect(config['skip-cert-verify']).toBe(true);
    });
  });
});
