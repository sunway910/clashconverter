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
  'dns-server = system, 223.5.5.5',
  'exclude-simple-hostnames = true',
  'enhanced-mode-by-rule = true',
];

// Empty remote sections (user can add custom remotes)
export const SURFBOARD_PROXY_REMOTE = '';
export const SURFBOARD_RULE_REMOTE = '';

// Local rule types supported by Surfboard
export const SURFBOARD_RULE_TYPES = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'SRC-IP-CIDR',
  'GEOIP',
  'MATCH',
  'FINAL',
  'IP-CIDR6',
  'PROCESS-NAME',
  'IN-PORT',
  'DEST-PORT',
  'SRC-IP',
];

// Default rules for Surfboard
export const SURFBOARD_RULES = [
  'GEOIP,CN,🎯 全球直连',
  'FINAL,🐟 漏网之鱼',
];

// Remote rules URLs (using ACL4SSR rulesets)
export const SURFBOARD_REMOTE_RULES = [
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
export const SURFBOARD_MITM: string[] = [];

// URL Rewrite section (empty - user can add custom rewrites)
export const SURFBOARD_URL_REWRITE: string[] = [];

// Header Rewrite section (empty - user can add custom rewrites)
export const SURFBOARD_HEADER_REWRITE: string[] = [];

// Script section (empty - user can add custom scripts)
export const SURFBOARD_SCRIPT: string[] = [];

// Host section (empty - user can add custom hosts)
export const SURFBOARD_HOST: string[] = [];

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

// Default proxy groups for Surfboard
export const SURFBOARD_PROXY_GROUPS: SurfboardProxyGroupConfig[] = [
  {
    name: '🚀 节点选择',
    type: 'select',
    proxies: ['🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🚀 手动切换',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
  {
    name: '📲 电报消息',
    type: 'select',
    proxies: ['🚀 节点选择', '🇸🇬 狮城节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '💬 Ai 平台',
    type: 'select',
    proxies: ['🚀 节点选择', '🇸🇬 狮城节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '📹 油管视频',
    type: 'select',
    proxies: ['🚀 节点选择', '🇸🇬 狮城节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🎥 奈飞视频',
    type: 'select',
    proxies: ['🎥 奈飞节点', '🚀 节点选择', '🇸🇬 狮城节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '📺 巴哈姆特',
    type: 'select',
    proxies: ['🇨🇳 台湾节点', '🚀 节点选择', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '📺 哔哩哔哩',
    type: 'select',
    proxies: ['🎯 全球直连', '🇨🇳 台湾节点', '🇭🇰 香港节点'],
    useAllProxies: false,
  },
  {
    name: '🌍 国外媒体',
    type: 'select',
    proxies: ['🚀 节点选择', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🌏 国内媒体',
    type: 'select',
    proxies: ['DIRECT', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: '📢 谷歌 FCM',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: 'Ⓜ️ 微软服务',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: '🍎 苹果服务',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: '🎮 游戏平台',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: '🎶 网易音乐',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择'],
    useAllProxies: false,
  },
  {
    name: '🎯 全球直连',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择'],
    useAllProxies: false,
  },
  {
    name: '🛑 广告拦截',
    type: 'select',
    proxies: ['REJECT', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🍃 应用净化',
    type: 'select',
    proxies: ['REJECT', 'DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🐟 漏网之鱼',
    type: 'select',
    proxies: ['🚀 节点选择', 'DIRECT', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇺🇲 美国节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  // Region node groups (empty placeholders - will be filled with actual nodes)
  {
    name: '🇭🇰 香港节点',
    type: 'select',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇯🇵 日本节点',
    type: 'select',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇺🇲 美国节点',
    type: 'select',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇸🇬 狮城节点',
    type: 'select',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇨🇳 台湾节点',
    type: 'select',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🇰🇷 韩国节点',
    type: 'select',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
  {
    name: '🎥 奈飞节点',
    type: 'select',
    proxies: ['DIRECT'],
    useAllProxies: false,
  },
];
