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
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/LocalAreaNetwork.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/UnBan.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list,🛑 广告拦截',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanProgramAD.list,🍃 应用净化',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/GoogleFCM.list,📢 谷歌FCM',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/GoogleCN.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/SteamCN.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Bing.list,Ⓜ️ 微软Bing',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/OneDrive.list,Ⓜ️ 微软云盘',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list,Ⓜ️ 微软服务',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list,🍎 苹果服务',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list,📲 电报消息',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/AI.list,💬 Ai平台',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list,💬 Ai平台',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/NetEaseMusic.list,🎶 网易音乐',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Epic.list,🎮 游戏平台',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Origin.list,🎮 游戏平台',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Sony.list,🎮 游戏平台',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Steam.list,🎮 游戏平台',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Nintendo.list,🎮 游戏平台',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list,📹 油管视频',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list,🎥 奈飞视频',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Bahamut.list,📺 巴哈姆特',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/BilibiliHMT.list,📺 哔哩哔哩',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Bilibili.list,📺 哔哩哔哩',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list,🌏 国内媒体',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list,🌍 国外媒体',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,🚀 节点选择',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaCompanyIp.list,🎯 全球直连',
  'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Download.list,🎯 全球直连',
];

// Local rules
export const LOON_RULES = [
  'GEOIP,CN,🎯 全球直连',
  'FINAL,🐟 漏网之鱼',
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

// Default proxy groups (matching expect.conf structure)
export const LOON_PROXY_GROUPS: LoonProxyGroupConfig[] = [
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
    name: '💬 Ai平台',
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
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/GlobalMedia.png',
  },
  {
    name: '🌏 国内媒体',
    type: 'select',
    proxies: ['DIRECT', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🚀 手动切换'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/DomesticMedia.png',
  },
  {
    name: '📢 谷歌FCM',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: 'Ⓜ️ 微软Bing',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: 'Ⓜ️ 微软云盘',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
  },
  {
    name: 'Ⓜ️ 微软服务',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Microsoft.png',
  },
  {
    name: '🍎 苹果服务',
    type: 'select',
    proxies: ['DIRECT', '🚀 节点选择', '🇺🇲 美国节点', '🇭🇰 香港节点', '🇨🇳 台湾节点', '🇸🇬 狮城节点', '🇯🇵 日本节点', '🇰🇷 韩国节点', '🚀 手动切换'],
    useAllProxies: false,
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Apple.png',
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
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Direct.png',
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
    img: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Final.png',
  },
  // Region node groups (will include all actual proxies)
  {
    name: '🇭🇰 香港节点',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
  {
    name: '🇯🇵 日本节点',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
  {
    name: '🇺🇲 美国节点',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
  {
    name: '🇸🇬 狮城节点',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
  {
    name: '🇨🇳 台湾节点',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
  {
    name: '🇰🇷 韩国节点',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
  {
    name: '🎥 奈飞节点',
    type: 'select',
    proxies: [],
    useAllProxies: true,
  },
];
