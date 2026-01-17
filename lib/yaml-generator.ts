import { ProxyNode } from './types';
import { CLASH_RULES } from './rules-content';

// Simple YAML generator using js-yaml alternative
export function generateSimpleYaml(proxies: ProxyNode[]): string {
  if (proxies.length === 0) {
    return '# No proxies found\n';
  }

  const lines: string[] = [];
  const now = new Date();
  const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // Header
  lines.push('#');
  lines.push('#-------------------------------------------------------------#');
  lines.push('#  author：https://clashconverter.com');
  lines.push(`#  create_time：${createTime}`);
  lines.push(`#  node num：${proxies.length}`);
  lines.push('#-------------------------------------------------------------#');
  lines.push('#');
  lines.push('port: 7890');
  lines.push('socks-port: 7891');
  lines.push('allow-lan: true');
  lines.push('mode: Rule');
  lines.push('log-level: info');
  lines.push('external-controller: 0.0.0.0:9090');
  lines.push('');
  lines.push('proxies:');

  // Proxies in single-line JSON format
  for (const proxy of proxies) {
    lines.push('  - ' + formatProxyJson(proxy));
  }

  // Generate unique names to avoid duplicates
  const uniqueNames = Array.from(new Set(proxies.map(p => p.name)));

  // Proxy groups
  lines.push('');
  lines.push('proxy-groups:');
  lines.push(`  - name: 🚀 节点选择`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - ♻️ 自动选择`);
  lines.push(`      - DIRECT`);
  for (const name of uniqueNames) {
    lines.push(`      - ${name}`);
  }

  lines.push(`  - name: ♻️ 自动选择`);
  lines.push(`    type: url-test`);
  lines.push(`    url: http://www.gstatic.com/generate_204`);
  lines.push(`    interval: 300`);
  lines.push(`    tolerance: 50`);
  lines.push(`    proxies:`);
  for (const name of uniqueNames) {
    lines.push(`      - ${name}`);
  }

  lines.push(`  - name: 🌍 国外媒体`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - 🚀 节点选择`);
  lines.push(`      - ♻️ 自动选择`);
  lines.push(`      - 🎯 全球直连`);
  for (const name of uniqueNames) {
    lines.push(`      - ${name}`);
  }

  lines.push(`  - name: 📲 电报信息`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - 🚀 节点选择`);
  lines.push(`      - 🎯 全球直连`);
  for (const name of uniqueNames) {
    lines.push(`      - ${name}`);
  }

  lines.push(`  - name: Ⓜ️ 微软服务`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - 🎯 全球直连`);
  lines.push(`      - 🚀 节点选择`);
  for (const name of uniqueNames) {
    lines.push(`      - ${name}`);
  }

  lines.push(`  - name: 🍎 苹果服务`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - 🚀 节点选择`);
  lines.push(`      - 🎯 全球直连`);
  for (const name of uniqueNames) {
    lines.push(`      - ${name}`);
  }

  lines.push(`  - name: 🎯 全球直连`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - DIRECT`);
  lines.push(`      - 🚀 节点选择`);
  lines.push(`      - ♻️ 自动选择`);

  lines.push(`  - name: 🛑 全球拦截`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - REJECT`);
  lines.push(`      - DIRECT`);

  lines.push(`  - name: 🍃 应用净化`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - REJECT`);
  lines.push(`      - DIRECT`);

  lines.push(`  - name: 🐟 漏网之鱼`);
  lines.push(`    type: select`);
  lines.push(`    proxies:`);
  lines.push(`      - 🚀 节点选择`);
  lines.push(`      - 🎯 全球直连`);
  lines.push(`      - ♻️ 自动选择`);
  for (const name of uniqueNames) {
    lines.push(`      - ${name}`);
  }

  lines.push('dns:');
  lines.push('  enabled: true');
  lines.push('  listen: 0.0.0.0:1053');
  lines.push('  ipv6: true');
  lines.push('  enhanced-mode: fake-ip');
  lines.push('  fake-ip-range: 198.18.0.1/16');
  lines.push('  fake-ip-filter:');
  lines.push('    - \'*.lan\'');
  lines.push('    - \'*.linksys.com\'');
  lines.push('    - \'*.linksyssmartwifi.com\'');
  lines.push('    - swscan.apple.com');
  lines.push('    - mesu.apple.com');
  lines.push('    - \'*.msftconnecttest.com\'');
  lines.push('    - \'*.msftncsi.com\'');
  lines.push('    - time.*.com');
  lines.push('    - time.*.gov');
  lines.push('    - time.*.edu.cn');
  lines.push('    - time.*.apple.com');
  lines.push('    - time1.*.com');
  lines.push('    - time2.*.com');
  lines.push('    - time3.*.com');
  lines.push('    - time4.*.com');
  lines.push('    - time5.*.com');
  lines.push('    - time6.*.com');
  lines.push('    - time7.*.com');
  lines.push('    - ntp.*.com');
  lines.push('    - ntp1.*.com');
  lines.push('    - ntp2.*.com');
  lines.push('    - ntp3.*.com');
  lines.push('    - ntp4.*.com');
  lines.push('    - ntp5.*.com');
  lines.push('    - ntp6.*.com');
  lines.push('    - ntp7.*.com');
  lines.push('    - \'*.time.edu.cn\'');
  lines.push('    - \'*.ntp.org.cn\'');
  lines.push('    - +.pool.ntp.org');
  lines.push('    - time1.cloud.tencent.com');
  lines.push('    - +.music.163.com');
  lines.push('    - \'*.126.net\'');
  lines.push('    - musicapi.taihe.com');
  lines.push('    - music.taihe.com');
  lines.push('    - songsearch.kugou.com');
  lines.push('    - trackercdn.kugou.com');
  lines.push('    - \'*.kuwo.cn\'');
  lines.push('    - api-jooxtt.sanook.com');
  lines.push('    - api.joox.com');
  lines.push('    - joox.com');
  lines.push('    - +.y.qq.com');
  lines.push('    - +.music.tc.qq.com');
  lines.push('    - aqqmusic.tc.qq.com');
  lines.push('    - +.stream.qqmusic.qq.com');
  lines.push('    - \'*.xiami.com\'');
  lines.push('    - +.music.migu.cn');
  lines.push('    - +.srv.nintendo.net');
  lines.push('    - +.stun.playstation.net');
  lines.push('    - xbox.*.microsoft.com');
  lines.push('    - +.xboxlive.com');
  lines.push('    - localhost.ptlogin2.qq.com');
  lines.push('    - proxy.golang.org');
  lines.push('    - stun.*.*');
  lines.push('    - stun.*.*.*');
  lines.push('    - \'*.mcdn.bilivideo.cn\'');
  lines.push('  default-nameserver:');
  lines.push('    - 223.5.5.5');
  lines.push('    - 223.6.6.6');
  lines.push('    - 119.29.29.29');
  lines.push('  nameserver:');
  lines.push('    - https://dns.alidns.com/dns-query');
  lines.push('    - https://doh.pub/dns-query');
  lines.push('  fallback:');
  lines.push('    - https://1.1.1.1/dns-query');
  lines.push('    - https://dns.google/dns-query');
  lines.push('  fallback-filter:');
  lines.push('    geoip: true');
  lines.push('    geoip-code: CN');
  lines.push('    ipcidr:');
  lines.push('      - 240.0.0.0/4');
  lines.push('  nameserver-policy:');
  lines.push('    \'geosite:cn\':');
  lines.push('      - https://dns.alidns.com/dns-query');
  lines.push('      - https://doh.pub/dns-query');
  lines.push('');

  // Add complete rules from target-template/clash.yaml
  lines.push('');
  lines.push(CLASH_RULES);

  return lines.join('\n');
}

// Format proxy as single-line JSON for Clash YAML
function formatProxyJson(proxy: ProxyNode): string {
  const obj: any = {
    type: proxy.type,
    name: proxy.name,
    server: proxy.server,
    port: proxy.port,
  };

  switch (proxy.type) {
    case 'ss':
      obj.cipher = proxy.cipher || 'aes-256-gcm';
      obj.password = proxy.password;
      break;

    case 'ssr':
      obj.cipher = proxy.cipher;
      obj.password = proxy.password;
      obj.protocol = proxy.protocol;
      if (proxy.protocolparam) obj.protocolparam = proxy.protocolparam;
      obj.obfs = proxy.obfs;
      if (proxy.obfsparam) obj.obfsparam = proxy.obfsparam;
      break;

    case 'vmess':
      obj.uuid = proxy.uuid;
      obj.alterId = proxy.alterId || 0;
      obj.cipher = proxy.cipher || 'auto';
      obj.network = proxy.network || 'tcp';
      if (proxy.tls !== undefined) obj.tls = proxy.tls;
      if (proxy['skip-cert-verify'] !== undefined) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.servername) obj.servername = proxy.servername;
      if (proxy['ws-opts']) {
        obj['ws-opts'] = proxy['ws-opts'];
      }
      break;

    case 'trojan':
      obj.password = proxy.password;
      obj.udp = proxy.udp ?? true;
      if (proxy['skip-cert-verify']) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.sni) obj.sni = proxy.sni;
      break;

    case 'hysteria':
      obj.auth = proxy.auth;
      obj.protocol = proxy.protocol || 'udp';
      if (proxy['skip-cert-verify']) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.sni) obj.sni = proxy.sni;
      obj.up = proxy.up || '10';
      obj.down = proxy.down || '50';
      obj.alpn = proxy.alpn || 'h3';
      break;

    case 'hysteria2':
      obj.password = proxy.password;
      if (proxy['skip-cert-verify']) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.sni) obj.sni = proxy.sni;
      break;

    case 'vless':
      obj.uuid = proxy.uuid;
      obj.udp = proxy.udp ?? true;
      obj.network = proxy.network || 'tcp';
      if (proxy.tls !== undefined) obj.tls = proxy.tls;
      if (proxy.servername) obj.servername = proxy.servername;
      if (proxy['skip-cert-verify']) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.flow) obj.flow = proxy.flow;
      if (proxy['reality-opts']) {
        obj['reality-opts'] = proxy['reality-opts'];
      }
      if (proxy['client-fingerprint']) {
        obj['client-fingerprint'] = proxy['client-fingerprint'];
      }
      if (proxy['ws-opts']) {
        obj['ws-opts'] = proxy['ws-opts'];
      }
      break;

    case 'http':
      if (proxy.username) obj.username = proxy.username;
      if (proxy.password) obj.password = proxy.password;
      if (proxy.tls) obj.tls = proxy.tls;
      break;

    case 'socks5':
      if (proxy.username) obj.username = proxy.username;
      if (proxy.password) obj.password = proxy.password;
      obj.udp = proxy.udp ?? true;
      break;
  }

  return JSON.stringify(obj);
}
