export type Language = 'en' | 'zh';

export const translations = {
  en: {
    title: 'Clash Converter',
    subtitle: {
      'proxies-to-yaml': 'Convert proxy links to Clash YAML format',
      'yaml-to-proxies': 'Extract proxy links from Clash YAML',
    },
    inputLabel: {
      'proxies-to-yaml': 'Proxy Links',
      'yaml-to-proxies': 'YAML Config',
    },
    outputLabel: {
      'proxies-to-yaml': 'Clash YAML',
      'yaml-to-proxies': 'Proxy Links',
    },
    inputDescription: {
      'proxies-to-yaml': 'Paste your proxy links - one per line',
      'yaml-to-proxies': 'Paste your Clash YAML configuration',
    },
    outputDescription: {
      'proxies-to-yaml': 'Preview and download your Clash configuration',
      'yaml-to-proxies': 'Preview and download your proxy links',
    },
    inputPlaceholder: {
      'proxies-to-yaml': `Paste your proxy links here - one per line

Examples:
ss://\${base64 Encode String}==#SS-HongKongNode1

💡 Tip: #SS-HongKongNode1 at the end becomes the proxy name in your YAML file`,
      'yaml-to-proxies': `proxies:
  - {"type":"ss","name":"...","server":"...","port":...}
  - {"type":"vmess",...}

proxy-groups:
  - name: 🚀 节点选择
    type: select
    proxies: ...`,
    },
    itemsFound: '{count} item(s) found',
    clear: 'Clear',
    download: 'Download',
    copy: 'Copy',
    copied: 'Copied!',
    swapDirection: 'Swap Direction',
    supportedProtocols: 'Supported Protocols',
    kernelType: 'Kernel Type',
    kernelTypes: {
      'clash-meta': 'Clash Meta (Mihomo)',
      'clash-premium': 'Clash Premium',
    },
    kernelDescriptions: {
      'clash-meta': {
        title: 'Clash Meta (Mihomo)',
        description: 'The continuation of Clash Meta with the latest features and protocol support.',
        features: [
          'Supports all protocols including VLESS, Hysteria, Hysteria2',
          'Active development with regular updates',
          'Used by Clash Verge and other modern clients',
          'Recommended for most users',
        ],
      },
      'clash-premium': {
        title: 'Clash Premium',
        description: 'The original Clash core (formerly Clash for Windows kernel). No longer actively maintained.',
        features: [
          'Does NOT support VLESS, Hysteria, Hysteria2',
          'Stable but outdated, last updated in 2023',
          'Legacy support for older configurations',
          'Only choose if your client requires it',
        ],
      },
    },
    protocolFiltered: '{count} {protocol} node(s) filtered out (not supported by Clash Premium)',
    unsupportedProtocols: {
      vless: 'VLESS',
      hysteria: 'Hysteria',
      hysteria2: 'Hysteria2',
    },
    outputPlaceholder: {
      'proxies-to-yaml': '# Your Clash config will appear here',
      'yaml-to-proxies': '# Your proxy links will appear here',
    },
    downloadFilename: {
      'proxies-to-yaml': 'clash-config.yaml',
      'yaml-to-proxies': 'proxies.txt',
    },
  },
  zh: {
    title: 'Clash 转换器',
    subtitle: {
      'proxies-to-yaml': '将代理链接转换为 Clash YAML 格式',
      'yaml-to-proxies': '从 Clash YAML 中提取代理链接',
    },
    inputLabel: {
      'proxies-to-yaml': '代理链接',
      'yaml-to-proxies': 'YAML 配置',
    },
    outputLabel: {
      'proxies-to-yaml': 'Clash YAML',
      'yaml-to-proxies': '代理链接',
    },
    inputDescription: {
      'proxies-to-yaml': '粘贴您的代理链接，每行一个',
      'yaml-to-proxies': '粘贴您的 Clash YAML 配置',
    },
    outputDescription: {
      'proxies-to-yaml': '预览并下载您的 Clash 配置',
      'yaml-to-proxies': '预览并下载您的代理链接',
    },
    inputPlaceholder: {
      'proxies-to-yaml': `在此粘贴代理链接，每行一个

示例：
ss://\${base64 Encode String}==#SS-HongKongNode1

💡 提示：链接末尾的 #SS-HongKongNode1 会成为 YAML 文件中的代理名称`,
      'yaml-to-proxies': `proxies:
  - {"type":"ss","name":"...","server":"...","port":...}
  - {"type":"vmess",...}

proxy-groups:
  - name: 🚀 节点选择
    type: select
    proxies: ...`,
    },
    itemsFound: '找到 {count} 个项目',
    clear: '清除',
    download: '下载',
    copy: '复制',
    copied: '已复制！',
    swapDirection: '切换方向',
    supportedProtocols: '支持的协议',
    kernelType: '内核类型',
    kernelTypes: {
      'clash-meta': 'Clash Meta (Mihomo)',
      'clash-premium': 'Clash Premium',
    },
    kernelDescriptions: {
      'clash-meta': {
        title: 'Clash Meta (Mihomo)',
        description: '「Clash Meta」 内核拥有最新功能和协议支持。',
        features: [
          '支持所有协议，包括 VLESS、Hysteria、Hysteria2',
          '活跃开发，定期更新',
          'Clash Verge 等现代客户端使用',
          '推荐大多数用户使用',
        ],
      },
      'clash-premium': {
        title: 'Clash Premium',
        description: '「Clash Premium」内核（前 Clash for Windows 内核）。已停止维护。',
        features: [
          '不支持 VLESS、Hysteria、Hysteria2',
          '稳定但已过时，最后更新于 2023 年',
          '为旧配置提供遗留支持',
          '仅在客户端要求时选择',
        ],
      },
    },
    protocolFiltered: '已过滤掉 {count} 个 {protocol} 节点（Clash Premium 不支持）',
    unsupportedProtocols: {
      vless: 'VLESS',
      hysteria: 'Hysteria',
      hysteria2: 'Hysteria2',
    },
    outputPlaceholder: {
      'proxies-to-yaml': '# 您的 Clash 配置将显示在这里',
      'yaml-to-proxies': '# 您的代理链接将显示在这里',
    },
    downloadFilename: {
      'proxies-to-yaml': 'clash-config.yaml',
      'yaml-to-proxies': 'proxies.txt',
    },
  },
};
