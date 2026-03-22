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
  'server=1.0.0.1',
  'server=8.8.8.8',
];

// Remote sections (empty - user can add custom remotes)
export const QUANX_SERVER_REMOTE = '';
export const QUANX_FILTER_REMOTE = '';
export const QUANX_REWRITE_REMOTE = '';

// Local rule types supported by QuantumultX
export const QUANX_RULE_TYPES = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'SRC-IP-CIDR',
  'GEOIP',
  'MATCH',
  'FINAL',
  'USER-AGENT',
  'HOST',
  'HOST-SUFFIX',
  'HOST-KEYWORD',
];

// Default rules for QuantumultX
export const QUANX_RULES = [
  'GEOIP,CN,🎯 全球直连',
  'FINAL,🐟 漏网之鱼',
];

// Remote rules URLs (using ACL4SSR rulesets)
export const QUANX_REMOTE_RULES = [
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/LocalAreaNetwork.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/UnBan.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list,🛑 广告拦截',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanProgramAD.list,🍃 应用净化',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/GoogleCN.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list,📲 电报消息',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/AI.list,💬 Ai 平台',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list,📹 油管视频',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list,🎥 奈飞视频',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/BilibiliHMT.list,📺 哔哩哔哩',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Bilibili.list,📺 哔哩哔哩',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list,🌏 国内媒体',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list,🌍 国外媒体',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,🚀 节点选择',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaCompanyIp.list,🎯 全球直连',
];

// MITM configuration (disabled by default)
export const QUANX_MITM: string[] = [];

// Rewrite section (empty - user can add custom rewrites)
export const QUANX_REWRITE_LOCAL: string[] = [];

// Host section (empty - user can add custom hosts)
export const QUANX_HOST_LOCAL: string[] = [];

// Script section (empty - user can add custom scripts)
export const QUANX_SCRIPT: string[] = [];

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

// Default proxy groups for QuantumultX
export const QUANX_PROXY_GROUPS: QuanxProxyGroupConfig[] = [
  {
    name: '🚀 节点选择',
    type: 'static',
    proxies: ['🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🚀 手动切换',
    type: 'static',
    proxies: [],
    useAllProxies: true,
  },
  {
    name: '📲 电报消息',
    type: 'static',
    proxies: ['🚀 节点选择', '🇸🇬 狮城节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '💬 Ai 平台',
    type: 'static',
    proxies: ['🚀 节点选择', '🇸🇬 狮城节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '📹 油管视频',
    type: 'static',
    proxies: ['🚀 节点选择', '🇸🇬 狮城节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🎥 奈飞视频',
    type: 'static',
    proxies: ['🎥 奈飞节点', '🚀 节点选择', '🇸🇬 狮城节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '📺 巴哈姆特',
    type: 'static',
    proxies: ['🇨🇳 台湾节点', '🚀 节点选择', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '📺 哔哩哔哩',
    type: 'static',
    proxies: ['🎯 全球直连', '🇨🇳 台湾节点', '🇭🇰 香港节点'],
    useAllProxies: false,
  },
  {
    name: '🌍 国外媒体',
    type: 'static',
    proxies: ['🚀 节点选择', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/GlobalMedia.png',
  },
  {
    name: '🌏 国内媒体',
    type: 'static',
    proxies: ['DIRECT', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🚀 手动切换'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/DomesticMedia.png',
  },
  {
    name: '📢 谷歌 FCM',
    type: 'static',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: 'Ⓜ️ 微软服务',
    type: 'static',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Microsoft.png',
  },
  {
    name: '🍎 苹果服务',
    type: 'static',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Apple.png',
  },
  {
    name: '🎮 游戏平台',
    type: 'static',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: '🎶 网易音乐',
    type: 'static',
    proxies: ['DIRECT', '🚀 节点选择'],
    useAllProxies: false,
  },
  {
    name: '🎯 全球直连',
    type: 'static',
    proxies: ['DIRECT', '🚀 节点选择'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Direct.png',
  },
  {
    name: '🛑 广告拦截',
    type: 'static',
    proxies: ['REJECT', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🍃 应用净化',
    type: 'static',
    proxies: ['REJECT', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🐟 漏网之鱼',
    type: 'static',
    proxies: ['🚀 节点选择', 'DIRECT', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Final.png',
  },
  // Region node groups (empty placeholders - will be filled with actual nodes)
  {
    name: '🇭🇰 香港节点',
    type: 'static',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇯🇵 日本节点',
    type: 'static',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇺🇲 美国节点',
    type: 'static',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇸🇬 狮城节点',
    type: 'static',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇨🇳 台湾节点',
    type: 'static',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇰🇷 韩国节点',
    type: 'static',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🎥 奈飞节点',
    type: 'static',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
];
