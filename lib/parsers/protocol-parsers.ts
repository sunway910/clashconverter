import { ParsedProxy, ProxyNode } from '../types';
import { base64Decode, parseUrlParams, safeJsonParse } from '../utils';

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

    const encoded = mainPart.split('/')[0];
    const decoded = base64Decode(encoded);

    // Format: server:port:protocol:method:obfs:passwordbase64/?params
    const parts = decoded.split('/?');
    const configMainPart = parts[0];
    const params = parseUrlParams(parts[1] || '');

    const [server, port, protocol, method, obfs, passwordB64] = configMainPart.split(':');
    const password = base64Decode(passwordB64);
    const nodeName = name || (params.remarks ? base64Decode(params.remarks) : 'SSR');

    return {
      name: nodeName,
      config: {
        name: nodeName,
        type: 'ssr',
        server,
        port: parseInt(port, 10),
        cipher: method,
        password,
        protocol,
        protocolparam: params.protoparam || '',
        obfs,
        obfsparam: params.obfsparam || '',
      } as ProxyNode,
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
        // For VMess with TLS, allowInsecure field controls skip-cert-verify
        // When allowInsecure is not explicitly set to true, default to true for WS+TLS
        'skip-cert-verify': config.allowInsecure === 'true' || config.allowInsecure === true || config.allowInsecure === 1 || (config.tls === 'tls' && config.net === 'ws'),
        servername: config.sni || config.host || '',
        'ws-opts': config.net === 'ws' ? {
          path: config.path || '/',
          headers: config.host ? { host: config.host } : undefined,
        } : undefined,
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}

// Trojan parser: trojan://password@server:port?params#name
export function parseTrojan(link: string): ParsedProxy | null {
  if (!link.startsWith('trojan://')) return null;

  try {
    const url = new URL(link);
    const params = parseUrlParams(url.search.slice(1));
    const name = url.hash ? decodeURIComponent(url.hash.slice(1)) : 'Trojan';

    return {
      name,
      config: {
        name,
        type: 'trojan',
        server: url.hostname,
        port: parseInt(url.port, 10),
        password: decodeURIComponent(url.username),
        udp: true,
        'skip-cert-verify': params.allowInsecure === '1' || params.insecure === '1',
        sni: params.sni || params.peer || '',
        network: params.type || 'tcp',
      } as ProxyNode,
    };
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
        auth: params.auth || '',
        protocol: params.protocol || 'udp',
        'skip-cert-verify': params.insecure === '1',
        sni: params.peer || '',
        up: params.upmbps || '10',
        down: params.downmbps || '50',
        alpn: params.alpn || 'h3',
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
      udp: true,
      network: params.type || 'tcp',
      flow: params.flow || '',
      'skip-cert-verify': params.allowInsecure === '1',
    } as ProxyNode;

    // Handle TLS
    if (params.security === 'tls' || params.security === 'reality') {
      config.tls = true;
      config.servername = params.sni || '';
    }

    // Handle Reality
    if (params.security === 'reality') {
      config['reality-opts'] = {
        'public-key': params.pbk || '',
        'short-id': params.sid || '',
      };
      config['client-fingerprint'] = params.fp || 'chrome';
    }

    // WebSocket options
    if (params.type === 'ws') {
      config['ws-opts'] = {
        path: params.path || '/',
        headers: params.host ? { Host: params.host } : undefined,
      };
    }

    // gRPC options
    if (params.type === 'grpc') {
      config['grpc-opts'] = {
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
export function parseHttp(link: string): ParsedProxy | null {
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
        udp: true,
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
    const url = new URL(link);
    const params = parseUrlParams(url.search.slice(1));

    const server = params.server;
    const port = params.port;
    const user = params.user;
    const pass = params.pass;

    if (!server || !port) return null;

    const type = link.includes('/socks') ? 'socks5' : 'http';

    return {
      name: 'Telegram',
      config: {
        name: 'Telegram',
        type: type as any,
        server,
        port: parseInt(port, 10),
        username: user,
        password: pass,
        udp: type === 'socks5',
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}
