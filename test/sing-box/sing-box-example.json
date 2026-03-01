{
  // 日志配置，通常可以照抄
  "log": {
    "disabled": false,
    "level": "error",
    "timestamp": true
  },
  // DNS 配置，通常可以照抄
  "dns": {
    "rules": [
      {
        "clash_mode": "Proxy",
        "server": "remote"
      },
      {
        "clash_mode": "Direct",
        "server": "local"
      },
      {
        "rule_set": ["geosite-cn"],
        "server": "local"
      },
      // 若不需要广告拦截可删除以下规则
      {
        "rule_set": ["category-ads-all"],
        "server": "block"
      }
    ],
    // DNS 服务器配置，包含远端解析、本地解析、拦截
    "servers": [
      {
        "type": "https",
        "server": "1.1.1.1",
        "detour": "Available",
        "tag": "remote"
      },
      {
        "type": "https",
        "server": "223.5.5.5",
        "tag": "local"
      },
      {
        "type": "hosts",
        "path": [],
        "predefined": {},
        "tag": "block"
      },
      {
        "type": "local"
      }
    ],
    // 若远端不支持 IPV6 则需要修改
    // 可取值：prefer_ipv4、prefer_ipv6、ipv4_only、ipv6_only
    // 如遇到问题，建议改为 ipv4_only
    "strategy": "prefer_ipv4"
  },
  "experimental": {
    // 缓存 Fake IP 映射
    "cache_file": {
      "enabled": true
    }
  },
  "inbounds": [
    // TUN 配置，通常可以照抄
    {
      "address": ["172.18.0.1/30", "fdfe:dcba:9876::1/126"],
      "route_address": ["0.0.0.0/1", "128.0.0.0/1", "::/1", "8000::/1"],
      "route_exclude_address": [
        "192.168.0.0/16",
        "10.0.0.0/8",
        "172.16.0.0/12",
        "fc00::/7"
      ],
      "auto_route": true,
      "strict_route": true,
      "type": "tun"
    },
    // HTTP 和 SOCKS 混合接入端口配置，通常可以照抄
    {
      "listen": "127.0.0.1",
      "listen_port": 2333,
      "tag": "mixed-in",
      "type": "mixed",
      "users": []
    }
  ],
  "outbounds": [
    // 可手动选择的出站列表，需要根据实际情况修改
    {
      "type": "selector",
      "tag": "Available",
      "default": "Corporate", // 默认出站
      "outbounds": ["NetLab", "Corporate"] // 出站列表
    },
    // 以下为出站配置，例如可以配置 WireGuard 出站
    // 请参考：https://sing-box.sagernet.org/configuration/outbound
    {
      "type": "wireguard",
      "tag": "NetLab",
      "domain_resolver": "local",
      // ...
    },
    {
      "type": "wireguard",
      "tag": "Corporate",
      "domain_resolver": "local",
      // ...
    },
    // 以下配置通常可以照抄
    // （注意：目前客户端不使用最新核心，更新后需要换写法）
    {
      "type": "direct",
      "tag": "direct"
    }
  ],
  // 分流规则，通常可以照抄
  "route": {
    "auto_detect_interface": true,
    "default_domain_resolver": "local",
    "rules": [
      // DNS 分流策略
      {
        "action": "sniff"
      },
      {
        "protocol": "dns",
        "action": "hijack-dns"
      },
      // 直连模式
      {
        "clash_mode": "Direct",
        "outbound": "direct"
      },
      // 全局模式
      {
        "clash_mode": "Proxy",
        "outbound": "Available"
      },
      // 对于地理位置标记的规则
      {
        "rule_set": ["geosite-cn"],
        "outbound": "direct"
      },
      // 对于非广域网 IP 的规则
      {
        "ip_is_private": true,
        "outbound": "direct"
      },
      // 若不需要广告拦截可删除以下规则
      {
        "rule_set": ["category-ads-all"],
        "action": "reject"
      }
    ],
    // 规则资源集合，通常可以照抄
    "rule_set": [
      {
        "tag": "geosite-cn",
        "type": "remote",
        "format": "binary",
        // 以下链接利用了 Fastly CDN，对应的原始链接为 https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-cn.srs
        "url": "https://fastly.jsdelivr.net/gh/SagerNet/sing-geosite@rule-set/geosite-cn.srs",
        "download_detour": "direct"
      },
      {
        "tag": "category-ads-all",
        "type": "remote",
        "format": "binary",
        "url": "https://fastly.jsdelivr.net/gh/SagerNet/sing-geosite@rule-set/geosite-category-ads-all.srs",
        "download_detour": "direct"
      }
    ]
  }
}