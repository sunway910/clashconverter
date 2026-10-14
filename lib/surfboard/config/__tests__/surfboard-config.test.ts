/**
 * Unit tests for Surfboard configuration constants
 * Verifies the full Surge-aligned proxy group structure
 */

import { describe, it, expect } from 'vitest';
import { SURFBOARD_PROXY_GROUPS } from '../surfboard-config';

describe('[Surfboard Config] Proxy Groups', () => {
  it('should mirror the Surge group structure', () => {
    const groupNames = SURFBOARD_PROXY_GROUPS.map(g => g.name);
    expect(groupNames).toEqual([
      '🟢 Proxy',
      '♻️ 自动选择',
      '🇭🇰 香港',
      '🇺🇸 美国',
      '🇯🇵 日本',
      '🇸🇬 新加坡',
      '🇰🇷 韩国',
      '🇨🇳 台湾',
      '⛔️ 广告拦截',
      '🌍 国外媒体',
      '📺 谷歌服务',
      'Ⓜ️ 微软服务',
      '🤖 AIGC',
      '📲 电报信息',
      '🍎 苹果服务',
      '🚀 直接连接',
      '🐟 漏网之鱼',
    ]);
  });

  it('should configure ♻️ 自动选择 as a url-test group over all proxies', () => {
    const autoGroup = SURFBOARD_PROXY_GROUPS.find(g => g.name === '♻️ 自动选择');
    expect(autoGroup).toBeTruthy();
    expect(autoGroup!.type).toBe('url-test');
    expect(autoGroup!.useAllProxies).toBe(true);
    expect(autoGroup!.url).toBe('http://www.gstatic.com/generate_204');
    expect(autoGroup!.interval).toBe(300);
    expect(autoGroup!.tolerance).toBe(50);
  });

  it('should configure region groups with node-name filters', () => {
    const hk = SURFBOARD_PROXY_GROUPS.find(g => g.name === '🇭🇰 香港');
    expect(hk).toBeTruthy();
    expect(hk!.type).toBe('url-test');
    expect(hk!.filter).toBe('HongKong|HK|香港|🇭🇰');
    expect(hk!.useAllProxies).toBe(true);
  });

  it('should use only Surfboard-supported group types', () => {
    const allowed = new Set(['select', 'url-test', 'fallback', 'load-balance']);
    expect(SURFBOARD_PROXY_GROUPS.every(g => allowed.has(g.type))).toBe(true);
  });
});
