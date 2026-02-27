import { ProxyNode } from '../types';

// js-set-map-lookups: Use Set for O(1) lookups instead of Array.includes()
const NON_PROXY_OUTBOUND_TYPES = new Set(['selector', 'urltest', 'direct', 'block', 'dns']);

// Map sing-box outbound types to proxy types
const SING_BOX_TYPE_MAP: Record<string, string> = {
  'shadowsocks': 'ss',
  'vmess': 'vmess',
  'vless': 'vless',
  'trojan': 'trojan',
  'hysteria': 'hysteria',
  'hysteria2': 'hysteria2',
  'http': 'http',
};

/**
 * Parse sing-box JSON configuration to extract proxy nodes
 * @param input - sing-box JSON string
 * @returns Object containing proxies array, unsupported protocols, and filtered counts
 */
export function parseSingBoxToProxies(input: string): {
  proxies: ProxyNode[];
  unsupported: string[];
  filteredCounts: Record<string, number>;
} {
  try {
    // Trim whitespace and handle empty input
    const trimmed = input.trim();
    if (!trimmed) {
      return { proxies: [], unsupported: [], filteredCounts: {} };
    }

    // Quick validation: check if input looks like JSON (starts with { or [)
    // This avoids trying to parse proxy links like "ss://..." as JSON
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return { proxies: [], unsupported: [], filteredCounts: {} };
    }

    const config = JSON.parse(trimmed);

    // Handle both outbounds array and single outbound object
    const outbounds = Array.isArray(config.outbounds)
      ? config.outbounds
      : config.outbounds
        ? [config.outbounds]
        : [];

    const proxies: ProxyNode[] = [];
    const unsupported: string[] = [];

    for (const outbound of outbounds) {
      // Skip non-proxy outbounds: selector, urltest, direct, block, dns
      if (!outbound?.type || NON_PROXY_OUTBOUND_TYPES.has(outbound.type)) {
        continue;
      }

      const proxyType = SING_BOX_TYPE_MAP[outbound.type];
      if (!proxyType) {
        unsupported.push(outbound.type);
        continue;
      }

      const proxy = singBoxOutboundToProxyNode(outbound, proxyType);
      if (proxy) {
        proxies.push(proxy);
      }
    }

    return { proxies, unsupported, filteredCounts: {} };
  } catch (error) {
    console.error('Failed to parse sing-box config:', error);
    return { proxies: [], unsupported: [], filteredCounts: {} };
  }
}

/**
 * Convert a sing-box outbound to ProxyNode format
 * @param outbound - sing-box outbound object
 * @param proxyType - The proxy type (ss, vmess, vless, etc.)
 * @returns ProxyNode or null if conversion fails
 */
function singBoxOutboundToProxyNode(outbound: any, proxyType: string): ProxyNode | null {
  const base: any = {
    name: outbound.tag || outbound.name || 'unnamed',
    type: proxyType,
    server: outbound.server || '',
    port: outbound.server_port || outbound.port || 0,
  };

  if (!base.server || base.port === 0) {
    return null;
  }

  switch (proxyType) {
    case 'ss':
      return {
        ...base,
        cipher: outbound.method || 'aes-128-gcm',
        password: outbound.password || '',
      } as ProxyNode;

    case 'vmess':
      return {
        ...base,
        uuid: outbound.uuid || '',
        alterId: outbound.alter_id ?? 0,
        cipher: outbound.security || 'auto',
        network: 'tcp',
        // Handle ws transport if present
        ...(outbound.transport?.type === 'ws' ? { network: 'ws' } : {}),
        // Handle TLS options
        ...(outbound.tls ? {
          tls: outbound.tls.enabled ?? false,
          ...(outbound.tls.server_name ? { servername: outbound.tls.server_name } : {}),
          ...(outbound.tls.insecure !== undefined ? { 'skip-cert-verify': outbound.tls.insecure } : {}),
        } : {}),
      } as ProxyNode;

    case 'vless':
      const vlessNode: ProxyNode = {
        ...base,
        uuid: outbound.uuid || '',
        network: 'tcp',
      };
      // Only set flow if it has a value
      if (outbound.flow) {
        (vlessNode as any).flow = outbound.flow;
      }
      // Handle TLS (in sing-box, tls can be a boolean or object)
      if (outbound.tls === true || outbound.tls?.enabled) {
        (vlessNode as any).tls = true;
        // Handle servername
        if (outbound.tls?.server_name) {
          (vlessNode as any).servername = outbound.tls.server_name;
        } else if (outbound.tls?.servername) {
          (vlessNode as any).servername = outbound.tls.servername;
        }
        // Handle skip-cert-verify
        if (outbound.tls?.insecure !== undefined) {
          (vlessNode as any)['skip-cert-verify'] = outbound.tls.insecure;
        }
        // Handle Reality
        if (outbound.tls?.reality?.enabled || outbound.reality?.enabled) {
          const reality = outbound.tls?.reality || outbound.reality;
          (vlessNode as any)['reality-opts'] = {
            'public-key': reality.public_key || '',
            'short-id': reality.short_id || '',
          };
        }
      }
      return vlessNode;

    case 'trojan':
      const trojanNode: ProxyNode = {
        ...base,
        password: outbound.password || '',
        network: 'tcp',
      };
      // Handle TLS options for trojan
      if (outbound.tls?.enabled) {
        (trojanNode as any).tls = true;
        if (outbound.tls.insecure !== undefined) {
          (trojanNode as any)['skip-cert-verify'] = outbound.tls.insecure;
        }
        if (outbound.tls.server_name) {
          (trojanNode as any).sni = outbound.tls.server_name;
        } else if (outbound.tls.servername) {
          (trojanNode as any).sni = outbound.tls.servername;
        }
      } else {
        // trojan always uses TLS
        (trojanNode as any).tls = true;
        if (outbound.tls?.server_name) {
          (trojanNode as any).sni = outbound.tls.server_name;
        } else if (outbound.tls?.servername) {
          (trojanNode as any).sni = outbound.tls.servername;
        }
      }
      return trojanNode;

    case 'hysteria':
      return {
        ...base,
        auth_str: outbound.auth || outbound.auth_str || '',
        protocol: outbound.protocol || 'udp',
        up: outbound.up_mbps?.toString() || '10',
        down: outbound.down_mbps?.toString() || '50',
        sni: outbound.server_name || outbound.sni || '',
        'skip-cert-verify': outbound.tls?.insecure || false,
      } as ProxyNode;

    case 'hysteria2':
      const h2Node: ProxyNode = {
        ...base,
        password: outbound.password || '',
      };
      // Handle TLS options for hysteria2
      if (outbound.tls) {
        if (outbound.tls.insecure !== undefined) {
          (h2Node as any)['skip-cert-verify'] = outbound.tls.insecure;
        }
        if (outbound.tls.server_name) {
          (h2Node as any).sni = outbound.tls.server_name;
        } else if (outbound.tls.servername) {
          (h2Node as any).sni = outbound.tls.servername;
        }
      }
      // hysteria2 may also have sni at top level
      if (!(h2Node as any).sni && outbound.server_name) {
        (h2Node as any).sni = outbound.server_name;
      }
      return h2Node;

    case 'http':
      const users = outbound.users || [];
      const user = users[0] || {};
      return {
        ...base,
        username: user.username || '',
        password: user.password || '',
      } as ProxyNode;

    default:
      return null;
  }
}
