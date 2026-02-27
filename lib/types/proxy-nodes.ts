/**
 * Strongly typed ProxyNode definitions for all proxy protocols
 * Using discriminated union pattern for type safety
 */

// ============================================================================
// Common Base Types
// ============================================================================

/**
 * Protocol type discriminator
 */
export type ProxyType =
  | 'ss'
  | 'ssr'
  | 'vmess'
  | 'vless'
  | 'trojan'
  | 'hysteria'
  | 'hysteria2'
  | 'http'
  | 'socks5';

/**
 * Common fields shared by all proxy nodes
 */
interface BaseProxyNode {
  name: string;
  type: ProxyType;
  server: string;
  port: number;
}

/**
 * TLS-related options
 */
interface TLSOptions {
  tls?: boolean;
  'skip-cert-verify'?: boolean;
  servername?: string;
  sni?: string;
}

/**
 * WebSocket options
 */
interface WebSocketOptions {
  path?: string;
  headers?: Record<string, string>;
}

/**
 * Reality options (for VLESS)
 */
interface RealityOptions {
  'public-key'?: string;
  'short-id'?: string;
}

// ============================================================================
// Protocol-specific Proxy Node Types
// ============================================================================

/**
 * Shadowsocks (SS) proxy node
 */
export interface SSProxyNode extends BaseProxyNode {
  type: 'ss';
  cipher: string;
  password: string;
  udp?: boolean;
}

/**
 * ShadowsocksR (SSR) proxy node
 */
export interface SSRProxyNode extends BaseProxyNode {
  type: 'ssr';
  cipher: string;
  password: string;
  protocol: string;
  obfs: string;
  protocolparam?: string;
  obfsparam?: string;
  group?: string;
}

/**
 * VMess proxy node
 */
export interface VMessProxyNode extends BaseProxyNode, TLSOptions {
  type: 'vmess';
  uuid: string;
  alterId?: number;
  cipher?: string;
  network?: 'tcp' | 'ws' | 'grpc' | 'h2' | 'quic';
}

/**
 * VLESS proxy node
 */
export interface VLESSProxyNode extends BaseProxyNode, TLSOptions {
  type: 'vless';
  uuid: string;
  network?: 'tcp' | 'ws' | 'grpc' | 'h2' | 'quic';
  flow?: string;
  'reality-opts'?: RealityOptions;
  'client-fingerprint'?: string;
  'ws-opts'?: WebSocketOptions;
}

/**
 * Trojan proxy node
 */
export interface TrojanProxyNode extends BaseProxyNode, TLSOptions {
  type: 'trojan';
  password: string;
  udp?: boolean;
  network?: 'tcp' | 'ws' | 'grpc';
}

/**
 * Hysteria v1 proxy node
 */
export interface HysteriaProxyNode extends BaseProxyNode {
  type: 'hysteria';
  auth_str?: string;
  auth?: string;
  protocol?: string;
  'skip-cert-verify'?: boolean;
  sni?: string;
  up?: number;
  down?: number;
  alpn?: string[] | string;
}

/**
 * Hysteria2 proxy node
 */
export interface Hysteria2ProxyNode extends BaseProxyNode {
  type: 'hysteria2';
  password: string;
  'skip-cert-verify'?: boolean;
  sni?: string;
}

/**
 * HTTP proxy node
 */
export interface HTTPProxyNode extends BaseProxyNode {
  type: 'http';
  username?: string;
  password?: string;
  tls?: boolean;
}

/**
 * SOCKS5 proxy node
 */
export interface SOCKS5ProxyNode extends BaseProxyNode {
  type: 'socks5';
  username?: string;
  password?: string;
}

// ============================================================================
// Union Type and Type Guards
// ============================================================================

/**
 * Discriminated union of all proxy node types
 * This is the main ProxyNode type that should be used throughout the codebase
 */
export type ProxyNode =
  | SSProxyNode
  | SSRProxyNode
  | VMessProxyNode
  | VLESSProxyNode
  | TrojanProxyNode
  | HysteriaProxyNode
  | Hysteria2ProxyNode
  | HTTPProxyNode
  | SOCKS5ProxyNode;

/**
 * Type guard for SS proxy node
 */
export function isSSProxy(node: ProxyNode): node is SSProxyNode {
  return node.type === 'ss';
}

/**
 * Type guard for SSR proxy node
 */
export function isSSRProxy(node: ProxyNode): node is SSRProxyNode {
  return node.type === 'ssr';
}

/**
 * Type guard for VMess proxy node
 */
export function isVMessProxy(node: ProxyNode): node is VMessProxyNode {
  return node.type === 'vmess';
}

/**
 * Type guard for VLESS proxy node
 */
export function isVLESSProxy(node: ProxyNode): node is VLESSProxyNode {
  return node.type === 'vless';
}

/**
 * Type guard for Trojan proxy node
 */
export function isTrojanProxy(node: ProxyNode): node is TrojanProxyNode {
  return node.type === 'trojan';
}

/**
 * Type guard for Hysteria proxy node
 */
export function isHysteriaProxy(node: ProxyNode): node is HysteriaProxyNode {
  return node.type === 'hysteria';
}

/**
 * Type guard for Hysteria2 proxy node
 */
export function isHysteria2Proxy(node: ProxyNode): node is Hysteria2ProxyNode {
  return node.type === 'hysteria2';
}

/**
 * Type guard for HTTP proxy node
 */
export function isHTTPProxy(node: ProxyNode): node is HTTPProxyNode {
  return node.type === 'http';
}

/**
 * Type guard for SOCKS5 proxy node
 */
export function isSOCKS5Proxy(node: ProxyNode): node is SOCKS5ProxyNode {
  return node.type === 'socks5';
}

// ============================================================================
// Protocol Type Guards
// ============================================================================

/**
 * Check if a protocol type value is valid
 */
export function isValidProxyType(type: string): type is ProxyType {
  return ['ss', 'ssr', 'vmess', 'vless', 'trojan', 'hysteria', 'hysteria2', 'http', 'socks5'].includes(type);
}

// ============================================================================
// Legacy Compatibility (to be removed after migration)
// ============================================================================

/**
 * @deprecated Use the specific protocol types instead
 * This is kept for backward compatibility during migration
 */
export interface LegacyProxyNode {
  name: string;
  type: ProxyType;
  server: string;
  port: number;
  [key: string]: any;
}
