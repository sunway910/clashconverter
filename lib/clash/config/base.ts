// Kernel flavor for generated Clash configuration.
// - meta: Clash Meta (mihomo) — full feature set (include-all groups, unified-delay, ...)
// - premium: Clash Premium (legacy core) — mihomo-only fields stripped
export type ClashKernel = 'meta' | 'premium';

// Header banner lines
export const HEADER_BANNER = [
  '#',
  '#-------------------------------------------------------------#',
  '#  author：https://clashconverter.com',
];

// Footer banner lines
export const FOOTER_BANNER = [
  '#-------------------------------------------------------------#',
  '#',
];

// Basic configuration (Clash Meta / mihomo)
export const BASIC_CONFIG = [
  'mixed-port: 7890',
  'allow-lan: false',
  'mode: rule',
  'log-level: info',
  'ipv6: false',
  'unified-delay: true',
  'tcp-concurrent: true',
  'find-process-mode: strict',
  'profile:',
  '  store-selected: true',
  '  store-fake-ip: true',
  '',
];

// Basic configuration (Clash Premium — mihomo-only fields removed)
export const BASIC_CONFIG_PREMIUM = [
  'mixed-port: 7890',
  'allow-lan: false',
  'mode: rule',
  'log-level: info',
  'ipv6: false',
  'profile:',
  '  store-selected: true',
  '  store-fake-ip: true',
  '',
];

// DNS configuration: fake-ip + domestic resolvers only.
// Proxied domains are resolved remotely by the node, so no fallback block is needed.
export const DNS_CONFIG = [
  'dns:',
  '  enable: true',
  '  ipv6: false',
  '  enhanced-mode: fake-ip',
  '  fake-ip-range: 198.18.0.1/16',
  '  fake-ip-filter:',
  '    - "*.lan"',
  '    - "*.local"',
  '    - "*.localdomain"',
  '    - "*.localhost"',
  '    - "*.home.arpa"',
  '    - "+.msftncsi.com"',
  '    - "+.msftconnecttest.com"',
  '    - "network-test.debian.org"',
  '    - "detectportal.firefox.com"',
  '    - "captive.apple.com"',
  '    - "resolver1.opendns.com"',
  '    - "+.ipv6.microsoft.com"',
  '    - "+.srv.nintendo.net"',
  '    - "+.stun.playstation.net"',
  '    - "xbox.*.microsoft.com"',
  '    - "+.xboxlive.com"',
  '    - "+.turn.twilio.com"',
  '    - "+.stun.twilio.com"',
  '    - "stun.syncthing.net"',
  '    - "stun.*.*"',
  '    - "stun.*.*.*"',
  '    - "controlplane.tailscale.com"',
  '    - "time.*.com"',
  '    - "time.*.gov"',
  '    - "time.*.edu.cn"',
  '    - "time.*.apple.com"',
  '    - "ntp.*.com"',
  '    - "+.time.edu.cn"',
  '    - "+.ntp.org.cn"',
  '    - "+.pool.ntp.org"',
  '    - "time1.cloud.tencent.com"',
  '    - "localhost.ptlogin2.qq.com"',
  '    - "localhost.sec.qq.com"',
  '    - "localhost.work.weixin.qq.com"',
  '    - "+.battlenet.com.cn"',
  '    - "+.blzstatic.cn"',
  '    - "+.battlenet.com"',
  '  default-nameserver:',
  '    - 223.5.5.5',
  '    - 119.29.29.29',
  '  nameserver:',
  '    - 223.5.5.5',
  '    - 119.29.29.29',
  '',
];

// Meta-only DNS tail: dedicated resolver for proxy-server (airport) domains
export const DNS_CONFIG_META_EXTRA = [
  '  # 解析机场节点域名用的 DNS',
  '  proxy-server-nameserver:',
  '    - 223.5.5.5',
  '    - 119.29.29.29',
  '',
];

// Rule providers: remote rulesets (adapted from forecho/proxy-config-templates).
// Sukka (ruleset.skk.moe) provides Clash-specific formats: domainset uses `domain` behavior,
// non_ip / ip use `classical`.
export interface RuleProviderConfig {
  type: string;
  behavior: string;
  format: string;
  url: string;
  path: string;
  interval: number;
}

const BLACKMATRIX7_BASE = 'https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash';
const SUKKA_BASE = 'https://ruleset.skk.moe/Clash';

function httpProvider(url: string, file: string, behavior: 'domain' | 'classical' = 'classical'): RuleProviderConfig {
  return { type: 'http', behavior, format: 'text', url, path: `./rules/${file}`, interval: 86400 };
}

export const RULE_PROVIDERS_CONFIG: Record<string, RuleProviderConfig> = {
  youtube: httpProvider(`${BLACKMATRIX7_BASE}/YouTube/YouTube.list`, 'youtube.list'),
  google: httpProvider(`${BLACKMATRIX7_BASE}/Google/Google.list`, 'google.list'),
  reject_domainset: httpProvider(`${SUKKA_BASE}/domainset/reject.txt`, 'reject_domainset.txt', 'domain'),
  reject_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/reject.txt`, 'reject_non_ip.txt'),
  reject_drop_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/reject-drop.txt`, 'reject_drop_non_ip.txt'),
  speedtest_domainset: httpProvider(`${SUKKA_BASE}/domainset/speedtest.txt`, 'speedtest_domainset.txt', 'domain'),
  cdn_domainset: httpProvider(`${SUKKA_BASE}/domainset/cdn.txt`, 'cdn_domainset.txt', 'domain'),
  cdn_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/cdn.txt`, 'cdn_non_ip.txt'),
  download_domainset: httpProvider(`${SUKKA_BASE}/domainset/download.txt`, 'download_domainset.txt', 'domain'),
  download_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/download.txt`, 'download_non_ip.txt'),
  icloud_private_relay_domainset: httpProvider(`${SUKKA_BASE}/domainset/icloud_private_relay.txt`, 'icloud_private_relay_domainset.txt', 'domain'),
  apple_cdn_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/apple_cdn.txt`, 'apple_cdn_non_ip.txt'),
  apple_cn_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/apple_cn.txt`, 'apple_cn_non_ip.txt'),
  apple_services_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/apple_services.txt`, 'apple_services_non_ip.txt'),
  microsoft_cdn_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/microsoft_cdn.txt`, 'microsoft_cdn_non_ip.txt'),
  microsoft_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/microsoft.txt`, 'microsoft_non_ip.txt'),
  stream_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/stream.txt`, 'stream_non_ip.txt'),
  stream_ip: httpProvider(`${SUKKA_BASE}/ip/stream.txt`, 'stream_ip.txt'),
  telegram_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/telegram.txt`, 'telegram_non_ip.txt'),
  telegram_ip: httpProvider(`${SUKKA_BASE}/ip/telegram.txt`, 'telegram_ip.txt'),
  ai_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/ai.txt`, 'ai_non_ip.txt'),
  global_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/global.txt`, 'global_non_ip.txt'),
  domestic_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/domestic.txt`, 'domestic_non_ip.txt'),
  direct_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/direct.txt`, 'direct_non_ip.txt'),
  lan_non_ip: httpProvider(`${SUKKA_BASE}/non_ip/lan.txt`, 'lan_non_ip.txt'),
  reject_ip: httpProvider(`${SUKKA_BASE}/ip/reject.txt`, 'reject_ip.txt'),
  lan_ip: httpProvider(`${SUKKA_BASE}/ip/lan.txt`, 'lan_ip.txt'),
  domestic_ip: httpProvider(`${SUKKA_BASE}/ip/domestic.txt`, 'domestic_ip.txt'),
  china_ip: httpProvider(`${SUKKA_BASE}/ip/china_ip.txt`, 'china_ip.txt'),
};

// Proxy group templates
export interface ProxyGroupConfig {
  name: string;
  type: string;
  url?: string;
  interval?: number;
  tolerance?: number;
  /** Regex filter over all proxies (requires includeAll, mihomo only) */
  filter?: string;
  /** Include every generated proxy + provider (mihomo only) */
  includeAll?: boolean;
  /** Group is only emitted for the meta kernel */
  metaOnly?: boolean;
  /** Append all proxy names to this group (both kernels) */
  useAllProxies?: boolean;
  /** Append all proxy names to this group (premium kernel only) */
  premiumUseAllProxies?: boolean;
  proxies: string[];
}

const TEST_URL = 'http://www.gstatic.com/generate_204';
const TEST_INTERVAL = 300;
const TEST_TOLERANCE = 50;

// Region group: auto-select the lowest-latency node matching the regex (mihomo only)
function regionGroup(name: string, filter: string): ProxyGroupConfig {
  return {
    name,
    type: 'url-test',
    includeAll: true,
    filter,
    url: TEST_URL,
    interval: TEST_INTERVAL,
    tolerance: TEST_TOLERANCE,
    metaOnly: true,
    proxies: [],
  };
}

export const PROXY_GROUPS_CONFIG: ProxyGroupConfig[] = [
  {
    // ===== 总出口 =====
    name: '🟢 Proxy',
    type: 'select',
    premiumUseAllProxies: true,
    proxies: ['♻️ 自动选择', '🇭🇰 香港', '🇺🇸 美国', '🇯🇵 日本', '🇸🇬 新加坡', '🇰🇷 韩国', '🇨🇳 台湾', '🚀 直接连接'],
  },
  {
    // ===== 自动选择 =====
    name: '♻️ 自动选择',
    type: 'url-test',
    includeAll: true,
    url: TEST_URL,
    interval: TEST_INTERVAL,
    tolerance: TEST_TOLERANCE,
    premiumUseAllProxies: true,
    proxies: [],
  },
  // ===== 地区分组 =====
  regionGroup('🇭🇰 香港', 'HongKong|HK|香港|🇭🇰'),
  regionGroup('🇺🇸 美国', 'US|America|美|🇺🇸'),
  regionGroup('🇯🇵 日本', 'JP|Japan|日本|🇯🇵'),
  regionGroup('🇸🇬 新加坡', 'Singapore|SG|新加坡|🇸🇬'),
  regionGroup('🇰🇷 韩国', 'Korea|KR|韩国|🇰🇷'),
  regionGroup('🇨🇳 台湾', 'TW|Taiwan|台湾|🇨🇳|🇹🇼'),
  // ===== 业务分组 =====
  {
    name: '⛔️ 广告拦截',
    type: 'select',
    proxies: ['REJECT', '🚀 直接连接'],
  },
  {
    name: '🌍 国外媒体',
    type: 'select',
    proxies: ['🟢 Proxy', '🇺🇸 美国', '🇯🇵 日本', '🇸🇬 新加坡', '🇭🇰 香港', '🇰🇷 韩国', '🇨🇳 台湾'],
  },
  {
    name: '📺 谷歌服务',
    type: 'select',
    proxies: ['🇰🇷 韩国', '🇨🇳 台湾', '🇯🇵 日本', '🇸🇬 新加坡', '🇭🇰 香港', '🇺🇸 美国', '🟢 Proxy'],
  },
  {
    name: 'Ⓜ️ 微软服务',
    type: 'select',
    proxies: ['🟢 Proxy', '🚀 直接连接', '🇺🇸 美国', '🇯🇵 日本', '🇸🇬 新加坡', '🇭🇰 香港', '🇰🇷 韩国', '🇨🇳 台湾'],
  },
  {
    name: '🤖 AIGC',
    type: 'select',
    proxies: ['🇸🇬 新加坡', '🟢 Proxy', '🇺🇸 美国', '🇯🇵 日本', '🇭🇰 香港', '🇰🇷 韩国', '🇨🇳 台湾'],
  },
  {
    name: '📲 电报信息',
    type: 'select',
    proxies: ['🟢 Proxy', '🇺🇸 美国', '🇯🇵 日本', '🇸🇬 新加坡', '🇭🇰 香港', '🇰🇷 韩国', '🇨🇳 台湾'],
  },
  {
    name: '🍎 苹果服务',
    type: 'select',
    proxies: ['🚀 直接连接', '🟢 Proxy', '🇺🇸 美国', '🇯🇵 日本', '🇸🇬 新加坡', '🇭🇰 香港', '🇰🇷 韩国', '🇨🇳 台湾'],
  },
  {
    name: '🚀 直接连接',
    type: 'select',
    proxies: ['DIRECT'],
  },
  {
    name: '🐟 漏网之鱼',
    type: 'select',
    proxies: ['🟢 Proxy', '🚀 直接连接'],
  },
];
