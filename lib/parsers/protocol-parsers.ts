import { ParsedProxy, ProxyNode } from '../types';
import { base64Decode, parseUrlParams, safeJsonParse } from '../utils';

// Shadowsocks parser: ss://base64(method:password@server:port)#name
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
    const decoded = base64Decode(mainPart);
    if (decoded) {
      // Format: method:password@server:port
      const atIndex = decoded.lastIndexOf('@');
      if (atIndex !== -1) {
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
    }

    // Try URL format: ss://method:password@server:port#name
    const url = new URL(link);
    const [server, portStr] = (url.hostname || '').split(':');
    const port = parseInt(portStr || url.port || '8388', 10);
    const [method, password] = decodeURIComponent(url.username).split(':');

    return {
      name: decodeURIComponent(url.hash.slice(1)) || 'SS',
      config: {
        name,
        type: 'ss',
        server: url.hostname || server,
        port,
        cipher: method || 'aes-256-gcm',
        password,
        udp: true,
      } as ProxyNode,
    };
  } catch {
    return null;
  }
}

// ShadowsocksR parser: ssr://base64
export function parseSSR(link: string): ParsedProxy | null {
  if (!link.startsWith('ssr://')) return null;

  try {
    const encoded = link.slice(6).split('/')[0];
    const decoded = base64Decode(encoded);

    // Format: server:port:protocol:method:obfs:passwordbase64/?params
    const parts = decoded.split('/?');
    const mainPart = parts[0];
    const params = parseUrlParams(parts[1] || '');

    const [server, port, protocol, method, obfs, passwordB64] = mainPart.split(':');
    const password = base64Decode(passwordB64);
    const name = params.remarks ? base64Decode(params.remarks) : 'SSR';

    return {
      name,
      config: {
        name,
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
        'skip-cert-verify': config.allowInsecure === 'true',
        servername: config.sni || config.host || '',
        'ws-opts': config.net === 'ws' ? {
          path: config.path || '/',
          headers: config.host ? { Host: config.host } : undefined,
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

// Hysteria2 parser: hysteria2://uuid@server:port?params#name
export function parseHysteria2(link: string): ParsedProxy | null {
  if (!link.startsWith('hysteria2://')) return null;

  try {
    const url = new URL(link);
    const params = parseUrlParams(url.search.slice(1));
    const name = url.hash ? decodeURIComponent(url.hash.slice(1)) : 'Hysteria2';

    return {
      name,
      config: {
        name,
        type: 'hysteria',
        server: url.hostname,
        port: parseInt(url.port, 10),
        password: decodeURIComponent(url.username),
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

    return {
      name,
      config: {
        name,
        type: 'vless',
        server: url.hostname,
        port: parseInt(url.port, 10),
        uuid: decodeURIComponent(url.username),
        udp: true,
        network: params.type || 'tcp',
        tls: params.security === 'tls',
        'skip-cert-verify': params.allowInsecure === '1',
        servername: params.sni || '',
        flow: params.flow || '',
        'ws-opts': params.type === 'ws' ? {
          path: params.path || '/',
          headers: params.host ? { Host: params.host } : undefined,
        } : undefined,
      } as ProxyNode,
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
