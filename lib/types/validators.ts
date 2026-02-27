/**
 * Zod schemas for validating proxy nodes
 * Each protocol has a schema that validates all required and optional fields
 */

import { z } from 'zod';
import type { ProxyType } from './proxy-nodes';
import { ValidationError, ErrorCode } from '../errors';

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
// Protocol-specific Schemas
// ============================================================================

/**
 * Shadowsocks (SS) schema
 */
export const ssProxySchema = z.object({
  name: nameSchema,
  type: z.literal('ss'),
  server: serverSchema,
  port: portSchema,
  cipher: z.string().min(1),
  password: z.string().min(1),
  udp: z.boolean().optional().default(true),
});

/**
 * ShadowsocksR (SSR) schema
 */
export const ssrProxySchema = z.object({
  name: nameSchema,
  type: z.literal('ssr'),
  server: serverSchema,
  port: portSchema,
  cipher: z.string().min(1),
  password: z.string().min(1),
  protocol: z.string().min(1),
  obfs: z.string().min(1),
  protocolparam: z.string().optional(),
  obfsparam: z.string().optional(),
  group: z.string().optional(),
});

/**
 * VMess schema
 */
export const vmessProxySchema = z.object({
  name: nameSchema,
  type: z.literal('vmess'),
  server: serverSchema,
  port: portSchema,
  uuid: z.string().uuid().min(1),
  alterId: z.number().int().min(0).max(65535).default(0),
  cipher: z.string().optional().default('auto'),
  network: z.enum(['tcp', 'ws', 'grpc', 'h2', 'quic']).optional().default('tcp'),
  tls: z.boolean().optional(),
  'skip-cert-verify': z.boolean().optional(),
  servername: z.string().optional(),
  sni: z.string().optional(),
});

/**
 * VLESS schema
 */
export const vlessProxySchema = z.object({
  name: nameSchema,
  type: z.literal('vless'),
  server: serverSchema,
  port: portSchema,
  uuid: z.string().uuid().min(1),
  network: z.enum(['tcp', 'ws', 'grpc', 'h2', 'quic']).optional().default('tcp'),
  tls: z.boolean().optional(),
  servername: z.string().optional(),
  'skip-cert-verify': z.boolean().optional(),
  sni: z.string().optional(),
  flow: z.string().optional(),
  'reality-opts': z.object({
    'public-key': z.string().optional(),
    'short-id': z.string().optional(),
  }).optional(),
  'client-fingerprint': z.string().optional(),
  'ws-opts': z
    .object({
      path: z.string().optional(),
      headers: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
});

/**
 * Trojan schema
 */
export const trojanProxySchema = z.object({
  name: nameSchema,
  type: z.literal('trojan'),
  server: serverSchema,
  port: portSchema,
  password: z.string().min(1),
  udp: z.boolean().optional().default(true),
  'skip-cert-verify': z.boolean().optional(),
  sni: z.string().optional(),
  network: z.enum(['tcp', 'ws', 'grpc']).optional().default('tcp'),
});

/**
 * Hysteria v1 schema
 */
export const hysteriaProxySchema = z.object({
  name: nameSchema,
  type: z.literal('hysteria'),
  server: serverSchema,
  port: portSchema,
  auth_str: z.string().optional(),
  auth: z.string().optional(),
  protocol: z.string().optional().default('udp'),
  'skip-cert-verify': z.boolean().optional(),
  sni: z.string().optional(),
  up: z.number().optional().default(10),
  down: z.number().optional().default(50),
  alpn: z.union([z.string(), z.array(z.string())]).optional(),
});

/**
 * Hysteria2 schema
 */
export const hysteria2ProxySchema = z.object({
  name: nameSchema,
  type: z.literal('hysteria2'),
  server: serverSchema,
  port: portSchema,
  password: z.string().min(1),
  'skip-cert-verify': z.boolean().optional(),
  sni: z.string().optional(),
});

/**
 * HTTP schema
 */
export const httpProxySchema = z.object({
  name: nameSchema,
  type: z.literal('http'),
  server: serverSchema,
  port: portSchema,
  username: z.string().optional(),
  password: z.string().optional(),
  tls: z.boolean().optional(),
});

/**
 * SOCKS5 schema
 */
export const socks5ProxySchema = z.object({
  name: nameSchema,
  type: z.literal('socks5'),
  server: serverSchema,
  port: portSchema,
  username: z.string().optional(),
  password: z.string().optional(),
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
]);

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
    return proxyNodeSchema.parse(node);
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
  return z.array(proxyNodeSchema).parse(nodes);
}

/**
 * Safe validation that returns null instead of throwing
 * @param node - Unknown node to validate
 * @returns Validated ProxyNode or null if invalid
 */
export function safeValidateProxyNode(node: unknown): import('./proxy-nodes').ProxyNode | null {
  try {
    return proxyNodeSchema.safeParse(node).data || null;
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
  return proxyNodeSchema.safeParse(value).success;
}

// ============================================================================
// Type Guards (Runtime)
// ============================================================================

/**
 * Get the appropriate schema for a given proxy type
 * @param type - The proxy type
 * @returns The zod schema for that type
 */
export function getSchemaForType(type: ProxyType): z.ZodObject<any, any> {
  switch (type) {
    case 'ss':
      return ssProxySchema;
    case 'ssr':
      return ssrProxySchema;
    case 'vmess':
      return vmessProxySchema;
    case 'vless':
      return vlessProxySchema;
    case 'trojan':
      return trojanProxySchema;
    case 'hysteria':
      return hysteriaProxySchema;
    case 'hysteria2':
      return hysteria2ProxySchema;
    case 'http':
      return httpProxySchema;
    case 'socks5':
      return socks5ProxySchema;
    default:
      throw new ValidationError(
        ErrorCode.VALIDATION_FAILED,
        `Unknown proxy type: ${type}`,
        'type'
      );
  }
}
