/**
 * Surfboard configuration constants
 * Mirrors the Surge template structure (same group names / rule sources),
 * adapted to Surfboard-compatible syntax:
 * - `url-test` groups instead of Surge 5.8+ `smart` groups
 * - region filtering applied generator-side (no policy-regex-filter dependency)
 * - no Surge-only params (extended-matching, dns-failed, %APPEND%)
 */

// [General] section lines (Surge-compatible keys, conservative subset)
export const SURFBOARD_GENERAL = [
  'loglevel = notify',
  'skip-proxy = 127.0.0.0/8, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, 162.14.0.0/16, 211.99.96.0/19, 162.159.192.0/24, 162.159.193.0/24, 162.159.195.0/24, fc00::/7, fe80::/10, localhost, *.local, captive.apple.com, passenger.t3go.cn, *.ccb.com, wxh.wo.cn, *.abcchina.com, *.abcchina.com.cn',
  'exclude-simple-hostnames = true',
  'always-real-ip = *.lan, *.localdomain, *.localhost, *.home.arpa, msftncsi.com, msftconnecttest.com, *.msftncsi.com, *.msftconnecttest.com, network-test.debian.org, detectportal.firefox.com, resolver1.opendns.com, *.ipv6.microsoft.com, *.srv.nintendo.net, *.stun.playstation.net, xbox.*.microsoft.com, *.xboxlive.com, turn.twilio.com, *.turn.twilio.com, stun.twilio.com, *.stun.twilio.com, stun.syncthing.net, stun.*.*, stun.*.*.*, controlplane.tailscale.com, time.*.com, time.*.gov, time.*.edu.cn, time.*.apple.com, time1.*.com, time2.*.com, time3.*.com, time4.*.com, time5.*.com, time6.*.com, time7.*.com, time8.*.com, time9.*.com, ntp.*.com, ntp1.*.com, ntp2.*.com, ntp3.*.com, ntp4.*.com, ntp5.*.com, ntp6.*.com, ntp7.*.com, *.time.edu.cn, *.ntp.org.cn, *.pool.ntp.org, time1.cloud.tencent.com, local.adguard.org, injections.adguard.org, localhost.ptlogin2.qq.com, localhost.sec.qq.com, localhost.work.weixin.qq.com, PDC._msDCS.*.*, DC._msDCS.*.*, GC._msDCS.*.*, *.battlenet.com.cn, *.blzstatic.cn, *.battlenet.com',
  'ipv6 = false',
  'test-timeout = 2',
  'proxy-test-url = http://www.gstatic.com/generate_204',
  'internet-test-url = http://wifi.vivo.com.cn/generate_204',
  'dns-server = 223.5.5.5, 1.1.1.1, 8.8.8.8, system',
];

// Policy types for Surfboard (Surge-compatible)
export type SurfboardPolicyType = 'select' | 'url-test' | 'fallback' | 'load-balance';

// Proxy group configuration interface
export interface SurfboardProxyGroupConfig {
  name: string;
  type: SurfboardPolicyType;
  /** Static policy references (group names or built-in policies) */
  proxies: string[];
  /** Expand all converted proxy node names into the group */
  useAllProxies?: boolean;
  /** Regex over node names — generator expands matching nodes only (Surfboard has no policy-regex-filter) */
  filter?: string;
  url?: string;
  interval?: number;
  tolerance?: number;
  /** Comment lines (empty string = blank line) emitted before this group */
  commentBefore?: string[];
}

const TEST_URL = 'http://www.gstatic.com/generate_204';
const TEST_INTERVAL = 300;
const TEST_TOLERANCE = 50;

// Region group: keep only the nodes whose name matches the regex
function regionGroup(name: string, filter: string): SurfboardProxyGroupConfig {
  return {
    name,
    type: 'url-test',
    useAllProxies: true,
    filter,
    proxies: [],
    url: TEST_URL,
    interval: TEST_INTERVAL,
    tolerance: TEST_TOLERANCE,
  };
}

export const SURFBOARD_PROXY_GROUPS: SurfboardProxyGroupConfig[] = [
  {
    // ===== 总出口 =====
    name: '🟢 Proxy',
    type: 'select',
    proxies: ['♻️ 自动选择', '🇭🇰 香港', '🇺🇸 美国', '🇯🇵 日本', '🇸🇬 新加坡', '🇰🇷 韩国', '🇨🇳 台湾', '🚀 直接连接'],
    commentBefore: ['# ===== 总出口 ====='],
  },
  {
    // ===== 自动选择 / 地区分组 =====
    name: '♻️ 自动选择',
    type: 'url-test',
    useAllProxies: true,
    proxies: [],
    url: TEST_URL,
    interval: TEST_INTERVAL,
    tolerance: TEST_TOLERANCE,
    commentBefore: ['# ===== 自动选择 / 地区分组 =====', '# url-test 策略自动选择延迟最低的节点'],
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
    commentBefore: ['', '# ===== 业务分组 ====='],
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

// Built-in policies are never quoted in [Proxy Group] lines
export const SURFBOARD_BUILTIN_POLICIES = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'NO-DROP', 'PASS']);

// [Rule] section lines (SKK / blackmatrix7 Surge-format rule sets, Surfboard-compatible syntax)
export const SURFBOARD_RULES = [
  'RULE-SET,https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/YouTube/YouTube.list,"📺 谷歌服务"',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/reject.conf,"⛔️ 广告拦截"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/reject.conf,"⛔️ 广告拦截"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/reject-drop.conf,REJECT',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/speedtest.conf,"🟢 Proxy"',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/cdn.conf,"🟢 Proxy"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/cdn.conf,"🟢 Proxy"',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/download.conf,"🟢 Proxy"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/download.conf,"🟢 Proxy"',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/icloud_private_relay.conf,"🍎 苹果服务"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/apple_cdn.conf,"🍎 苹果服务"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/apple_cn.conf,"🍎 苹果服务"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/apple_services.conf,"🍎 苹果服务"',
  '',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/microsoft_cdn.conf,DIRECT',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/microsoft.conf,"Ⓜ️ 微软服务"',
  '',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/stream.conf,"🌍 国外媒体"',
  'RULE-SET,https://ruleset.skk.moe/List/ip/stream.conf,"🌍 国外媒体"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/telegram.conf,"📲 电报信息"',
  'RULE-SET,https://ruleset.skk.moe/List/ip/telegram.conf,"📲 电报信息"',
  'PROCESS-NAME,Telegram,"📲 电报信息"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/ai.conf,"🤖 AIGC"',
  'RULE-SET,https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Google/Google.list,"📺 谷歌服务"',
  '',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/global.conf,"🟢 Proxy"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/domestic.conf,DIRECT',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/direct.conf,DIRECT',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/lan.conf,DIRECT',
  '',
  'RULE-SET,https://ruleset.skk.moe/List/ip/reject.conf,REJECT',
  'RULE-SET,https://ruleset.skk.moe/List/ip/lan.conf,DIRECT',
  'RULE-SET,https://ruleset.skk.moe/List/ip/domestic.conf,DIRECT',
  'RULE-SET,https://ruleset.skk.moe/List/ip/china_ip.conf,DIRECT',
  '',
  'IP-CIDR,192.168.0.0/16,DIRECT,no-resolve',
  'IP-CIDR,10.0.0.0/8,DIRECT,no-resolve',
  'IP-CIDR,172.16.0.0/12,DIRECT,no-resolve',
  'IP-CIDR,127.0.0.0/8,DIRECT,no-resolve',
  'GEOIP,CN,DIRECT',
  'FINAL,"🐟 漏网之鱼"',
];
