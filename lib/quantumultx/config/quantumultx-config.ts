/**
 * QuantumultX configuration constants
 * Contains General section, Policy types, and Rules for QuantumultX format
 */

// General section configuration for QuantumultX
export const QUANX_GENERAL = [
  'excluded_routes=192.168.0.0/16, 172.16.0.0/12, 100.64.0.0/10, 10.0.0.0/8',
  'geo_location_checker=http://ip-api.com/json/?lang=zh-CN',
  'network_check_url=http://www.baidu.com/',
];

// DNS section configuration for QuantumultX
export const QUANX_DNS = [
  'server=119.29.29.29',
  'server=223.5.5.5',
  'server=1.1.1.1',
  'server=8.8.8.8',
];

// Default rules for QuantumultX
export const QUANX_RULES = [
  'GEOIP,CN,🎯 全球直连',
  'FINAL,🐟 漏网之鱼',
];

// Remote rules URLs (using ACL4SSR rulesets)
export const QUANX_REMOTE_RULES = [
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,🚀 节点选择'
];

// Policy types for QuantumultX
export type QuanxPolicyType = 'static' | 'url-latency-benchmark' | 'available' | 'round-robin';

// Proxy group configuration interface
export interface QuanxProxyGroupConfig {
  name: string;
  type: QuanxPolicyType;
  url?: string;
  interval?: number;
  tolerance?: number;
  proxies: string[];
  useAllProxies?: boolean;
  img?: string; // img-url attribute
}

// Minimal proxy groups for QuantumultX - only 🚀 节点选择
export const QUANX_PROXY_GROUPS: QuanxProxyGroupConfig[] = [
  {
    name: '🚀 节点选择',
    type: 'static',
    proxies: [],
    useAllProxies: true,
  },
];
