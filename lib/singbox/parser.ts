import { ProxyNode } from '../types';
import { normalizeProxyNodeHostnames } from '../utils';
import { safeValidateProxyNode } from '../types/validators';

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
  'wireguard': 'wireguard',
  'anytls': 'anytls',
  'tuic': 'tuic',
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

    // Strip BOM first (BOM-prefixed JSON would fail the character sniff)
    const candidate = trimmed.replace(/^\uFEFF/, '');

    // Cheap pre-filter: check if input looks like JSON (starts with { or [)
    // This avoids trying to parse proxy links like "ss://..." as JSON
    if (!candidate.startsWith('{') && !candidate.startsWith('[')) {
      return { proxies: [], unsupported: [], filteredCounts: {} };
    }

    // Two-step detection: the sniff above is not enough — flow-style YAML
    // (e.g. "{proxies: [a, b]}") also starts with '{'. Decide with a strict
    // JSON.parse and quietly bow out so other format parsers handle it.
    let config: any;
    try {
      config = JSON.parse(candidate);
    } catch {
      return { proxies: [], unsupported: [], filteredCounts: {} };
    }

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
      if (!proxy) continue;

      // Convert non-ASCII (IDN) hostnames to Punycode
      normalizeProxyNodeHostnames(proxy);

      // Route through schema validation so malformed outbounds are dropped
      const validated = safeValidateProxyNode(proxy);
      if (validated) proxies.push(validated);
    }

    return { proxies, unsupported, filteredCounts: {} };
  } catch (error) {
    console.error('Failed to parse sing-box config:', error);
    return { proxies: [], unsupported: [], filteredCounts: {} };
  }
}

/**
 * Map a sing-box transport object onto a ProxyNode (network + Clash transport opts)
 * @param node - ProxyNode under construction (mutated in place)
 * @param transport - sing-box transport object
 */
function applySingBoxTransport(node: ProxyNode, transport: any): void {
  if (!transport?.type) return;
  const target = node as unknown as Record<string, unknown>;
  switch (transport.type) {
    case 'ws':
      target.network = 'ws';
      target['ws-opts'] = {
        ...(transport.path && { path: transport.path }),
        ...(transport.headers && { headers: transport.headers }),
        ...(transport.max_early_data !== undefined && { 'max-early-data': transport.max_early_data }),
        ...(transport.early_data_header_name && { 'early-data-header-name': transport.early_data_header_name }),
      };
      break;
    case 'grpc':
      target.network = 'grpc';
      target['grpc-opts'] = {
        ...(transport.service_name && { 'grpc-service-name': transport.service_name }),
      };
      break;
    case 'http':
      // sing-box `http` transport is HTTP/2 (h2)
      target.network = 'h2';
      target['h2-opts'] = {
        ...(Array.isArray(transport.host) && { host: transport.host }),
        ...(transport.path && { path: transport.path }),
      };
      break;
    case 'httpupgrade':
      target.network = 'ws';
      target['ws-opts'] = {
        ...(transport.path && { path: transport.path }),
        ...(transport.host && { headers: { Host: transport.host } }),
        'v2ray-http-upgrade': true,
      };
      break;
    default:
      break;
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

    case 'vmess': {
      const vmessNode: ProxyNode = {
        ...base,
        uuid: outbound.uuid || '',
        alterId: outbound.alter_id ?? 0,
        cipher: outbound.security || 'auto',
        network: 'tcp',
      } as ProxyNode;

      applySingBoxTransport(vmessNode, outbound.transport);

      // Handle TLS options
      if (outbound.tls) {
        (vmessNode as any).tls = outbound.tls.enabled ?? false;
        if (outbound.tls.server_name) {
          (vmessNode as any).servername = outbound.tls.server_name;
        }
        if (outbound.tls.insecure !== undefined) {
          (vmessNode as any)['skip-cert-verify'] = outbound.tls.insecure;
        }
        if (Array.isArray(outbound.tls.alpn)) {
          (vmessNode as any).alpn = outbound.tls.alpn;
        }
      }

      return vmessNode;
    }

    case 'vless': {
      const vlessNode: ProxyNode = {
        ...base,
        uuid: outbound.uuid || '',
        network: 'tcp',
      } as ProxyNode;

      applySingBoxTransport(vlessNode, outbound.transport);

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
    }

    case 'trojan': {
      const trojanNode: ProxyNode = {
        ...base,
        password: outbound.password || '',
        network: 'tcp',
      } as ProxyNode;

      applySingBoxTransport(trojanNode, outbound.transport);

      if (Array.isArray(outbound.tls?.alpn)) {
        (trojanNode as any).alpn = outbound.tls.alpn;
      }

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
    }

    case 'hysteria':
      return {
        ...base,
        auth_str: outbound.auth || outbound.auth_str || '',
        protocol: outbound.protocol || 'udp',
        ...(typeof outbound.up_mbps === 'number' && { up: outbound.up_mbps }),
        ...(typeof outbound.down_mbps === 'number' && { down: outbound.down_mbps }),
        sni: outbound.server_name || outbound.sni || '',
        'skip-cert-verify': outbound.tls?.insecure || false,
      } as ProxyNode;

    case 'hysteria2': {
      const h2Node: ProxyNode = {
        ...base,
        password: outbound.password || '',
        ...(outbound.obfs && { obfs: outbound.obfs }),
        ...(outbound.obfs_password && { 'obfs-password': outbound.obfs_password }),
        ...(outbound.ports && { ports: outbound.ports }),
      } as ProxyNode;
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
      if (Array.isArray(outbound.tls?.alpn)) {
        (h2Node as any).alpn = outbound.tls.alpn;
      }
      return h2Node;
    }

    case 'http':
      const users = outbound.users || [];
      const user = users[0] || {};
      return {
        ...base,
        username: user.username || '',
        password: user.password || '',
      } as ProxyNode;

    case 'wireguard': {
      const localAddresses: string[] = outbound.local_address || [];
      const ip = localAddresses.find((a: string) => !a.includes(':'))?.replace(/\/\d+$/, '');
      const ipv6 = localAddresses.find((a: string) => a.includes(':'))?.replace(/\/\d+$/, '');
      return {
        ...base,
        'private-key': outbound.private_key || '',
        'public-key': outbound.peer_public_key || '',
        udp: true,
        ...(ip && { ip }),
        ...(ipv6 && { ipv6 }),
        ...(outbound.pre_shared_key && { 'pre-shared-key': outbound.pre_shared_key }),
        ...(outbound.reserved !== undefined && { reserved: outbound.reserved }),
        ...(outbound.mtu && { mtu: outbound.mtu }),
      } as ProxyNode;
    }

    case 'anytls':
      return {
        ...base,
        password: outbound.password || '',
        udp: true,
        ...(outbound.tls?.server_name && { sni: outbound.tls.server_name }),
        ...(outbound.tls?.insecure !== undefined && { 'skip-cert-verify': outbound.tls.insecure }),
        ...(Array.isArray(outbound.tls?.alpn) && { alpn: outbound.tls.alpn }),
      } as ProxyNode;

    case 'tuic':
      return {
        ...base,
        uuid: outbound.uuid || '',
        password: outbound.password || '',
        udp: true,
        ...(outbound.tls?.server_name && { sni: outbound.tls.server_name }),
        ...(outbound.tls?.insecure !== undefined && { 'skip-cert-verify': outbound.tls.insecure }),
        ...(Array.isArray(outbound.tls?.alpn) && { alpn: outbound.tls.alpn }),
        ...(outbound.congestion_control && { 'congestion-controller': outbound.congestion_control }),
        ...(outbound.udp_relay_mode && { 'udp-relay-mode': outbound.udp_relay_mode }),
        ...(outbound.zero_rtt_handshake !== undefined && { 'reduce-rtt': outbound.zero_rtt_handshake }),
      } as ProxyNode;

    default:
      return null;
  }
}
