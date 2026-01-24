import { ProxyNode } from './types';

// js-index-maps: Use Map for O(1) lookups instead of switch statement
const PROXY_LINK_GENERATORS = new Map<string, (proxy: ProxyNode) => string | null>([
  ['ss', ssToLink],
  ['ssr', ssrToLink],
  ['vmess', vmessToLink],
  ['trojan', trojanToLink],
  ['vless', vlessToLink],
  ['hysteria', hysteriaToLink],
  ['hysteria2', hysteriaToLink],
  ['socks5', socks5ToLink],
  ['http', httpToLink],
]);

// Parse Clash YAML to extract proxy nodes
export function parseYamlToProxies(yaml: string): ProxyNode[] {
  const lines = yaml.split('\n');
  const proxies: ProxyNode[] = [];
  let inProxiesSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're entering the proxies section
    const trimmedLine = line.trim();
    if (trimmedLine === 'proxies:') {
      inProxiesSection = true;
      continue;
    }

    // Exit proxies section when we hit another section at the same level
    if (inProxiesSection && (trimmedLine.startsWith('proxy-groups:') || trimmedLine.startsWith('rules:'))) {
      break;
    }

    if (!inProxiesSection) continue;

    // Skip empty lines
    if (!trimmedLine) continue;

    // Parse proxy lines in various formats:
    // 1. Single-line JSON format: - {"type":"ss",...} or - {'type':'ss',...}
    if (trimmedLine.startsWith('- {') || trimmedLine.startsWith("- {")) {
      try {
        const jsonStr = trimmedLine.substring(2).trim();
        const proxyConfig = JSON.parse(jsonStr);
        if (proxyConfig.type && proxyConfig.name) {
          proxies.push(proxyConfig as ProxyNode);
        }
      } catch {
        // JSON parse failed, try multiline YAML parsing
        const proxy = parseYamlProxyLine(lines, i);
        if (proxy) {
          proxies.push(proxy);
        }
      }
      continue;
    }

    // 2. Check for multiline YAML format starting with "- name:"
    // Check if line starts with dash (proxy entry marker) after trimming leading whitespace
    const dashMatch = line.match(/^(\s*)-\s+(.+)/);
    if (dashMatch) {
      const indent = dashMatch[1].length;
      const rest = dashMatch[2].trim();

      // Check if this is a proxy entry (starts with "name:" or contains "name:")
      if (rest.startsWith('name:') || rest.startsWith('"name"') || rest.startsWith("'name'")) {
        const proxy = parseYamlProxyLine(lines, i);
        if (proxy) {
          proxies.push(proxy);
        }
        continue;
      }
    }

    // 3. Check for lines with just "-" that start a multiline proxy entry
    if (trimmedLine === '-' && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.startsWith('name:') || nextLine.startsWith('"name"') || nextLine.startsWith("'name'")) {
        const proxy = parseYamlProxyLine(lines, i);
        if (proxy) {
          proxies.push(proxy);
        }
        continue;
      }
    }
  }

  return proxies;
}

// Parse proxy from YAML multiline format
function parseYamlProxyLine(lines: string[], startIndex: number): ProxyNode | null {
  let firstLine = lines[startIndex].trim();

  // Handle case where first line is just "-"
  if (firstLine === '-' && startIndex + 1 < lines.length) {
    startIndex++;
    firstLine = lines[startIndex].trim();
  }

  // Extract name from first line
  // Supports: - name: "xxx", - name: 'xxx', - name: xxx, or just name: "xxx" (after -)
  const nameMatch = firstLine.match(/^(?:-\s*)?name:\s*["']?([^"'\n]+?)["'?]?$/);
  if (!nameMatch) {
    return null;
  }

  const name = nameMatch[1].trim();
  let type = '';
  const config: any = { name };

  // Determine the base indentation level (2 spaces for proxies section)
  // Proxy entries typically have 2-space indent, properties have 4-space indent
  const baseIndent = 2;

  // Parse subsequent lines
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) continue;

    // Check if we've hit a new section (proxy-groups or rules at base level)
    if (trimmedLine === 'proxy-groups:' || trimmedLine === 'rules:') {
      break;
    }

    // Check if we've hit a new proxy entry
    // A new proxy entry starts with "- name:" at the 2-space indent level
    if (line.match(/^\s{2}-\s+name:/)) {
      break;
    }

    // Calculate current line's indentation
    const indentMatch = line.match(/^(\s*)/);
    const currentIndent = indentMatch ? indentMatch[1].length : 0;

    // Skip lines at or above base indent (not part of current proxy config)
    if (currentIndent <= baseIndent) {
      break;
    }

    // Parse key-value pairs (lines with more than base indent)
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(currentIndent, colonIndex).trim();
    let valueStr = line.substring(colonIndex + 1).trim();
    let value: string | number | boolean | null;

    // Handle different value types
    if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
      // Double-quoted string
      value = valueStr.slice(1, -1);
    } else if (valueStr.startsWith("'") && valueStr.endsWith("'")) {
      // Single-quoted string
      value = valueStr.slice(1, -1);
    } else if (valueStr === 'true') {
      value = true;
    } else if (valueStr === 'false') {
      value = false;
    } else if (valueStr === '' || valueStr === 'null' || valueStr === '~') {
      value = null;
    } else if (!isNaN(Number(valueStr))) {
      value = Number(valueStr);
    } else {
      // Unquoted string
      value = valueStr;
    }

    if (key === 'type') {
      type = String(value);
    }
    config[key] = value;
  }

  if (!type) return null;
  return config as ProxyNode;
}

// Convert proxies back to proxy links (for export)
export function proxiesToLinks(proxies: ProxyNode[]): string[] {
  const links: string[] = [];

  for (const proxy of proxies) {
    const link = proxyToLink(proxy);
    if (link) {
      links.push(link);
    }
  }

  return links;
}

// Convert a single proxy to its link format
// js-index-maps: Use Map.get() for O(1) lookup instead of switch statement
function proxyToLink(proxy: ProxyNode): string | null {
  const generator = PROXY_LINK_GENERATORS.get(proxy.type);
  return generator ? generator(proxy) : null;
}

// Helper function to check if a name is a default name (should not have suffix)
function isDefaultName(name: string): boolean {
  return /^defaultName_\d+$/.test(name);
}

// Helper functions to convert proxy config to link
function ssToLink(proxy: ProxyNode): string {
  const userInfo = `${proxy.cipher}:${proxy.password}`;
  const encoded = btoa(userInfo);
  return `ss://${encoded}@${proxy.server}:${proxy.port}#${encodeURIComponent(proxy.name)}`;
}

function ssrToLink(proxy: ProxyNode): string {
  // SSR format: ssr://base64(main)/base64(params)
  // where main is: server:port:protocol:method:obfs:passwordbase64/ (trailing / included)
  // and params is: key=value&key=value where VALUES are base64 encoded, then the entire params string is base64 encoded
  // SSR links use unpadded base64 (no = padding chars) for the main part
  // Map cipher 'dummy' back to 'auto' for SSR link format (reverse of parsing)
  const cipher = proxy.cipher === 'dummy' ? 'auto' : proxy.cipher;
  const passwordEncoded = btoa(proxy.password);
  // Include trailing / in the plain string before encoding
  const plain = `${proxy.server}:${proxy.port}:${proxy.protocol}:${cipher}:${proxy.obfs}:${passwordEncoded}/`;
  let encoded = btoa(plain);
  // Remove base64 padding characters (=) from the main part
  encoded = encoded.replace(/=+$/, '');

  // Build params string with base64 encoded VALUES
  const paramsParts: string[] = [];
  paramsParts.push(`remarks=${btoa(proxy.name)}`);
  if (proxy.group) {
    paramsParts.push(`group=${btoa(proxy.group)}`);
  }
  if (proxy['protoparam']) {
    paramsParts.push(`protoparam=${btoa(proxy['protoparam'])}`);
  }
  if (proxy['obfsparam']) {
    paramsParts.push(`obfsparam=${btoa(proxy['obfsparam'])}`);
  }

  // Base64 encode the entire params string
  const paramsStr = paramsParts.join('&');
  const encodedParams = btoa(paramsStr);

  // Combine with / separator (no ?)
  return `ssr://${encoded}/${encodedParams}`;
}

function vmessToLink(proxy: ProxyNode): string {
  // Build JSON string manually to match expected key order: v, ps, add, port, id, aid, scy, net, tls
  const jsonStr = `{"v":"2","ps":"${proxy.name}","add":"${proxy.server}","port":${proxy.port},"id":"${proxy.uuid}","aid":${proxy.alterId || 0},"scy":"${proxy.cipher || 'auto'}","net":"${proxy.network || 'tcp'}","tls":"${proxy.tls ? 'tls' : ''}"}`;
  const encoded = btoa(jsonStr);
  return `vmess://${encoded}`;
}

function trojanToLink(proxy: ProxyNode): string {
  let link = `trojan://${proxy.password}@${proxy.server}:${proxy.port}`;
  const params: string[] = [];
  params.push(`type=${proxy.network || 'tcp'}`);
  if (proxy['skip-cert-verify']) {
    params.push('security=tls');
    params.push('allowInsecure=1');
  }
  if (proxy.sni) params.push(`sni=${encodeURIComponent(proxy.sni)}`);
  if (params.length) link += `?${params.join('&')}`;
  link += `#${encodeURIComponent(proxy.name)}`;
  return link;
}

function vlessToLink(proxy: ProxyNode): string {
  let link = `vless://${proxy.uuid}@${proxy.server}:${proxy.port}`;
  const params: string[] = [];
  params.push(`security=${proxy.tls ? 'tls' : 'none'}`);
  params.push(`type=${proxy.network || 'tcp'}`);
  params.push(`encryption=none`);
  if (proxy.flow && proxy.flow !== '') params.push(`flow=${proxy.flow}`);
  if (proxy.network === 'tcp' || !proxy.flow || proxy.flow === '') params.push('headerType=none');
  if (proxy.sni) params.push(`sni=${encodeURIComponent(proxy.sni)}`);
  if (proxy['skip-cert-verify']) params.push('allowInsecure=1');
  if (params.length) link += `?${params.join('&')}`;
  link += `#${encodeURIComponent(proxy.name)}`;
  return link;
}

function hysteriaToLink(proxy: ProxyNode): string {
  // Hysteria v2 has 'password' property, v1 has 'auth_str' property
  const isHysteria2 = proxy.password !== undefined;

  if (isHysteria2) {
    // Hysteria2 format: hysteria2://password@server:port/?params#name
    let link = `hysteria2://${proxy.password}@${proxy.server}:${proxy.port}`;
    const params: string[] = [];
    if (proxy.sni) params.push(`sni=${encodeURIComponent(proxy.sni)}`);
    if (proxy['skip-cert-verify']) params.push('insecure=1');
    if (params.length) link += `/?${params.join('&')}`;
    link += `#${encodeURIComponent(proxy.name)}`;
    return link;
  } else {
    // Hysteria v1 format: hysteria://server:port?params#name
    let link = `hysteria://${proxy.server}:${proxy.port}`;
    const params: string[] = [];
    if (proxy.protocol) params.push(`protocol=${proxy.protocol}`);
    // Use auth_str if available, otherwise fall back to auth
    const authValue = proxy.auth_str || proxy.auth;
    if (authValue) params.push(`auth=${encodeURIComponent(authValue)}`);
    if (proxy.sni) params.push(`peer=${encodeURIComponent(proxy.sni)}`);
    if (proxy['skip-cert-verify']) params.push('insecure=1');
    if (proxy.up) params.push(`upmbps=${proxy.up}`);
    if (proxy.down) params.push(`downmbps=${proxy.down}`);
    if (proxy.alpn) {
      const alpnValue = Array.isArray(proxy.alpn) ? proxy.alpn[0] : proxy.alpn;
      params.push(`alpn=${encodeURIComponent(alpnValue)}`);
    }
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(proxy.name)}`;
    return link;
  }
}

function socks5ToLink(proxy: ProxyNode): string {
  let link = `socks5://`;
  if (proxy.username && proxy.password) {
    link += `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`;
  }
  link += `${proxy.server}:${proxy.port}`;
  if (!isDefaultName(proxy.name)) {
    link += `#${encodeURIComponent(proxy.name)}`;
  }
  return link;
}

function httpToLink(proxy: ProxyNode): string {
  let link = `http://`;
  if (proxy.username && proxy.password) {
    link += `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`;
  }
  link += `${proxy.server}:${proxy.port}`;
  if (!isDefaultName(proxy.name)) {
    link += `#${encodeURIComponent(proxy.name)}`;
  }
  return link;
}
