import { ProxyNode } from './types';
import { CLASH_RULES } from './rules-content';

export interface ClashYamlConfig {
  proxies: any[];
  'proxy-groups': any[];
}

export function generateClashYaml(proxies: ProxyNode[], groupName: string = 'Proxy'): string {
  if (proxies.length === 0) {
    return '# No proxies found\n';
  }

  const lines: string[] = [];

  // Header
  lines.push('mixed-port: 7890');
  lines.push('allow-lan: true');
  lines.push('mode: rule');
  lines.push('log-level: info');
  lines.push('external-controller: 127.0.0.1:9090');
  lines.push('');

  // Proxies in single-line JSON format
  lines.push('proxies:');
  for (const proxy of proxies) {
    lines.push('  - ' + formatProxyJson(proxy));
  }

  // Generate proxy group
  const proxyNames = proxies.map(p => p.name);
  lines.push('');
  lines.push('proxy-groups:');
  lines.push('  - name: ' + groupName);
  lines.push('    type: select');
  lines.push('    proxies:');
  for (const name of proxyNames) {
    lines.push('      - ' + name);
  }

  // Rules
  lines.push('');
  lines.push('rules:');
  lines.push('  - GEOIP,CN,DIRECT');
  lines.push('  - MATCH,' + groupName);

  return lines.join('\n');
}

function generateProxyConfig(proxy: ProxyNode): any {
  const base: any = {
    name: proxy.name,
    type: proxy.type,
    server: proxy.server,
    port: proxy.port,
  };

  switch (proxy.type) {
    case 'ss':
      return {
        ...base,
        cipher: proxy.cipher || 'aes-256-gcm',
        udp: proxy.udp ?? true,
      };

    case 'ssr':
      return {
        ...base,
        cipher: proxy.cipher,
        password: proxy.password,
        protocol: proxy.protocol,
        protocolparam: proxy.protocolparam || '',
        obfs: proxy.obfs,
        obfsparam: proxy.obfsparam || '',
      };

    case 'vmess':
      return {
        ...base,
        uuid: proxy.uuid,
        alterId: proxy.alterId || 0,
        cipher: proxy.cipher || 'auto',
        udp: proxy.udp ?? true,
        tls: proxy.tls || false,
        'skip-cert-verify': proxy['skip-cert-verify'] || false,
        network: proxy.network || 'tcp',
        servername: proxy.servername || '',
        'ws-opts': proxy['ws-opts'],
      };

    case 'trojan':
      return {
        ...base,
        password: proxy.password,
        udp: proxy.udp ?? true,
        'skip-cert-verify': proxy['skip-cert-verify'] || false,
        sni: proxy.sni || '',
        network: proxy.network || 'tcp',
      };

    case 'hysteria':
      return {
        ...base,
        auth: proxy.auth,
        protocol: proxy.protocol || 'udp',
        'skip-cert-verify': proxy['skip-cert-verify'] || false,
        sni: proxy.sni || '',
        up: proxy.up || '10',
        down: proxy.down || '50',
        alpn: proxy.alpn || 'h3',
      };

    case 'vless':
      return {
        ...base,
        uuid: proxy.uuid,
        udp: proxy.udp ?? true,
        tls: proxy.tls || false,
        'skip-cert-verify': proxy['skip-cert-verify'] || false,
        network: proxy.network || 'tcp',
        servername: proxy.servername || '',
        flow: proxy.flow || '',
        'ws-opts': proxy['ws-opts'],
      };

    case 'http':
      return {
        ...base,
        username: proxy.username,
        password: proxy.password,
        tls: proxy.tls || false,
      };

    case 'socks5':
      return {
        ...base,
        username: proxy.username,
        password: proxy.password,
        udp: proxy.udp ?? true,
      };

    default:
      return base;
  }
}

function formatYamlObject(obj: any, indent: number = 0): string {
  const spaces = ' '.repeat(indent);
  let result = '';

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        result += `\n${spaces}- ${formatYamlObject(item, indent + 2).trim()}`;
      } else {
        result += `\n${spaces}- ${item}`;
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = obj[key];

      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        result += `\n${spaces}${key}:`;
        for (const item of value) {
          if (typeof item === 'object' && item !== null) {
            result += `\n${spaces}  - ${formatYamlObject(item, indent + 4).trim()}`;
          } else {
            result += `\n${spaces}  - ${JSON.stringify(item)}`;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        result += `\n${spaces}${key}:${formatYamlObject(value, indent + 2)}`;
      } else if (typeof value === 'string') {
        result += `\n${spaces}${key}: "${value}"`;
      } else if (typeof value === 'boolean') {
        result += `\n${spaces}${key}: ${value ? 'true' : 'false'}`;
      } else {
        result += `\n${spaces}${key}: ${value}`;
      }
    }
  } else {
    result = String(obj);
  }

  return result;
}

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

  // Add complete rules from target.yaml
  lines.push('');
  lines.push(CLASH_RULES);

  return lines.join('\n');
}

function formatProxy(proxy: ProxyNode): string[] {
  const lines: string[] = [];

  switch (proxy.type) {
    case 'ss':
      lines.push(`- name: "${proxy.name}"`);
      lines.push(`  type: ss`);
      lines.push(`  server: "${proxy.server}"`);
      lines.push(`  port: ${proxy.port}`);
      lines.push(`  cipher: ${proxy.cipher || 'aes-256-gcm'}`);
      lines.push(`  udp: ${proxy.udp !== false}`);
      if (proxy.password) lines.push(`  password: "${proxy.password}"`);
      break;

    case 'ssr':
      lines.push(`- name: "${proxy.name}"`);
      lines.push(`  type: ssr`);
      lines.push(`  server: "${proxy.server}"`);
      lines.push(`  port: ${proxy.port}`);
      lines.push(`  cipher: ${proxy.cipher}`);
      lines.push(`  password: "${proxy.password}"`);
      lines.push(`  protocol: ${proxy.protocol}`);
      if (proxy.protocolparam) lines.push(`  protocolparam: "${proxy.protocolparam}"`);
      lines.push(`  obfs: ${proxy.obfs}`);
      if (proxy.obfsparam) lines.push(`  obfsparam: "${proxy.obfsparam}"`);
      break;

    case 'vmess':
      lines.push(`- name: "${proxy.name}"`);
      lines.push(`  type: vmess`);
      lines.push(`  server: "${proxy.server}"`);
      lines.push(`  port: ${proxy.port}`);
      lines.push(`  uuid: "${proxy.uuid}"`);
      lines.push(`  alterId: ${proxy.alterId || 0}`);
      lines.push(`  cipher: ${proxy.cipher || 'auto'}`);
      lines.push(`  udp: ${proxy.udp !== false}`);
      lines.push(`  tls: ${proxy.tls || false}`);
      lines.push(`  skip-cert-verify: ${proxy['skip-cert-verify'] || false}`);
      lines.push(`  network: ${proxy.network || 'tcp'}`);
      if (proxy.servername) lines.push(`  servername: "${proxy.servername}"`);
      if (proxy['ws-opts']) {
        lines.push(`  ws-opts:`);
        if (proxy['ws-opts'].path) lines.push(`    path: "${proxy['ws-opts'].path}"`);
        if (proxy['ws-opts'].headers?.Host) lines.push(`    headers:`);
        if (proxy['ws-opts'].headers?.Host) lines.push(`      Host: "${proxy['ws-opts'].headers.Host}"`);
      }
      break;

    case 'trojan':
      lines.push(`- name: "${proxy.name}"`);
      lines.push(`  type: trojan`);
      lines.push(`  server: "${proxy.server}"`);
      lines.push(`  port: ${proxy.port}`);
      lines.push(`  password: "${proxy.password}"`);
      lines.push(`  udp: ${proxy.udp !== false}`);
      lines.push(`  skip-cert-verify: ${proxy['skip-cert-verify'] || false}`);
      if (proxy.sni) lines.push(`  sni: "${proxy.sni}"`);
      if (proxy.network) lines.push(`  network: ${proxy.network}`);
      break;

    case 'hysteria':
      lines.push(`- name: "${proxy.name}"`);
      lines.push(`  type: hysteria`);
      lines.push(`  server: "${proxy.server}"`);
      lines.push(`  port: ${proxy.port}`);
      if (proxy.auth) lines.push(`  auth: "${proxy.auth}"`);
      if (proxy.protocol) lines.push(`  protocol: ${proxy.protocol}`);
      lines.push(`  skip-cert-verify: ${proxy['skip-cert-verify'] || false}`);
      if (proxy.sni) lines.push(`  sni: "${proxy.sni}"`);
      if (proxy.up) lines.push(`  up: ${proxy.up}`);
      if (proxy.down) lines.push(`  down: ${proxy.down}`);
      if (proxy.alpn) lines.push(`  alpn: ${proxy.alpn}`);
      break;

    case 'vless':
      lines.push(`- name: "${proxy.name}"`);
      lines.push(`  type: vless`);
      lines.push(`  server: "${proxy.server}"`);
      lines.push(`  port: ${proxy.port}`);
      lines.push(`  uuid: "${proxy.uuid}"`);
      lines.push(`  udp: ${proxy.udp !== false}`);
      lines.push(`  tls: ${proxy.tls || false}`);
      lines.push(`  skip-cert-verify: ${proxy['skip-cert-verify'] || false}`);
      lines.push(`  network: ${proxy.network || 'tcp'}`);
      if (proxy.servername) lines.push(`  servername: "${proxy.servername}"`);
      if (proxy.flow) lines.push(`  flow: "${proxy.flow}"`);
      if (proxy['ws-opts']) {
        lines.push(`  ws-opts:`);
        if (proxy['ws-opts'].path) lines.push(`    path: "${proxy['ws-opts'].path}"`);
        if (proxy['ws-opts'].headers?.Host) lines.push(`    headers:`);
        if (proxy['ws-opts'].headers?.Host) lines.push(`      Host: "${proxy['ws-opts'].headers.Host}"`);
      }
      break;

    case 'http':
      lines.push(`- name: "${proxy.name}"`);
      lines.push(`  type: http`);
      lines.push(`  server: "${proxy.server}"`);
      lines.push(`  port: ${proxy.port}`);
      if (proxy.username) lines.push(`  username: "${proxy.username}"`);
      if (proxy.password) lines.push(`  password: "${proxy.password}"`);
      lines.push(`  tls: ${proxy.tls || false}`);
      break;

    case 'socks5':
      lines.push(`- name: "${proxy.name}"`);
      lines.push(`  type: socks5`);
      lines.push(`  server: "${proxy.server}"`);
      lines.push(`  port: ${proxy.port}`);
      if (proxy.username) lines.push(`  username: "${proxy.username}"`);
      if (proxy.password) lines.push(`  password: "${proxy.password}"`);
      lines.push(`  udp: ${proxy.udp !== false}`);
      break;
  }

  return lines;
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
      obj.udp = proxy.udp ?? true;
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
      obj.udp = proxy.udp ?? true;
      obj.network = proxy.network || 'tcp';
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
      if (proxy.tls) obj.tls = proxy.tls;
      if (proxy['skip-cert-verify']) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.flow) obj.flow = proxy.flow;
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
