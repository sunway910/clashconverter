/**
 * Tests: Surfboard [Proxy Group] structure mirrors the Surge template,
 * with generator-side region filtering (Surfboard has no policy-regex-filter)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';
import { SURFBOARD_PROXY_GROUPS } from '@/lib/surfboard/config/surfboard-config';

// Import registry to auto-initialize
import '@/lib/core/registry';

describe('[Surfboard] Proxy Group structure (Surge-aligned)', () => {
  describe('SURFBOARD_PROXY_GROUPS configuration', () => {
    it('should keep 🟢 Proxy as the main select group', () => {
      const mainGroup = SURFBOARD_PROXY_GROUPS[0];
      expect(mainGroup.name).toBe('🟢 Proxy');
      expect(mainGroup.type).toBe('select');
      expect(mainGroup.proxies).toContain('♻️ 自动选择');
      expect(mainGroup.proxies).toContain('🚀 直接连接');
    });
  });

  describe('Generated Surfboard configuration', () => {
    let testInput: string;
    let generatedOutput: string;

    beforeEach(() => {
      // Sample input with region-named nodes
      testInput = [
        'ss://YWVzLTI1Ni1nY206ZzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#HKNode1',
        'ss://YWVzLTI1Ni1nY206ZzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNQ==#JPNode1',
        'ss://YWVzLTI1Ni1nY206ZzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNg==#USNode1',
        'vmess://eyJhZGQiOiIxNTQuMjMuMTkwLjE2MiIsInBzIjoiVGVzdFByb3h5MiIsInBvcnQiOjQ0MywiaWQiOiJiOTk4NDY3NC1mNzcxLTRlNjctYTE5OC1jN2U2MDcyMGJhMmMifQ==',
        'trojan://password@server.com:443#TrojanNode1',
        'http://user:pass@server.com:8080#HTTPNode1',
        'socks5://user:pass@server.com:1080#SOCKS5Node1',
        'hysteria2://password@server.com:443#Hysteria2Node1',
      ].join('\n');

      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);
      const generator = FormatFactory.createGenerator('surfboard');
      generatedOutput = generator.generate(parseResult.proxies);
    });

    it('should contain exactly ONE [Proxy Group] section header', () => {
      const matches = generatedOutput.match(/\[Proxy Group\]/g);
      expect(matches ? matches.length : 0).toBe(1);
    });

    it('should contain the main select group and matching region groups', () => {
      expect(generatedOutput).toContain('🟢 Proxy = select');
      expect(generatedOutput).toContain('♻️ 自动选择 = url-test');
      // Region groups expand matching nodes (input has HK/JP/US named nodes)
      expect(generatedOutput).toContain('🇭🇰 香港 = url-test, "HKNode1", url=');
      expect(generatedOutput).toContain('🇯🇵 日本 = url-test, "JPNode1", url=');
      expect(generatedOutput).toContain('🇺🇸 美国 = url-test, "USNode1", url=');
    });

    it('should prune region groups with no matching nodes', () => {
      // Input has no SG/KR/TW named nodes
      expect(generatedOutput).not.toContain('🇸🇬 新加坡');
      expect(generatedOutput).not.toContain('🇰🇷 韩国');
      expect(generatedOutput).not.toContain('🇨🇳 台湾');
      // References to pruned groups are removed from 🟢 Proxy
      expect(generatedOutput).toContain('🟢 Proxy = select, "♻️ 自动选择", "🇭🇰 香港", "🇺🇸 美国", "🇯🇵 日本", "🚀 直接连接"');
    });

    it('should contain all proxy names in [Proxy] section and ♻️ 自动选择', () => {
      expect(generatedOutput).toContain('HKNode1');
      expect(generatedOutput).toContain('JPNode1');
      expect(generatedOutput).toContain('USNode1');
      expect(generatedOutput).toContain('TestProxy2');
      expect(generatedOutput).toContain('TrojanNode1');
      expect(generatedOutput).toContain('HTTPNode1');
      expect(generatedOutput).toContain('SOCKS5Node1');
      expect(generatedOutput).toContain('Hysteria2Node1');

      // ♻️ 自动选择 (url-test over all nodes) includes every node
      expect(generatedOutput).toContain('"HKNode1", "JPNode1", "USNode1", "TestProxy2", "TrojanNode1", "HTTPNode1", "SOCKS5Node1", "Hysteria2Node1"');
    });

    it('should have valid Surfboard structure', () => {
      expect(generatedOutput).toContain('[General]');
      expect(generatedOutput).toContain('[Proxy]');
      expect(generatedOutput).toContain('[Proxy Group]');
      expect(generatedOutput).toContain('[Rule]');
    });
  });
});
