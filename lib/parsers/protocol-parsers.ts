import { ParsedProxy, ProxyNode } from '../types';
import { base64Decode, parseUrlParams, safeJsonParse } from '../utils';

// js-hoist-regexp: Hoist RegExp outside function for reuse
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

/**
 * Split "server:port" (or bare server) handling bracketed IPv6 like [::1]:443
 * @returns Tuple of server host (brackets stripped) and parsed port (NaN if absent)
 */
function splitHostPort(serverInfo: string): [string, number] {
  let host = serverInfo.replace(/\/+$/, '');
  if (host.startsWith('[') && host.includes(']')) {
    const end = host.indexOf(']');
    host = host.slice(1, end) + host.slice(end + 1);
  }
  const colonIndex = host.lastIndexOf(':');
  if (colonIndex === -1) return [host, NaN];
  const portStr = host.slice(colonIndex + 1);
  if (!/^\d+$/.test(portStr)) return [host, NaN];
  return [host.slice(0, colonIndex), parseInt(portStr, 10)];
}

// Shadowsocks parser: ss://base64(method:password@server:port)#name or ss://base64(method:password)@server:port#name
export function parseSS(link: string): ParsedProxy | null {
  if (!link.startsWith('ss://')) return null;

  try {
    // Remove ss:// prefix
    const rest = link.slice(5);

    // Split by # to get name
    const hashIndex = rest.indexOf('#');
    const mainPart = hashIndex !== -1 ? rest.slice(0, hashIndex) : rest;
    const name = hashIndex !== -1 ? decodeURIComponent(rest.slice(hashIndex + 1)) : 'SS';

    // Check if it's SIP002 format (base64 encoded)
    // Format 1: ss://base64(method:password@server:port)#name - everything is base64 encoded
    // Format 2: ss://base64(method:password)@server:port#name - only method:password is base64 encoded

    // First, try to decode the entire mainPart
    let decoded = base64Decode(mainPart);
    if (decoded && decoded.includes('@')) {
      // Format 1: method:password@server:port is base64 encoded
      const atIndex = decoded.lastIndexOf('@');
      const userInfo = decoded.slice(0, atIndex);
      const serverInfo = decoded.slice(atIndex + 1);

      const colonIndex = userInfo.indexOf(':');
      const method = userInfo.slice(0, colonIndex);
      const password = userInfo.slice(colonIndex + 1);

      const [server, portStr] = serverInfo.split(':');
      const port = parseInt(portStr, 10);

      return {
        name,
        config: {
          name,
          type: 'ss',
          server,
          port,
          cipher: method,
          password,
          udp: true,
        } as ProxyNode,
      };
    }

    // Format 2: base64(method:password)@server:port
    // Find the @ separator - it should be between the base64 part and server part
    const atIndex = mainPart.indexOf('@');
    if (atIndex !== -1) {
      const encodedUserInfo = mainPart.slice(0, atIndex);
      const serverInfo = mainPart.slice(atIndex + 1);

      decoded = base64Decode(encodedUserInfo);
      if (decoded) {
        const colonIndex = decoded.indexOf(':');
        const method = decoded.slice(0, colonIndex);
        const password = decoded.slice(colonIndex + 1);

        const [server, portStr] = serverInfo.split(':');
        const port = parseInt(portStr, 10);

        return {
          name,
          config: {
            name,
            type: 'ss',
            server,
            port,
            cipher: method,
            password,
            udp: true,
          } as ProxyNode,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ShadowsocksR parser: ssr://base64#name
export function parseSSR(link: string): ParsedProxy | null {
  if (!link.startsWith('ssr://')) return null;

  try {
    // Remove ssr:// prefix
    const rest = link.slice(6);

    // Split by # to get name (the part after # is the node name)
    const hashIndex = rest.indexOf('#');
    const mainPart = hashIndex !== -1 ? rest.slice(0, hashIndex) : rest;
    const name = hashIndex !== -1 ? decodeURIComponent(rest.slice(hashIndex + 1)) : null;

    // The mainPart may contain the query params, split on first / to separate them
    // But we need to preserve everything for the full decode
    const decoded = base64Decode(mainPart);

    // Format: server:port:protocol:method:obfs:passwordbase64/?params
    // Find the last /? separator which separates config from params
    const queryIndex = decoded.lastIndexOf('/?');
    const configMainPart = queryIndex !== -1 ? decoded.slice(0, queryIndex) : decoded;
    const paramsStr = queryIndex !== -1 ? decoded.slice(queryIndex + 2) : '';
    const params = parseUrlParams(paramsStr);

    const parts = configMainPart.split(':');
    // Handle case where password base64 might contain additional colons
    const server = parts[0];
    const port = parts[1];
    const protocol = parts[2];
    const method = parts[3];
    const obfs = parts[4];
    const passwordB64 = parts.slice(5).join(':'); // Join remaining parts in case password contains colons

    const password = base64Decode(passwordB64);
    const nodeName = name || (params.remarks ? base64Decode(params.remarks) : 'SSR');

    // Map SSR cipher method to Clash cipher format
    // 'none' in SSR should be mapped to 'dummy' for Clash
    const cipher = method === 'none' ? 'dummy' : method;

    const config: any = {
      name: nodeName,
      type: 'ssr',
      server,
      port: parseInt(port, 10),
      cipher,
      password,
      protocol,
      obfs,
    };

    // Add optional params
    if (params.protoparam) config.protocolparam = params.protoparam;
    if (params.obfsparam) config.obfsparam = params.obfsparam;
    if (params.group) config.group = base64Decode(params.group);

    return {
      name: nodeName,
      config: config as ProxyNode,
    };
  } catch {
    return null;
  }
}

// VMess parser: vmess://base64(json)#name
export function parseVmess(link: string): ParsedProxy | null {
  if (!link.startsWith('vmess://')) return null;

  try {
    // Remove vmess:// prefix
    const rest = link.slice(8);

    // Split by # to get name (the part after # is the node name)
    const hashIndex = rest.indexOf('#');
    const encoded = hashIndex !== -1 ? rest.slice(0, hashIndex) : rest;
    const name = hashIndex !== -1 ? decodeURIComponent(rest.slice(hashIndex + 1)) : null;

    const decoded = base64Decode(encoded);
    const config = safeJsonParse<any>(decoded, null);

    if (!config) return null;

    const nodeName = name || config.ps || 'Vmess';

    return {
      name: nodeName,
      config: {
        name: nodeName,
        type: 'vmess',
        server: config.add,
        port: parseInt(config.port, 10),
        uuid: config.id,
        alterId: parseInt(config.aid || '0', 10),
        cipher: config.scy || 'auto',
        network: config.net || 'tcp',
        tls: config.tls === 'tls' || config.tls === 'true',
        udp: true,
        // Default skip-cert-verify to false unless explicitly set
        'skip-cert-verify': config.allowInsecure === 'true' || config.allowInsecure === '1' || config.allowInsecure === 1,
        servername: config.sni || config.host || '',
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}

// Trojan parser: trojan://password@server:port?params#name
// Supports standard Trojan and Trojan-Go links (ws/h2/grpc transports, encryption=ss;method;password)
export function parseTrojan(link: string): ParsedProxy | null {
  if (!link.startsWith('trojan://')) return null;

  try {
    const url = new URL(link);
    const params = parseUrlParams(url.search.slice(1));
    const name = url.hash ? decodeURIComponent(url.hash.slice(1)) : 'Trojan';

    // Normalize transport: only ws/h2/grpc are transports, everything else is tcp
    const rawNetwork = (params.type || 'tcp').toLowerCase();
    const network = rawNetwork === 'ws' || rawNetwork === 'grpc' || rawNetwork === 'h2' ? rawNetwork : 'tcp';

    // Trojan-Go Shadowsocks relay: encryption=ss;method;password
    const encryption = params.encryption ? params.encryption.split(';') : [];
    const ssOpts =
      encryption.length === 3 && encryption[0] === 'ss'
        ? { enabled: true, method: encryption[1], password: encryption[2] }
        : undefined;

    const config = {
      name,
      type: 'trojan',
      server: url.hostname,
      port: parseInt(url.port, 10),
      password: decodeURIComponent(url.username),
      udp: true,
      // Trojan defaults to skip-cert-verify=true (insecure) for compatibility
      // Set to false only if allowInsecure is explicitly 'false' or '0'
      'skip-cert-verify': params.allowInsecure !== 'false' && params.allowInsecure !== '0',
      sni: params.sni || params.peer || '',
      network,
      ...(ssOpts && { 'ss-opts': ssOpts }),
    } as ProxyNode;

    // WebSocket transport options
    if (network === 'ws') {
      (config as any)['ws-opts'] = {
        path: params.path || '/',
        ...(params.host && { headers: { Host: params.host } }),
      };
    }

    // gRPC transport options
    if (network === 'grpc') {
      (config as any)['grpc-opts'] = {
        'grpc-service-name': params.serviceName || params.path || '',
      };
    }

    // ALPN (comma separated)
    if (params.alpn) {
      const alpn = params.alpn.split(',').map(s => s.trim()).filter(Boolean);
      if (alpn.length) (config as any).alpn = alpn;
    }

    // uTLS fingerprint
    const fingerprint = params.fp || params['client-fingerprint'];
    if (fingerprint) (config as any)['client-fingerprint'] = fingerprint;

    return { name, config };
  } catch {
    return null;
  }
}

// WireGuard parser: wireguard://private-key@server:port?params#name (wg:// shorthand accepted)
export function parseWireguard(link: string): ParsedProxy | null {
  const lower = link.toLowerCase();
  if (!lower.startsWith('wireguard://') && !lower.startsWith('wg://')) return null;

  try {
    const scheme = lower.startsWith('wireguard://') ? 'wireguard://' : 'wg://';
    let rest = link.slice(scheme.length);

    // Extract hash (name)
    const hashIndex = rest.indexOf('#');
    const name = hashIndex !== -1 ? decodeURIComponent(rest.slice(hashIndex + 1)) : 'WireGuard';
    if (hashIndex !== -1) rest = rest.slice(0, hashIndex);

    // Extract query params (keys normalized: underscores -> hyphens, case-insensitive)
    const queryIndex = rest.indexOf('?');
    const params: Record<string, string> = {};
    if (queryIndex !== -1) {
      for (const [key, value] of Object.entries(parseUrlParams(rest.slice(queryIndex + 1)))) {
        params[key.replace(/_/g, '-').toLowerCase()] = value;
      }
      rest = rest.slice(0, queryIndex);
    }

    // Split private key (userinfo) from endpoint
    const atIndex = rest.lastIndexOf('@');
    if (atIndex === -1) return null;

    const privateKey = decodeURIComponent(rest.slice(0, atIndex)).trim();
    const [server, port] = splitHostPort(rest.slice(atIndex + 1));
    if (!server) return null;

    // Peer public key is mandatory for a working WireGuard node
    const publicKey = params['public-key'] || params.publickey || '';
    if (!publicKey) return null;

    // address/ip: comma separated local addresses, entries may carry a CIDR suffix
    let ip: string | undefined;
    let ipv6: string | undefined;
    for (const addr of (params.address || params.ip || '').split(',')) {
      const value = addr.trim().replace(/\/\d+$/, '').replace(/^\[|\]$/g, '');
      if (!value) continue;
      if (!ip && IPV4_REGEX.test(value)) ip = value;
      else if (!ipv6 && value.includes(':')) ipv6 = value;
    }

    // reserved: three comma separated integers (reused from sing-box style links)
    let reserved: number[] | undefined;
    if (params.reserved) {
      const parsed = params.reserved
        .split(',')
        .map(v => parseInt(v.trim(), 10))
        .filter(n => Number.isInteger(n));
      if (parsed.length === 3) reserved = parsed;
    }

    const config = {
      name,
      type: 'wireguard',
      server,
      port: Number.isInteger(port) ? port : 51820,
      'private-key': privateKey,
      'public-key': publicKey,
      udp: true,
      ...(ip && { ip }),
      ...(ipv6 && { ipv6 }),
      ...(params['pre-shared-key'] && { 'pre-shared-key': params['pre-shared-key'] }),
      ...(params['allowed-ips'] && {
        'allowed-ips': params['allowed-ips'].split(',').map(s => s.trim()).filter(Boolean),
      }),
      ...(reserved && { reserved }),
      ...(params.mtu && Number.isInteger(parseInt(params.mtu, 10)) && { mtu: parseInt(params.mtu, 10) }),
      ...(params['remote-dns-resolve'] && {
        'remote-dns-resolve': /^(true|1)$/i.test(params['remote-dns-resolve']),
      }),
      ...(params.dns && { dns: params.dns.split(',').map(s => s.trim()).filter(Boolean) }),
      ...(params['dialer-proxy'] && { 'dialer-proxy': params['dialer-proxy'] }),
    } as ProxyNode;

    return { name, config };
  } catch {
    return null;
  }
}

// AnyTLS parser: anytls://password@server:port?params#name
export function parseAnytls(link: string): ParsedProxy | null {
  if (!link.toLowerCase().startsWith('anytls://')) return null;

  try {
    let rest = link.slice('anytls://'.length);

    // Extract hash (name)
    const hashIndex = rest.indexOf('#');
    const name = hashIndex !== -1 ? decodeURIComponent(rest.slice(hashIndex + 1)) : 'AnyTLS';
    if (hashIndex !== -1) rest = rest.slice(0, hashIndex);

    // Extract query params
    const queryIndex = rest.indexOf('?');
    const params = queryIndex !== -1 ? parseUrlParams(rest.slice(queryIndex + 1)) : {};
    if (queryIndex !== -1) rest = rest.slice(0, queryIndex);

    // Split password (userinfo) from endpoint
    const atIndex = rest.lastIndexOf('@');
    if (atIndex === -1) return null;

    const password = decodeURIComponent(rest.slice(0, atIndex));
    const [server, port] = splitHostPort(rest.slice(atIndex + 1));
    if (!server) return null;

    const insecure = params['skip-cert-verify'] || params.allowInsecure || params.allow_insecure;
    const fingerprint = params.fp || params.fingerprint || params['client-fingerprint'];

    const idleCheck = parseInt(params['idle-session-check-interval'] || '', 10);
    const idleTimeout = parseInt(params['idle-session-timeout'] || '', 10);
    const minIdle = parseInt(params['min-idle-session'] || '', 10);

    const config = {
      name,
      type: 'anytls',
      server,
      port: Number.isInteger(port) ? port : 443,
      password,
      'skip-cert-verify': insecure ? /^(true|1)$/i.test(insecure) : false,
      udp: params.udp ? /^(true|1)$/i.test(params.udp) : true,
      ...(params.sni && { sni: params.sni }),
      ...(params.alpn && { alpn: params.alpn.split(',').map(s => s.trim()).filter(Boolean) }),
      ...(fingerprint && { 'client-fingerprint': fingerprint }),
      ...(Number.isInteger(idleCheck) && { 'idle-session-check-interval': idleCheck }),
      ...(Number.isInteger(idleTimeout) && { 'idle-session-timeout': idleTimeout }),
      ...(Number.isInteger(minIdle) && { 'min-idle-session': minIdle }),
    } as ProxyNode;

    return { name, config };
  } catch {
    return null;
  }
}

// Hysteria2 parser: hysteria2://password@server:port?params#name or hysteria2://password@server:port/?params#name
export function parseHysteria2(link: string): ParsedProxy | null {
  if (!link.startsWith('hysteria2://')) return null;

  try {
    // Remove hysteria2:// prefix
    let rest = link.slice(12);

    // Extract hash (name) first
    const hashIndex = rest.indexOf('#');
    const name = hashIndex !== -1 ? decodeURIComponent(rest.slice(hashIndex + 1)) : 'Hysteria2';
    if (hashIndex !== -1) {
      rest = rest.slice(0, hashIndex);
    }

    // Extract query params
    const queryIndex = rest.indexOf('?');
    let params: Record<string, string> = {};
    if (queryIndex !== -1) {
      params = parseUrlParams(rest.slice(queryIndex + 1));
      rest = rest.slice(0, queryIndex);
    }

    // Parse user info and server info
    // Format: password@server:port or password@server:port/
    const atIndex = rest.indexOf('@');
    if (atIndex === -1) return null;

    const password = decodeURIComponent(rest.slice(0, atIndex));
    let serverInfo = rest.slice(atIndex + 1);

    // Remove trailing slash if present
    if (serverInfo.endsWith('/')) {
      serverInfo = serverInfo.slice(0, -1);
    }

    const [server, portStr] = serverInfo.split(':');
    const port = parseInt(portStr, 10);
    if (!server || isNaN(port)) return null;

    return {
      name,
      config: {
        name,
        type: 'hysteria2',
        server,
        port,
        password,
        'skip-cert-verify': params.insecure === '1',
        sni: params.sni || '',
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}

// Hysteria parser: hysteria://server:port?params#name
export function parseHysteria(link: string): ParsedProxy | null {
  if (!link.startsWith('hysteria://')) return null;

  try {
    const url = new URL(link);
    const params = parseUrlParams(url.search.slice(1));
    const name = url.hash ? decodeURIComponent(url.hash.slice(1)) : 'Hysteria';

    return {
      name,
      config: {
        name,
        type: 'hysteria',
        server: url.hostname,
        port: parseInt(url.port, 10),
        auth_str: params.auth || '',
        protocol: params.protocol || 'udp',
        'skip-cert-verify': params.insecure === '1',
        sni: params.peer || '',
        up: parseInt(params.upmbps || '10', 10),
        down: parseInt(params.downmbps || '50', 10),
        alpn: params.alpn ? [params.alpn] : ['h3'],
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}

// VLESS parser: vless://uuid@server:port?params#name
export function parseVless(link: string): ParsedProxy | null {
  if (!link.startsWith('vless://')) return null;

  try {
    const url = new URL(link);
    const params = parseUrlParams(url.search.slice(1));
    const name = url.hash ? decodeURIComponent(url.hash.slice(1)) : 'VLESS';

    const config: ProxyNode = {
      name,
      type: 'vless',
      server: url.hostname,
      port: parseInt(url.port, 10),
      uuid: decodeURIComponent(url.username),
      network: params.type || 'tcp',
      flow: params.flow || '',
      'skip-cert-verify': params.allowInsecure === '1',
    } as ProxyNode;

    // Handle TLS
    if (params.security === 'tls' || params.security === 'reality') {
      (config as any).tls = true;
      (config as any).servername = params.sni || '';
    }

    // Handle Reality
    if (params.security === 'reality') {
      (config as any)['reality-opts'] = {
        'public-key': params.pbk || '',
        'short-id': params.sid || '',
      };
      (config as any)['client-fingerprint'] = params.fp || 'chrome';
    }

    // WebSocket options
    if (params.type === 'ws') {
      (config as any)['ws-opts'] = {
        path: params.path || '/',
        headers: params.host ? { Host: params.host } : undefined,
      };
    }

    // gRPC options
    if (params.type === 'grpc') {
      (config as any)['grpc-opts'] = {
        'grpc-service-name': params.serviceName || params.service || '',
      };
    }

    return {
      name,
      config,
    };
  } catch {
    return null;
  }
}

// HTTP parser: http://user:pass@server:port
// Note: Must NOT match Telegram links (https://t.me/socks or https://t.me/http)
export function parseHttp(link: string): ParsedProxy | null {
  // Skip Telegram links - they are handled by parseTelegramLink
  if (link.startsWith('https://t.me/socks') || link.startsWith('https://t.me/http')) {
    return null;
  }
  if (!link.startsWith('http://') && !link.startsWith('https://')) return null;

  try {
    const url = new URL(link);
    const name = url.hash ? decodeURIComponent(url.hash.slice(1)) : 'HTTP';

    return {
      name,
      config: {
        name,
        type: 'http',
        server: url.hostname,
        port: parseInt(url.port || (url.protocol === 'https:' ? '443' : '80'), 10),
        username: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        tls: url.protocol === 'https:',
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}

// SOCKS5 parser: socks5://user:pass@server:port
export function parseSocks5(link: string): ParsedProxy | null {
  if (!link.startsWith('socks5://') && !link.startsWith('socks://')) return null;

  try {
    const url = new URL(link);
    const name = url.hash ? decodeURIComponent(url.hash.slice(1)) : 'SOCKS5';

    return {
      name,
      config: {
        name,
        type: 'socks5',
        server: url.hostname,
        port: parseInt(url.port || '1080', 10),
        username: url.username ? decodeURIComponent(url.username) : undefined,
        password: url.password ? decodeURIComponent(url.password) : undefined,
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}

// Telegram socks/http link parser
export function parseTelegramLink(link: string): ParsedProxy | null {
  if (!link.startsWith('https://t.me/socks') && !link.startsWith('https://t.me/http')) {
    return null;
  }

  try {
    const params = parseUrlParams(link);

    const server = params.server;
    const port = params.port;
    const user = params.user;
    const pass = params.pass;

    if (!server || !port) return null;

    const isSocks = link.includes('/socks');
    const type = isSocks ? 'socks5' : 'http';
    const name = isSocks ? 'SOCKS5' : 'HTTP';

    return {
      name,
      config: {
        name,
        type: type as any,
        server,
        port: parseInt(port, 10),
        username: user || undefined,
        password: pass || undefined,
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}
