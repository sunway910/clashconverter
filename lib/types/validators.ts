/**
 * Zod schemas for validating proxy nodes
 * Each protocol has a schema that validates all required and optional fields.
 *
 * Design rules:
 * - Field names follow Clash Meta (mihomo) configuration keys.
 * - Validation never injects data: no `.default()` here. Fallback values are
 *   applied by the generators/adapters at output time so round-trips stay
 *   faithful to the input.
 * - Shared option structures (ws-opts, reality-opts, ...) are defined once
 *   below and reused across protocols.
 */

import { z } from 'zod';
import type { ProxyType } from './proxy-nodes';
import { ValidationError, ErrorCode } from '../errors';
import { normalizeProxyNodeHostnames } from '../utils';

// ============================================================================
// Common Validators
// ============================================================================

/**
 * Validate server address (domain or IP)
 */
const serverSchema = z.string().min(1).refine((value) => {
  // Allow domain names, IP addresses, and localhost
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value) ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(value) ||
    value === 'localhost' ||
    value === '127.0.0.1';
}, {
  message: 'Server must be a valid domain name or IP address',
});

/**
 * Validate port number (1-65535)
 */
const portSchema = z.number().int().min(1).max(65535);

/**
 * Validate proxy name
 */
const nameSchema = z.string().min(1).max(255);

// ============================================================================
// Helper Validators
// ============================================================================

/**
 * Optional boolean field that accepts null and converts to undefined
 * This handles YAML null values which should be treated as "not set"
 */
const nullableBoolean = () =>
  z
    .union([z.boolean(), z.null(), z.undefined()])
    .optional()
    .transform((val): boolean | undefined => (val === null ? undefined : val));

/**
 * Optional string field that accepts null and converts to undefined
 */
const nullableString = () =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val): string | undefined => (val === null ? undefined : val));

/**
 * Bandwidth field (Mbps). mihomo accepts both numbers and strings with units
 * ("100", "100 Mbps"); the canonical internal representation is a number.
 */
const bandwidthSchema = () =>
  z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform((val): number | undefined => {
      if (val === null || val === undefined) return undefined;
      if (typeof val === 'number') return val;
      const parsed = parseFloat(val);
      return Number.isFinite(parsed) ? parsed : undefined;
    });

// ============================================================================
// Shared Option Sub-Schemas (Clash common fields + transport/security opts)
// ============================================================================

/**
 * Common dial/behavior fields shared by every protocol (spread into each schema)
 */
const commonBaseShape = {
  tfo: z.boolean().optional(),
  mptcp: z.boolean().optional(),
  'interface-name': z.string().optional(),
  'routing-mark': z.number().int().optional(),
  'ip-version': z.enum(['dual', 'ipv4', 'ipv6', 'ipv4-prefer', 'ipv6-prefer']).optional(),
  'dialer-proxy': z.string().optional(),
};

const wsOptsSchema = z.object({
  path: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  'max-early-data': z.number().int().min(0).optional(),
  'early-data-header-name': z.string().optional(),
  'v2ray-http-upgrade': z.boolean().optional(),
  'v2ray-http-upgrade-fast-open': z.boolean().optional(),
});

const grpcOptsSchema = z.object({
  'grpc-service-name': z.string().optional(),
});

const h2OptsSchema = z.object({
  host: z.array(z.string()).optional(),
  path: z.string().optional(),
});

const httpOptsSchema = z.object({
  method: z.string().optional(),
  path: z.array(z.string()).optional(),
  headers: z.record(z.string(), z.array(z.string())).optional(),
});

const realityOptsSchema = z.object({
  'public-key': z.string().optional(),
  'short-id': z.string().optional(),
  'spider-x': z.string().optional(),
  'mldsa65-verify': z.string().optional(),
  ech: z.string().optional(),
});

const smuxOptsSchema = z.object({
  enabled: z.boolean().optional(),
  protocol: z.enum(['smux', 'yamux', 'h2mux']).optional(),
  'max-connections': z.number().int().min(0).optional(),
  'min-streams': z.number().int().min(0).optional(),
  'max-streams': z.number().int().min(0).optional(),
  padding: z.boolean().optional(),
  statistic: z.boolean().optional(),
  'only-tcp': z.boolean().optional(),
});

const ssPluginOptsSchema = z.object({
  mode: z.string().optional(),
  host: z.string().optional(),
  password: z.string().optional(),
  path: z.string().optional(),
  tls: z.boolean().optional(),
  fingerprint: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  'skip-cert-verify': z.boolean().optional(),
  version: z.number().int().optional(),
  mux: z.boolean().optional(),
  'v2ray-http-upgrade': z.boolean().optional(),
  'v2ray-http-upgrade-fast-open': z.boolean().optional(),
  'version-hint': z.string().optional(),
  'restls-script': z.string().optional(),
});

const alpnSchema = z.array(z.string());

/** uTLS fingerprint — permissive on purpose (see ClientFingerprint type) */
const clientFingerprintSchema = z.string().optional();

const wireGuardPeerSchema = z.object({
  server: z.string().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  'public-key': z.string().optional(),
  'pre-shared-key': z.string().optional(),
  reserved: z.array(z.number().int()).optional(),
  'allowed-ips': z.array(z.string()).optional(),
});

// ============================================================================
// Protocol-specific Schemas
// ============================================================================

/**
 * Shadowsocks (SS) schema
 */
export const ssProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('ss'),
  server: serverSchema,
  port: portSchema,
  cipher: z.string().min(1),
  password: z.string().min(1),
  udp: nullableBoolean(),
  plugin: z.enum(['obfs', 'v2ray-plugin', 'shadow-tls', 'restls']).optional(),
  'plugin-opts': ssPluginOptsSchema.optional(),
  'udp-over-tcp': z.boolean().optional(),
  'udp-over-tcp-version': z.number().int().optional(),
  'client-fingerprint': clientFingerprintSchema,
  smux: smuxOptsSchema.optional(),
});

/**
 * ShadowsocksR (SSR) schema
 */
export const ssrProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('ssr'),
  server: serverSchema,
  port: portSchema,
  cipher: z.string().min(1),
  password: z.string().min(1),
  protocol: z.string().min(1),
  obfs: z.string().min(1),
  'protocol-param': z.string().optional(),
  'obfs-param': z.string().optional(),
  group: z.string().optional(),
  udp: nullableBoolean(),
});

/**
 * VMess schema
 */
export const vmessProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('vmess'),
  server: serverSchema,
  port: portSchema,
  uuid: z.string().uuid().min(1),
  alterId: z.number().int().min(0).max(65535).optional(),
  cipher: z.string().optional(),
  network: z.enum(['tcp', 'ws', 'grpc', 'h2', 'quic']).optional(),
  udp: nullableBoolean(),
  alpn: alpnSchema.optional(),
  tls: nullableBoolean(),
  'skip-cert-verify': z.boolean().optional(),
  servername: nullableString(),
  sni: nullableString(),
  'ws-opts': wsOptsSchema.optional(),
  'grpc-opts': grpcOptsSchema.optional(),
  'h2-opts': h2OptsSchema.optional(),
  'http-opts': httpOptsSchema.optional(),
  'reality-opts': realityOptsSchema.optional(),
  'client-fingerprint': clientFingerprintSchema,
  'packet-addr': z.boolean().optional(),
  xudp: z.boolean().optional(),
  'packet-encoding': z.string().optional(),
  'global-padding': z.boolean().optional(),
  'authenticated-length': z.boolean().optional(),
  fingerprint: z.string().optional(),
  smux: smuxOptsSchema.optional(),
});

/**
 * VLESS schema
 */
export const vlessProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('vless'),
  server: serverSchema,
  port: portSchema,
  uuid: z.string().uuid().min(1),
  network: z.enum(['tcp', 'ws', 'grpc', 'h2', 'quic']).optional(),
  tls: nullableBoolean(),
  servername: nullableString(),
  'skip-cert-verify': z.boolean().optional(),
  sni: nullableString(),
  flow: nullableString(),
  udp: nullableBoolean(),
  alpn: alpnSchema.optional(),
  'reality-opts': realityOptsSchema.optional(),
  'client-fingerprint': clientFingerprintSchema,
  'ws-opts': wsOptsSchema.optional(),
  'grpc-opts': grpcOptsSchema.optional(),
  'h2-opts': h2OptsSchema.optional(),
  'http-opts': httpOptsSchema.optional(),
  'packet-addr': z.boolean().optional(),
  xudp: z.boolean().optional(),
  'packet-encoding': z.string().optional(),
  fingerprint: z.string().optional(),
  smux: smuxOptsSchema.optional(),
});

/**
 * Trojan schema
 */
export const trojanProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('trojan'),
  server: serverSchema,
  port: portSchema,
  password: z.string().min(1),
  udp: nullableBoolean(),
  'skip-cert-verify': z.boolean().optional(),
  sni: nullableString(),
  network: z.enum(['tcp', 'ws', 'grpc', 'h2']).optional(),
  'ws-opts': wsOptsSchema.optional(),
  'grpc-opts': grpcOptsSchema.optional(),
  'h2-opts': h2OptsSchema.optional(),
  'reality-opts': realityOptsSchema.optional(),
  alpn: alpnSchema.optional(),
  'client-fingerprint': clientFingerprintSchema,
  fingerprint: z.string().optional(),
  'ss-opts': z
    .object({
      enabled: z.boolean(),
      method: z.string().min(1),
      password: z.string().min(1),
    })
    .optional(),
});

/**
 * WireGuard schema
 */
export const wireguardProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('wireguard'),
  server: serverSchema,
  port: portSchema,
  'private-key': z.string().min(1),
  'public-key': z.string().min(1),
  ip: nullableString(),
  ipv6: nullableString(),
  'pre-shared-key': nullableString(),
  'allowed-ips': z.array(z.string()).optional(),
  reserved: z.union([z.array(z.number().int()).length(3), z.string()]).optional(),
  udp: nullableBoolean(),
  mtu: z.number().int().min(1).max(65535).optional(),
  workers: z.number().int().min(1).optional(),
  'persistent-keepalive': z.number().int().min(0).optional(),
  peers: z.array(wireGuardPeerSchema).optional(),
  'remote-dns-resolve': nullableBoolean(),
  dns: z.array(z.string()).optional(),
  'refresh-server-ip-interval': z.number().int().min(0).optional(),
});

/**
 * AnyTLS schema
 */
export const anytlsProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('anytls'),
  server: serverSchema,
  port: portSchema,
  password: z.string().min(1),
  sni: nullableString(),
  alpn: alpnSchema.optional(),
  'client-fingerprint': clientFingerprintSchema,
  'skip-cert-verify': z.boolean().optional(),
  udp: nullableBoolean(),
  'idle-session-check-interval': z.number().int().min(0).optional(),
  'idle-session-timeout': z.number().int().min(0).optional(),
  'min-idle-session': z.number().int().min(0).optional(),
});

/**
 * TUIC v5 schema (uuid + password auth; legacy v4 token not supported)
 */
export const tuicProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('tuic'),
  server: serverSchema,
  port: portSchema,
  uuid: z.string().min(1),
  password: z.string().min(1),
  ip: nullableString(),
  sni: nullableString(),
  alpn: z.array(z.string()).optional(),
  'skip-cert-verify': z.boolean().optional(),
  'congestion-controller': nullableString(),
  'udp-relay-mode': z.enum(['native', 'quic']).optional(),
  'reduce-rtt': z.boolean().optional(),
  'disable-sni': z.boolean().optional(),
  udp: nullableBoolean(),
  'heartbeat-interval': z.number().int().min(0).optional(),
  'max-udp-relay-packet-size': z.number().int().min(0).optional(),
  'max-open-streams': z.number().int().min(0).optional(),
  'fast-open': z.boolean().optional(),
});

/**
 * Hysteria v1 schema
 */
export const hysteriaProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('hysteria'),
  server: serverSchema,
  port: portSchema,
  auth_str: nullableString(),
  auth: nullableString(),
  protocol: z.string().optional(),
  ports: z.string().optional(),
  up: bandwidthSchema(),
  down: bandwidthSchema(),
  obfs: z.string().optional(),
  'obfs-protocol': z.string().optional(),
  'skip-cert-verify': z.boolean().optional(),
  sni: nullableString(),
  fingerprint: z.string().optional(),
  alpn: z.union([z.string(), z.array(z.string())]).optional(),
  ca: z.string().optional(),
  'ca-str': z.string().optional(),
  'recv-window-conn': z.number().int().min(0).optional(),
  'recv-window': z.number().int().min(0).optional(),
  'disable-mtu-discovery': z.boolean().optional(),
  'fast-open': z.boolean().optional(),
  'hop-interval': z.number().int().min(0).optional(),
});

/**
 * Hysteria2 schema
 */
export const hysteria2ProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('hysteria2'),
  server: serverSchema,
  port: portSchema,
  password: z.string().min(1),
  ports: z.string().optional(),
  'hop-interval': z.number().int().min(0).optional(),
  up: bandwidthSchema(),
  down: bandwidthSchema(),
  obfs: z.string().optional(),
  'obfs-password': z.string().optional(),
  'skip-cert-verify': z.boolean().optional(),
  sni: nullableString(),
  fingerprint: z.string().optional(),
  alpn: alpnSchema.optional(),
  cwnd: z.number().int().min(0).optional(),
  'udp-mtu': z.number().int().min(0).optional(),
});

/**
 * HTTP schema
 */
export const httpProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('http'),
  server: serverSchema,
  port: portSchema,
  username: z.string().optional(),
  password: z.string().optional(),
  tls: z.boolean().optional(),
  sni: nullableString(),
  'skip-cert-verify': z.boolean().optional(),
  fingerprint: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

/**
 * SOCKS5 schema
 */
export const socks5ProxySchema = z.object({
  ...commonBaseShape,
  name: nameSchema,
  type: z.literal('socks5'),
  server: serverSchema,
  port: portSchema,
  username: z.string().optional(),
  password: z.string().optional(),
  tls: nullableBoolean(),
  udp: nullableBoolean(),
  'skip-cert-verify': z.boolean().optional(),
  fingerprint: z.string().optional(),
});

// ============================================================================
// Discriminated Union Schema for All Protocols
// ============================================================================

/**
 * Combined schema for all proxy types using discriminated union
 */
export const proxyNodeSchema = z.discriminatedUnion('type', [
  ssProxySchema,
  ssrProxySchema,
  vmessProxySchema,
  vlessProxySchema,
  trojanProxySchema,
  hysteriaProxySchema,
  hysteria2ProxySchema,
  httpProxySchema,
  socks5ProxySchema,
  wireguardProxySchema,
  anytlsProxySchema,
  tuicProxySchema,
]);

// ============================================================================
// Legacy Key Normalization
// ============================================================================

/**
 * Normalize legacy/internal SSR keys to the Clash-standard names.
 * Purely additive: only fills standard keys when they are absent.
 */
function normalizeLegacySsrKeys<T>(node: T): T {
  if (!node || typeof node !== 'object') return node;
  const record = node as Record<string, unknown>;
  if (record.type !== 'ssr') return node;

  if (record['protocol-param'] === undefined && typeof record.protocolparam === 'string') {
    record['protocol-param'] = record.protocolparam;
  }
  if (record['obfs-param'] === undefined && typeof record.obfsparam === 'string') {
    record['obfs-param'] = record.obfsparam;
  }
  return node;
}

/**
 * Run all pre-parse normalizations (hostname IDN + legacy keys)
 */
function normalizeNode<T>(node: T): T {
  return normalizeLegacySsrKeys(normalizeProxyNodeHostnames(node));
}

// ============================================================================
// Validation Function
// ============================================================================

/**
 * Validate a proxy node using the appropriate schema
 * @param node - Unknown node to validate
 * @returns Validated ProxyNode
 * @throws ValidationError if validation fails
 */
export function validateProxyNode(node: unknown): import('./proxy-nodes').ProxyNode {
  try {
    return proxyNodeSchema.parse(normalizeNode(node));
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format error message for better debugging
      const issues = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      throw new ValidationError(
        ErrorCode.VALIDATION_FAILED,
        `Invalid proxy node: ${issues.map((i) => `${i.path}: ${i.message}`).join(', ')}`
      );
    }
    throw error;
  }
}

/**
 * Validate multiple proxy nodes
 * @param nodes - Array of unknown nodes to validate
 * @returns Array of validated ProxyNodes
 * @throws ValidationError if any validation fails
 */
export function validateProxyNodes(nodes: unknown[]): import('./proxy-nodes').ProxyNode[] {
  return nodes.map((node) => validateProxyNode(node));
}

/**
 * Safe validation that returns null instead of throwing
 * @param node - Unknown node to validate
 * @returns Validated ProxyNode or null if invalid
 */
export function safeValidateProxyNode(node: unknown): import('./proxy-nodes').ProxyNode | null {
  try {
    return proxyNodeSchema.safeParse(normalizeNode(node)).data || null;
  } catch {
    return null;
  }
}

/**
 * Check if a value is a valid ProxyNode
 * @param value - Value to check
 * @returns True if valid ProxyNode
 */
export function isValidProxyNode(value: unknown): value is import('./proxy-nodes').ProxyNode {
  return proxyNodeSchema.safeParse(normalizeNode(value)).success;
}

// ============================================================================
// Schema Registry
// ============================================================================

/**
 * Schema registry keyed by proxy type — single source of truth,
 * no switch statement to keep in sync.
 */
const SCHEMA_BY_TYPE: Record<ProxyType, z.ZodObject<any>> = {
  ss: ssProxySchema,
  ssr: ssrProxySchema,
  vmess: vmessProxySchema,
  vless: vlessProxySchema,
  trojan: trojanProxySchema,
  hysteria: hysteriaProxySchema,
  hysteria2: hysteria2ProxySchema,
  http: httpProxySchema,
  socks5: socks5ProxySchema,
  wireguard: wireguardProxySchema,
  anytls: anytlsProxySchema,
  tuic: tuicProxySchema,
};

/**
 * Get the appropriate schema for a given proxy type
 * @param type - The proxy type
 * @returns The zod schema for that type
 */
export function getSchemaForType(type: ProxyType): z.ZodObject<any, any> {
  const schema = SCHEMA_BY_TYPE[type];
  if (!schema) {
    throw new ValidationError(
      ErrorCode.VALIDATION_FAILED,
      `Unknown proxy type: ${type}`,
      'type'
    );
  }
  return schema;
}
