// Short RULE-SET based rules (adapted from forecho/proxy-config-templates).
// Group names must match PROXY_GROUPS_CONFIG in ./base.ts exactly.
// Rule providers are defined in RULE_PROVIDERS_CONFIG (./base.ts).
export const CLASH_RULES = `rules:
  # - DOMAIN-SUFFIX,example.com,🟢 Proxy
  # - PROCESS-NAME,Example,DIRECT

  - RULE-SET,youtube,📺 谷歌服务

  - RULE-SET,reject_domainset,⛔️ 广告拦截
  - RULE-SET,reject_non_ip,⛔️ 广告拦截
  - RULE-SET,reject_drop_non_ip,REJECT-DROP

  - RULE-SET,speedtest_domainset,🟢 Proxy
  - RULE-SET,cdn_domainset,🟢 Proxy
  - RULE-SET,cdn_non_ip,🟢 Proxy
  - RULE-SET,download_domainset,🟢 Proxy
  - RULE-SET,download_non_ip,🟢 Proxy

  - RULE-SET,icloud_private_relay_domainset,🍎 苹果服务
  - RULE-SET,apple_cdn_non_ip,🍎 苹果服务
  - RULE-SET,apple_cn_non_ip,🍎 苹果服务
  - RULE-SET,apple_services_non_ip,🍎 苹果服务

  - RULE-SET,microsoft_cdn_non_ip,DIRECT
  - RULE-SET,microsoft_non_ip,Ⓜ️ 微软服务

  - RULE-SET,stream_non_ip,🌍 国外媒体
  - RULE-SET,stream_ip,🌍 国外媒体

  - RULE-SET,telegram_non_ip,📲 电报信息
  - RULE-SET,telegram_ip,📲 电报信息
  - PROCESS-NAME,Telegram,📲 电报信息
  
  - RULE-SET,ai_non_ip,🤖 AIGC
  - RULE-SET,google,📺 谷歌服务

  - RULE-SET,global_non_ip,🟢 Proxy
  - RULE-SET,domestic_non_ip,DIRECT
  - RULE-SET,direct_non_ip,DIRECT
  - RULE-SET,lan_non_ip,DIRECT

  - RULE-SET,reject_ip,REJECT-DROP
  - RULE-SET,lan_ip,DIRECT
  - RULE-SET,domestic_ip,DIRECT
  - RULE-SET,china_ip,DIRECT

  - GEOIP,CN,DIRECT
  - MATCH,🐟 漏网之鱼
`;
