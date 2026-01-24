// DNS configuration
export const DNS_CONFIG = [
  'dns:',
  '  enabled: true',
  '  listen: 0.0.0.0:1053',
  '  ipv6: true',
  '  enhanced-mode: fake-ip',
  '  fake-ip-range: 198.18.0.1/16',
  '  fake-ip-filter:',
  "    - '*.lan'",
  "    - '*.linksys.com'",
  "    - '*.linksyssmartwifi.com'",
  '    - swscan.apple.com',
  '    - mesu.apple.com',
  "    - '*.msftconnecttest.com'",
  "    - '*.msftncsi.com'",
  '    - time.*.com',
  '    - time.*.gov',
  '    - time.*.edu.cn',
  '    - time.*.apple.com',
  '    - time1.*.com',
  '    - time2.*.com',
  '    - time3.*.com',
  '    - time4.*.com',
  '    - time5.*.com',
  '    - time6.*.com',
  '    - time7.*.com',
  '    - ntp.*.com',
  '    - ntp1.*.com',
  '    - ntp2.*.com',
  '    - ntp3.*.com',
  '    - ntp4.*.com',
  '    - ntp5.*.com',
  '    - ntp6.*.com',
  '    - ntp7.*.com',
  "    - '*.time.edu.cn'",
  "    - '*.ntp.org.cn'",
  '    - +.pool.ntp.org',
  '    - time1.cloud.tencent.com',
  '    - +.music.163.com',
  "    - '*.126.net'",
  '    - musicapi.taihe.com',
  '    - music.taihe.com',
  '    - songsearch.kugou.com',
  '    - trackercdn.kugou.com',
  "    - '*.kuwo.cn'",
  '    - api-jooxtt.sanook.com',
  '    - api.joox.com',
  '    - joox.com',
  '    - +.y.qq.com',
  '    - +.music.tc.qq.com',
  '    - aqqmusic.tc.qq.com',
  '    - +.stream.qqmusic.qq.com',
  "    - '*.xiami.com'",
  '    - +.music.migu.cn',
  '    - +.srv.nintendo.net',
  '    - +.stun.playstation.net',
  '    - xbox.*.microsoft.com',
  '    - +.xboxlive.com',
  '    - localhost.ptlogin2.qq.com',
  '    - proxy.golang.org',
  '    - stun.*.*',
  '    - stun.*.*.*',
  "    - '*.mcdn.bilivideo.cn'",
  '  default-nameserver:',
  '    - 223.5.5.5',
  '    - 223.6.6.6',
  '    - 119.29.29.29',
  '  nameserver:',
  '    - https://dns.alidns.com/dns-query',
  '    - https://doh.pub/dns-query',
  '  fallback:',
  '    - https://1.1.1.1/dns-query',
  '    - https://dns.google/dns-query',
  '  fallback-filter:',
  '    geoip: true',
  '    geoip-code: CN',
  '    ipcidr:',
  '      - 240.0.0.0/4',
  '  nameserver-policy:',
  "    'geosite:cn':",
  '      - https://dns.alidns.com/dns-query',
  '      - https://doh.pub/dns-query',
  '',
];

// Basic configuration
export const BASIC_CONFIG = [
  'port: 7890',
  'socks-port: 7891',
  'allow-lan: true',
  'mode: Rule',
  'log-level: info',
  'external-controller: 0.0.0.0:9090',
  '',
];

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

// Proxy group templates
export interface ProxyGroupConfig {
  name: string;
  type: string;
  url?: string;
  interval?: number;
  tolerance?: number;
  useAllProxies?: boolean;
  proxies: string[];
}

export const PROXY_GROUPS_CONFIG: ProxyGroupConfig[] = [
  {
    name: '🔰 选择节点',
    type: 'select',
    useAllProxies: true,
    proxies: ['DIRECT'],
  },
  {
    name: '🌏 爱奇艺&哔哩哔哩',
    type: 'select',
    proxies: ['DIRECT'],
  },
  {
    name: '📺 动画疯',
    type: 'select',
    proxies: ['🔰 选择节点', 'DIRECT'],
  },
  {
    name: '🎮 Steam 登录/下载',
    type: 'select',
    proxies: ['DIRECT', '🔰 选择节点'],
  },
  {
    name: '🎮 Steam 商店/社区',
    type: 'select',
    proxies: ['🔰 选择节点', 'DIRECT'],
  },
  {
    name: '🌩️ Cloudflare',
    type: 'select',
    proxies: ['🔰 选择节点', 'DIRECT'],
  },
  {
    name: '☁️ OneDrive',
    type: 'select',
    useAllProxies: true,
    proxies: ['🔰 选择节点', 'DIRECT'],
  },
  {
    name: '🎓学术网站',
    type: 'select',
    proxies: ['DIRECT', '🔰 选择节点'],
  },
  {
    name: '🇨🇳 国内网站',
    type: 'select',
    proxies: ['DIRECT', '🔰 选择节点'],
  },
  {
    name: '🛑 拦截广告',
    type: 'select',
    proxies: ['REJECT', 'DIRECT', '🔰 选择节点'],
  },
  {
    name: '🐟 漏网之鱼',
    type: 'select',
    proxies: ['🔰 选择节点', 'DIRECT'],
  },
];
