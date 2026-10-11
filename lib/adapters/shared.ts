/**
 * Shared helpers for protocol adapters (Clash / sing-box output assembly)
 */

import type { ProxyNode } from '../types';

/** Common dial fields passed straight through to Clash JSON output */
const COMMON_CLASH_FIELDS = [
  'tfo',
  'mptcp',
  'interface-name',
  'routing-mark',
  'ip-version',
  'dialer-proxy',
] as const;

/**
 * Copy Clash common dial fields from a node onto its Clash proxy object
 */
export function applyCommonClashFields(node: ProxyNode, obj: Record<string, any>): void {
  passthroughClashFields(node, obj, COMMON_CLASH_FIELDS);
}

/**
 * Copy the given (existing) node fields onto a Clash proxy object,
 * skipping undefined values — used for protocol-specific passthroughs.
 */
export function passthroughClashFields(
  node: ProxyNode,
  obj: Record<string, any>,
  fields: readonly string[]
): void {
  const source = node as unknown as Record<string, any>;
  for (const key of fields) {
    if (source[key] !== undefined) obj[key] = source[key];
  }
}

/**
 * Build a sing-box TLS block from common TLS-ish node fields
 * (tls / sni / servername / alpn / skip-cert-verify / reality-opts /
 * client-fingerprint).
 *
 * @param force - set for protocols that always use TLS (trojan, anytls, ...)
 */
export function buildSingBoxTls(
  node: ProxyNode,
  { force = false }: { force?: boolean } = {}
): Record<string, any> | undefined {
  const n = node as unknown as Record<string, any>;
  const reality = n['reality-opts'];
  const hasTls = force || n.tls === true || Boolean(n.sni || n.servername) || Boolean(reality);

  if (!hasTls) return undefined;

  const serverName = n.sni || n.servername;
  const tls: Record<string, any> = {
    enabled: true,
    ...(serverName && { server_name: serverName }),
    ...(Array.isArray(n.alpn) && n.alpn.length > 0 && { alpn: n.alpn }),
    ...(n['skip-cert-verify'] !== undefined && { insecure: Boolean(n['skip-cert-verify']) }),
  };

  if (reality) {
    tls.reality = {
      enabled: true,
      ...(reality['public-key'] && { public_key: reality['public-key'] }),
      ...(reality['short-id'] && { short_id: reality['short-id'] }),
      ...(reality['spider-x'] && { spider_x: reality['spider-x'] }),
    };
  }

  // uTLS fingerprint (chrome is the common default)
  tls.utls = {
    enabled: true,
    fingerprint: n['client-fingerprint'] || 'chrome',
  };

  return tls;
}

/**
 * Build a sing-box transport object from Clash transport opts on a node
 */
export function buildSingBoxTransport(node: ProxyNode): Record<string, any> | undefined {
  const n = node as unknown as Record<string, any>;
  const network = n.network || 'tcp';

  if (network === 'ws' && n['ws-opts']) {
    const ws = n['ws-opts'];
    return {
      type: 'ws',
      ...(ws.path && { path: ws.path }),
      ...(ws.headers && { headers: ws.headers }),
      ...(ws['max-early-data'] !== undefined && { max_early_data: ws['max-early-data'] }),
      ...(ws['early-data-header-name'] && { early_data_header_name: ws['early-data-header-name'] }),
    };
  }

  if (network === 'grpc' && n['grpc-opts']) {
    const grpc = n['grpc-opts'];
    return {
      type: 'grpc',
      ...(grpc['grpc-service-name'] && { service_name: grpc['grpc-service-name'] }),
    };
  }

  if (network === 'h2') {
    const h2 = n['h2-opts'] || {};
    return {
      type: 'http',
      ...(Array.isArray(h2.host) && h2.host.length > 0 && { host: h2.host }),
      ...(h2.path && { path: h2.path }),
    };
  }

  if (network === 'http' && n['http-opts']) {
    const http = n['http-opts'];
    return {
      type: 'http',
      ...(http.method && { method: http.method }),
      ...(Array.isArray(http.path) && http.path.length > 0 && { path: http.path[0] }),
      ...(http.headers && {
        headers: Object.fromEntries(
          Object.entries(http.headers).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(', ') : value,
          ])
        ),
      }),
    };
  }

  return undefined;
}

/**
 * Build a sing-box multiplex object from a node's smux options
 */
export function buildSingBoxMultiplex(node: ProxyNode): Record<string, any> | undefined {
  const smux = (node as unknown as Record<string, any>).smux;
  if (!smux?.enabled) return undefined;

  return {
    enabled: true,
    ...(smux.protocol && { protocol: smux.protocol }),
    ...(smux['max-connections'] !== undefined && { max_connections: smux['max-connections'] }),
    ...(smux['min-streams'] !== undefined && { min_streams: smux['min-streams'] }),
    ...(smux['max-streams'] !== undefined && { max_streams: smux['max-streams'] }),
    ...(smux.padding !== undefined && { padding: smux.padding }),
    ...(smux.statistic !== undefined && { statistic: smux.statistic }),
    ...(smux['only-tcp'] !== undefined && { only_tcp: smux['only-tcp'] }),
  };
}

/**
 * True for values that should not appear in generated output:
 * undefined / null / '' / empty objects / empty arrays.
 * 0 and false are meaningful and preserved.
 */
function isEmptyOutputValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (value !== null && typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Recursively strip empty values from generated proxy output
 * (undefined / null / '' / empty objects / empty arrays), preserving
 * 0 and false. Borrowed from siiway/urlclash-converter's clean().
 */
export function cleanOutput<T>(value: T): T {
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => cleanOutput(item));
    return cleaned.filter((item) => !isEmptyOutputValue(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      const cleaned = cleanOutput(obj[key]);
      if (isEmptyOutputValue(cleaned)) {
        delete obj[key];
      } else {
        obj[key] = cleaned;
      }
    }
    return value;
  }
  return value;
}
