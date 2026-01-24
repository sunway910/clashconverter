import { ProxyNode } from '../../types';
import { CLASH_RULES } from '../config/rules';
import {
  DNS_CONFIG,
  BASIC_CONFIG,
  HEADER_BANNER,
  FOOTER_BANNER,
  PROXY_GROUPS_CONFIG,
} from '../config/dns';

// Generate header with metadata
function setHeader(lines: string[], nodeCount: number): void {
  const now = new Date();
  const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  lines.push(...HEADER_BANNER);
  lines.push(`#  create_time：${createTime}`);
  lines.push(`#  node num：${nodeCount}`);
  lines.push(...FOOTER_BANNER);
}

// Generate proxy groups section
function setProxyGroups(lines: string[], proxyNames: string[]): void {
  lines.push('');
  lines.push('proxy-groups:');
  for (const group of PROXY_GROUPS_CONFIG) {
    lines.push(`  - name: ${group.name}`);
    lines.push(`    type: ${group.type}`);

    if (group.url) {
      lines.push(`    url: ${group.url}`);
    }
    if (group.interval) {
      lines.push(`    interval: ${group.interval}`);
    }
    if (group.tolerance) {
      lines.push(`    tolerance: ${group.tolerance}`);
    }

    lines.push('    proxies:');
    for (const proxy of group.proxies) {
      lines.push(`      - ${proxy}`);
    }
    if (group.useAllProxies) {
      for (const name of proxyNames) {
        lines.push(`      - ${name}`);
      }
    }
  }
}

// Generate DNS configuration
function setDnsConfig(lines: string[]): void {
  lines.push('');
  lines.push(...DNS_CONFIG);
}

// Generate basic configuration
function setBasicConfig(lines: string[]): void {
  lines.push(...BASIC_CONFIG);
}

// Generate proxies section
function setProxies(lines: string[], proxies: ProxyNode[]): void {
  lines.push('proxies:');
  for (const proxy of proxies) {
    lines.push('  - ' + formatProxyJson(proxy));
  }
}

// Simple YAML generator using js-yaml alternative
export function generateSimpleYaml(proxies: ProxyNode[]): string {
  if (proxies.length === 0) {
    return '# No proxies found\n';
  }

  const lines: string[] = [];

  // Generate header
  setHeader(lines, proxies.length);

  // Generate basic configuration
  setBasicConfig(lines);

  // Generate proxies
  setProxies(lines, proxies);

  // Generate unique names to avoid duplicates
  const uniqueNames = Array.from(new Set(proxies.map((p) => p.name)));

  // Generate proxy groups
  setProxyGroups(lines, uniqueNames);

  // Generate DNS configuration
  setDnsConfig(lines);

  // Add rules section
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
      if (proxy.group) obj.group = proxy.group;
      break;

    case 'vmess':
      obj.uuid = proxy.uuid;
      obj.alterId = proxy.alterId || 0;
      obj.cipher = proxy.cipher || 'auto';
      obj.network = proxy.network || 'tcp';
      if (proxy.tls !== undefined) obj.tls = proxy.tls;
      if (proxy['skip-cert-verify'] !== undefined) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.servername) obj.servername = proxy.servername;
      break;

    case 'trojan':
      obj.password = proxy.password;
      obj.udp = proxy.udp ?? true;
      if (proxy['skip-cert-verify']) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.sni) obj.sni = proxy.sni;
      break;

    case 'hysteria':
      obj.auth_str = proxy.auth_str || proxy.auth || '';
      obj.protocol = proxy.protocol || 'udp';
      if (proxy['skip-cert-verify']) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.sni) obj.sni = proxy.sni;
      obj.up = proxy.up || 10;
      obj.down = proxy.down || 50;
      obj.alpn = proxy.alpn || (proxy.alpn === '' ? [] : ['h3']);
      break;

    case 'hysteria2':
      obj.password = proxy.password;
      if (proxy['skip-cert-verify']) obj['skip-cert-verify'] = proxy['skip-cert-verify'];
      if (proxy.sni) obj.sni = proxy.sni;
      break;

    case 'vless':
      obj.uuid = proxy.uuid;
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
      break;
  }

  return JSON.stringify(obj);
}
