/**
 * Surge 5 configuration templates
 * Adapted from the forecho/proxy-config-templates Surge demo, aligned with the
 * Clash template (same group names, same SKK / blackmatrix7 rule sources).
 *
 * Surge docs: [Proxy] lines use `,` without spaces; [Proxy Group] uses `, ` with
 * quoted names for anything that is not a built-in policy.
 */

// [General] section lines
export const SURGE_GENERAL = [
  'skip-proxy = 127.0.0.0/8, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, 162.14.0.0/16, 211.99.96.0/19, 162.159.192.0/24, 162.159.193.0/24, 162.159.195.0/24, fc00::/7, fe80::/10, localhost, *.local, captive.apple.com, passenger.t3go.cn, *.ccb.com, wxh.wo.cn, *.abcchina.com, *.abcchina.com.cn',
  'always-real-ip = %APPEND% *.lan, *.localdomain, *.localhost, *.home.arpa, msftncsi.com, msftconnecttest.com, *.msftncsi.com, *.msftconnecttest.com, network-test.debian.org, detectportal.firefox.com, resolver1.opendns.com, *.ipv6.microsoft.com, *.srv.nintendo.net, *.stun.playstation.net, xbox.*.microsoft.com, *.xboxlive.com, turn.twilio.com, *.turn.twilio.com, stun.twilio.com, *.stun.twilio.com, stun.syncthing.net, stun.*.*, stun.*.*.*, controlplane.tailscale.com, time.*.com, time.*.gov, time.*.edu.cn, time.*.apple.com, time1.*.com, time2.*.com, time3.*.com, time4.*.com, time5.*.com, time6.*.com, time7.*.com, time8.*.com, time9.*.com, ntp.*.com, ntp1.*.com, ntp2.*.com, ntp3.*.com, ntp4.*.com, ntp5.*.com, ntp6.*.com, ntp7.*.com, *.time.edu.cn, *.ntp.org.cn, *.pool.ntp.org, time1.cloud.tencent.com, local.adguard.org, injections.adguard.org, localhost.ptlogin2.qq.com, localhost.sec.qq.com, localhost.work.weixin.qq.com, PDC._msDCS.*.*, DC._msDCS.*.*, GC._msDCS.*.*, *.battlenet.com.cn, *.blzstatic.cn, *.battlenet.com',
  'exclude-simple-hostnames = true',
  'test-timeout = 2',
  'wifi-assist = true',
  'ipv6 = false',
  'ipv6-vif = auto',
  'show-error-page-for-reject = true',
  'read-etc-hosts = true',
  'internet-test-url = http://wifi.vivo.com.cn/generate_204',
  'proxy-test-url = http://www.gstatic.com/generate_204',
  'proxy-test-udp = www.apple.com@64.6.64.6',
  'vif-mode = v2',
  'udp-policy-not-supported-behaviour = REJECT',
  'hijack-dns = 8.8.8.8:53, 8.8.4.4:53',
  'dns-server = 223.5.5.5, 1.1.1.1, 8.8.8.8, system',
  'disable-geoip-db-auto-update = false',
  'geoip-maxmind-url = https://cdn.jsdelivr.net/gh/soffchen/GeoIP2-CN@release/Country.mmdb',
  'loglevel = notify',
  'http-api-web-dashboard = true',
  '# 需要把代理共享给局域网内其它设备时 (仅 Mac)，取消下面两行注释',
  '# http-listen = 0.0.0.0',
  '# socks5-listen = 0.0.0.0',
];

// Proxy group template
export interface SurgeProxyGroupConfig {
  name: string;
  type: 'select' | 'smart' | 'url-test' | 'fallback' | 'load-balance';
  /** Static policy references (group names or built-in policies) */
  proxies: string[];
  /** Expand all converted proxy node names into the group */
  useAllProxies?: boolean;
  /** Regex applied to the node names in this group (smart/url-test) */
  policyRegexFilter?: string;
  interval?: number;
  timeout?: number;
  udpRelay?: boolean;
  /** Comment lines (empty string = blank line) emitted before this group */
  commentBefore?: string[];
}

const SMART_PARAMS = { interval: 300, timeout: 5, udpRelay: true } as const;

// Region group: auto-select the lowest-latency node matching the regex
function regionGroup(name: string, filter: string): SurgeProxyGroupConfig {
  return {
    name,
    type: 'smart',
    useAllProxies: true,
    policyRegexFilter: filter,
    proxies: [],
    ...SMART_PARAMS,
  };
}

export const SURGE_PROXY_GROUPS: SurgeProxyGroupConfig[] = [
  {
    // ===== 总出口 =====
    name: '🟢 Proxy',
    type: 'select',
    proxies: ['♻️ 自动选择', '🇭🇰 香港', '🇺🇸 美国', '🇯🇵 日本', '🇸🇬 新加坡', '🇰🇷 韩国', '🇨🇳 台湾', '🚀 直接连接'],
    commentBefore: ['# ===== 总出口 ====='],
  },
  {
    // ===== 自动选择 =====
    name: '♻️ 自动选择',
    type: 'smart',
    useAllProxies: true,
    proxies: [],
    ...SMART_PARAMS,
    commentBefore: ['# ===== 自动选择 / 地区分组 =====', '# smart 策略会根据延迟和历史表现自动选节点 (Surge 5.8+)'],
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
export const SURGE_BUILTIN_POLICIES = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'NO-DROP', 'PASS']);

// [Rule] section lines
export const SURGE_RULES = [
  'RULE-SET,https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/YouTube/YouTube.list,"📺 谷歌服务"',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/reject.conf,"⛔️ 广告拦截",extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/reject.conf,"⛔️ 广告拦截",extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/reject-drop.conf,REJECT-DROP,extended-matching',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/speedtest.conf,"🟢 Proxy",extended-matching',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/cdn.conf,"🟢 Proxy",extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/cdn.conf,"🟢 Proxy"',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/download.conf,"🟢 Proxy",extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/download.conf,"🟢 Proxy",extended-matching',
  '',
  '',
  'DOMAIN-SET,https://ruleset.skk.moe/List/domainset/icloud_private_relay.conf,"🍎 苹果服务"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/apple_cdn.conf,"🍎 苹果服务"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/apple_cn.conf,"🍎 苹果服务"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/apple_services.conf,"🍎 苹果服务",extended-matching',
  '',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/microsoft_cdn.conf,DIRECT',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/microsoft.conf,"Ⓜ️ 微软服务",extended-matching',
  '',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/stream.conf,"🌍 国外媒体",extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/ip/stream.conf,"🌍 国外媒体",extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/telegram.conf,"📲 电报信息",extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/ip/telegram.conf,"📲 电报信息"',
  'PROCESS-NAME,Telegram,"📲 电报信息"',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/ai.conf,"🤖 AIGC",extended-matching',
  'RULE-SET,https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Google/Google.list,"📺 谷歌服务"',
  '',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/global.conf,"🟢 Proxy",extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/domestic.conf,DIRECT,extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/direct.conf,DIRECT,extended-matching',
  'RULE-SET,https://ruleset.skk.moe/List/non_ip/lan.conf,DIRECT',
  '',
  'RULE-SET,https://ruleset.skk.moe/List/ip/reject.conf,REJECT-DROP',
  'RULE-SET,https://ruleset.skk.moe/List/ip/lan.conf,DIRECT',
  'RULE-SET,https://ruleset.skk.moe/List/ip/domestic.conf,DIRECT',
  'RULE-SET,https://ruleset.skk.moe/List/ip/china_ip.conf,DIRECT',
  '',
  'RULE-SET,LAN,DIRECT',
  'GEOIP,CN,DIRECT',
  'FINAL,"🐟 漏网之鱼",dns-failed',
];

// [URL Rewrite] section lines
export const SURGE_URL_REWRITE = ['^http://www\\.google\\.cn https://www.google.com 302'];
