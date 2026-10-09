/**
 * Surfboard configuration constants
 * Contains General section, Proxy Groups, and Rules for Surfboard format
 *
 * Surfboard uses Surge-like format with surge_ver = -3 (special identifier for Surfboard)
 * Reference: subconverter implementation
 */

// General section configuration for Surfboard
export const SURFBOARD_GENERAL = [
  'loglevel = notify',
  'interface = 127.0.0.1',
  'skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, localhost, *.local',
  'ipv6 = false',
  'dns-server = system, 223.5.5.5, 1.1.1.1, 8.8.8.8',
  'exclude-simple-hostnames = true',
  'enhanced-mode-by-rule = true',
];

// Default rules for Surfboard
export const SURFBOARD_RULES = [
  'GEOIP,CN,🎯 全球直连',
  'FINAL,🐟 漏网之鱼',
];

// Remote rules URLs (using ACL4SSR rulesets)
export const SURFBOARD_REMOTE_RULES = [
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,🚀 节点选择'
];

// Policy types for Surfboard (Surge-compatible)
export type SurfboardPolicyType = 'select' | 'url-test' | 'fallback' | 'load-balance';

// Proxy group configuration interface
export interface SurfboardProxyGroupConfig {
  name: string;
  type: SurfboardPolicyType;
  url?: string;
  interval?: number;
  tolerance?: number;
  proxies: string[];
  useAllProxies?: boolean;
}

// Minimal proxy groups - only 🚀 节点选择
export const SURFBOARD_PROXY_GROUPS: SurfboardProxyGroupConfig[] = [
  {
    name: '🚀 节点选择',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
];
