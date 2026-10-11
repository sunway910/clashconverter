// Short RULE-SET based rules (adapted from forecho/proxy-config-templates).
// Group names must match PROXY_GROUPS_CONFIG in ./base.ts exactly.
// Rule providers are defined in RULE_PROVIDERS_CONFIG (./base.ts).
export const CLASH_RULES = `rules:
  # ===== 个人规则写在这里，越靠前优先级越高 =====
  # - DOMAIN-SUFFIX,example.com,🟢 Proxy
  # - PROCESS-NAME,Example,DIRECT

  # YouTube 固定走「📺 谷歌服务」，避免出口地区漂移导致 Premium 状态异常 (需放在 CDN / 流媒体规则之前)
  - RULE-SET,youtube,📺 谷歌服务

  # 广告 / 隐私跟踪 / 病毒 / 钓鱼域名拦截 (不想拦截的话把「⛔️ 广告拦截」切到直连)
  - RULE-SET,reject_domainset,⛔️ 广告拦截
  - RULE-SET,reject_non_ip,⛔️ 广告拦截
  - RULE-SET,reject_drop_non_ip,REJECT-DROP

  # 测速网站 / 静态 CDN / 软件下载更新
  - RULE-SET,speedtest_domainset,🟢 Proxy
  - RULE-SET,cdn_domainset,🟢 Proxy
  - RULE-SET,cdn_non_ip,🟢 Proxy
  - RULE-SET,download_domainset,🟢 Proxy
  - RULE-SET,download_non_ip,🟢 Proxy

  # 苹果服务
  - RULE-SET,icloud_private_relay_domainset,🍎 苹果服务
  - RULE-SET,apple_cdn_non_ip,🍎 苹果服务
  - RULE-SET,apple_cn_non_ip,🍎 苹果服务
  - RULE-SET,apple_services_non_ip,🍎 苹果服务
  # 微软服务
  - RULE-SET,microsoft_cdn_non_ip,DIRECT
  - RULE-SET,microsoft_non_ip,Ⓜ️ 微软服务

  # 国外流媒体
  - RULE-SET,stream_non_ip,🌍 国外媒体
  - RULE-SET,stream_ip,🌍 国外媒体
  # Telegram
  - RULE-SET,telegram_non_ip,📲 电报信息
  - RULE-SET,telegram_ip,📲 电报信息
  - PROCESS-NAME,Telegram,📲 电报信息
  # AI 服务 (OpenAI / Claude / Gemini 等)
  - RULE-SET,ai_non_ip,🤖 AIGC
  # 其余 Google 域名与 YouTube 同区，保持账号地区一致 (置于 ai 之后，不影响 Gemini 分流)
  - RULE-SET,google,📺 谷歌服务

  # 常见海外域名
  - RULE-SET,global_non_ip,🟢 Proxy
  # 国内常见域名 / 直连域名 / 内网域名
  - RULE-SET,domestic_non_ip,DIRECT
  - RULE-SET,direct_non_ip,DIRECT
  - RULE-SET,lan_non_ip,DIRECT

  # IP 规则
  - RULE-SET,reject_ip,REJECT-DROP
  - RULE-SET,lan_ip,DIRECT
  - RULE-SET,domestic_ip,DIRECT
  - RULE-SET,china_ip,DIRECT

  # 以下规则会触发本地 DNS 解析
  - GEOIP,CN,DIRECT
  - MATCH,🐟 漏网之鱼
`;
