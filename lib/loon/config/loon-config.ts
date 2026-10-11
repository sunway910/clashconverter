/**
 * Loon configuration constants
 * Contains General section, Proxy Groups, and Rules for Loon format
 */

// General section configuration for Loon
export const LOON_GENERAL = [
  'allow-wifi-access=false',
  'bypass-tun=10.0.0.0/8, 100.64.0.0/10, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12, 192.0.0.0/24, 192.0.2.0/24, 192.88.99.0/24, 192.168.0.0/16, 198.51.100.0/24, 203.0.113.0/24, 224.0.0.0/4, 239.255.255.250/32, 255.255.255.255/32',
  'disable-stun=true',
  'disconnect-on-policy-change=true',
  'dns-server=119.29.29.29, 223.5.5.5, 1.1.1.1, 8.8.8.8',
  'doh-server=https://223.5.5.5/resolve, https://sm2.doh.pub/dns-query',
  'geoip-url=https://gitlab.com/Masaiki/GeoIP2-CN/-/raw/release/Country.mmdb',
  'interface-mode=auto',
  'ipv6=true',
  'proxy-test-url=http://connectivitycheck.gstatic.com',
  'resource-parser=https://gitlab.com/lodepuly/vpn_tool/-/raw/main/Resource/Script/Sub-Store/sub-store-parser_for_loon.js',
  'skip-proxy=192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost, *.local, captive.apple.com, e.crashlynatics.com',
  'sni-sniffing=true',
  'ssid-trigger="Ccccccc":DIRECT,"cellular":RULE,"default":RULE',
  'switch-node-after-failure-times=3',
  'test-timeout=2',
  'wifi-access-http-port=7222',
  'wifi-access-socks5-port=7221',
];

// Empty remote sections (as shown in expect.conf)
export const LOON_REMOTE_PROXY = '';
export const LOON_REMOTE_FILTER = '';

// Remote rule URLs
export const LOON_REMOTE_RULES = [
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,🚀 节点选择'
];

// Local rules (minimal groups: built-in DIRECT for CN traffic, single select group as final)
export const LOON_RULES = [
  'GEOIP,CN,DIRECT',
  'FINAL,🚀 节点选择',
];

// Script configurations (empty - user can add custom scripts)
export const LOON_SCRIPTS: string[] = [];

// MITM (Man-in-the-Middle) configuration
// NOTE: MITM is disabled by default for basic proxy usage.
// It's only needed for advanced features like:
// - HTTPS traffic inspection and debugging
// - Script-based request/response modification
// - URL rewriting and header modification
// If you only need basic proxy features (routing, streaming unlock),
// you can safely ignore this section.
export const LOON_MITM: string[] = [];

// Rewrite section (empty in expect.conf)
export const LOON_REWRITE = '';

// Host section (empty in expect.conf)
export const LOON_HOST = '';

// Proxy group configuration interface
export interface LoonProxyGroupConfig {
  name: string;
  type: string;
  url?: string;
  interval?: number;
  tolerance?: number;
  proxies: string[];
  useAllProxies?: boolean;
  img?: string; // img-url attribute
}

// Minimal proxy groups - only 🚀 节点选择
export const LOON_PROXY_GROUPS: LoonProxyGroupConfig[] = [
  {
    name: '🚀 节点选择',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
];
