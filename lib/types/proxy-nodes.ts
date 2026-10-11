/**
 * Strongly typed ProxyNode definitions for all proxy protocols
 * Using discriminated union pattern for type safety
 *
 * Field names follow Clash Meta (mihomo) configuration keys.
 * Shared option structures live in ./options
 */

import type {
  ClientFingerprint,
  GrpcOptions,
  H2Options,
  HttpOptions,
  IPVersion,
  NetworkType,
  RealityOptions,
  SmuxOptions,
  SSPluginOptions,
  SSPluginType,
  TrojanSSOptions,
  WireGuardPeerOptions,
  WsOptions,
} from './options';

// Re-export shared options so existing `from '../types'` imports keep working
export type {
  ClientFingerprint,
  GrpcOptions,
  H2Options,
  HttpOptions,
  IPVersion,
  NetworkType,
  RealityOptions,
  SmuxOptions,
  SSPluginOptions,
  SSPluginType,
  TrojanSSOptions,
  WireGuardPeerOptions,
  WsOptions,
} from './options';

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
  | 'socks5'
  | 'wireguard'
  | 'anytls';

/**
 * Common dial/behavior fields shared by all proxy nodes (Clash Meta common fields)
 */
export interface CommonBaseFields {
  /** TCP Fast Open */
  tfo?: boolean;
  /** Multipath TCP */
  mptcp?: boolean;
  /** Bind outbound connections to the given interface */
  'interface-name'?: string;
  /** Routing mark for outbound connections */
  'routing-mark'?: number;
  /** Preferred IP stack */
  'ip-version'?: IPVersion;
  /** Route this node's traffic through another proxy */
  'dialer-proxy'?: string;
}

/**
 * Common identity fields shared by all proxy nodes
 */
interface BaseProxyNode extends CommonBaseFields {
  name: string;
  type: ProxyType;
  server: string;
  port: number;
}

/**
 * TLS-related options
 */
export interface TLSOptions {
  tls?: boolean;
  'skip-cert-verify'?: boolean;
  servername?: string;
  sni?: string;
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
  plugin?: SSPluginType;
  'plugin-opts'?: SSPluginOptions;
  'udp-over-tcp'?: boolean;
  'udp-over-tcp-version'?: number;
  'client-fingerprint'?: ClientFingerprint;
  smux?: SmuxOptions;
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
  'protocol-param'?: string;
  'obfs-param'?: string;
  group?: string;
  udp?: boolean;
}

/**
 * VMess proxy node
 */
export interface VMessProxyNode extends BaseProxyNode, TLSOptions {
  type: 'vmess';
  uuid: string;
  alterId?: number;
  cipher?: string;
  udp?: boolean;
  network?: NetworkType;
  alpn?: string[];
  'ws-opts'?: WsOptions;
  'grpc-opts'?: GrpcOptions;
  'h2-opts'?: H2Options;
  'http-opts'?: HttpOptions;
  'reality-opts'?: RealityOptions;
  'client-fingerprint'?: ClientFingerprint;
  'packet-addr'?: boolean;
  xudp?: boolean;
  'packet-encoding'?: string;
  'global-padding'?: boolean;
  'authenticated-length'?: boolean;
  fingerprint?: string;
  smux?: SmuxOptions;
}

/**
 * VLESS proxy node
 */
export interface VLESSProxyNode extends BaseProxyNode, TLSOptions {
  type: 'vless';
  uuid: string;
  network?: NetworkType;
  flow?: string;
  udp?: boolean;
  alpn?: string[];
  'reality-opts'?: RealityOptions;
  'client-fingerprint'?: ClientFingerprint;
  'ws-opts'?: WsOptions;
  'grpc-opts'?: GrpcOptions;
  'h2-opts'?: H2Options;
  'http-opts'?: HttpOptions;
  'packet-addr'?: boolean;
  xudp?: boolean;
  'packet-encoding'?: string;
  fingerprint?: string;
  smux?: SmuxOptions;
}

/**
 * Trojan proxy node
 */
export interface TrojanProxyNode extends BaseProxyNode, TLSOptions {
  type: 'trojan';
  password: string;
  udp?: boolean;
  network?: NetworkType;
  'ws-opts'?: WsOptions;
  'grpc-opts'?: GrpcOptions;
  'h2-opts'?: H2Options;
  'reality-opts'?: RealityOptions;
  alpn?: string[];
  'client-fingerprint'?: ClientFingerprint;
  fingerprint?: string;
  'ss-opts'?: TrojanSSOptions;
}

/**
 * WireGuard proxy node (Clash Meta / Sing-Box)
 */
export interface WireGuardProxyNode extends BaseProxyNode {
  type: 'wireguard';
  'private-key': string;
  'public-key': string;
  ip?: string;
  ipv6?: string;
  'pre-shared-key'?: string;
  'allowed-ips'?: string[];
  reserved?: number[] | string;
  udp?: boolean;
  mtu?: number;
  workers?: number;
  'persistent-keepalive'?: number;
  peers?: WireGuardPeerOptions[];
  'remote-dns-resolve'?: boolean;
  dns?: string[];
  'refresh-server-ip-interval'?: number;
}

/**
 * AnyTLS proxy node (Clash Meta mihomo>=1.19.2 / Sing-Box >=1.12)
 */
export interface AnyTLSProxyNode extends BaseProxyNode {
  type: 'anytls';
  password: string;
  sni?: string;
  alpn?: string[];
  'client-fingerprint'?: ClientFingerprint;
  'skip-cert-verify'?: boolean;
  udp?: boolean;
  'idle-session-check-interval'?: number;
  'idle-session-timeout'?: number;
  'min-idle-session'?: number;
}

/**
 * Hysteria v1 proxy node
 */
export interface HysteriaProxyNode extends BaseProxyNode {
  type: 'hysteria';
  auth_str?: string;
  auth?: string;
  protocol?: string;
  /** Port hopping ranges, e.g. "1000-2000,3000" */
  ports?: string;
  /** Upload bandwidth in Mbps */
  up?: number;
  /** Download bandwidth in Mbps */
  down?: number;
  obfs?: string;
  'skip-cert-verify'?: boolean;
  sni?: string;
  fingerprint?: string;
  alpn?: string[] | string;
  ca?: string;
  'ca-str'?: string;
  'recv-window-conn'?: number;
  'recv-window'?: number;
  'disable-mtu-discovery'?: boolean;
  'fast-open'?: boolean;
  'hop-interval'?: number;
  'obfs-protocol'?: string;
}

/**
 * Hysteria2 proxy node
 */
export interface Hysteria2ProxyNode extends BaseProxyNode {
  type: 'hysteria2';
  password: string;
  /** Port hopping ranges, e.g. "1000-2000,3000" */
  ports?: string;
  'hop-interval'?: number;
  /** Upload bandwidth in Mbps */
  up?: number;
  /** Download bandwidth in Mbps */
  down?: number;
  obfs?: string;
  'obfs-password'?: string;
  'skip-cert-verify'?: boolean;
  sni?: string;
  fingerprint?: string;
  alpn?: string[];
  cwnd?: number;
  'udp-mtu'?: number;
}

/**
 * HTTP proxy node
 */
export interface HTTPProxyNode extends BaseProxyNode {
  type: 'http';
  username?: string;
  password?: string;
  tls?: boolean;
  sni?: string;
  'skip-cert-verify'?: boolean;
  fingerprint?: string;
  headers?: Record<string, string>;
}

/**
 * SOCKS5 proxy node
 */
export interface SOCKS5ProxyNode extends BaseProxyNode {
  type: 'socks5';
  username?: string;
  password?: string;
  tls?: boolean;
  udp?: boolean;
  'skip-cert-verify'?: boolean;
  fingerprint?: string;
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
  | SOCKS5ProxyNode
  | WireGuardProxyNode
  | AnyTLSProxyNode;

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

/**
 * Type guard for WireGuard proxy node
 */
export function isWireGuardProxy(node: ProxyNode): node is WireGuardProxyNode {
  return node.type === 'wireguard';
}

/**
 * Type guard for AnyTLS proxy node
 */
export function isAnyTLSProxy(node: ProxyNode): node is AnyTLSProxyNode {
  return node.type === 'anytls';
}

// ============================================================================
// Protocol Type Guards
// ============================================================================

const VALID_PROXY_TYPES: readonly ProxyType[] = [
  'ss',
  'ssr',
  'vmess',
  'vless',
  'trojan',
  'hysteria',
  'hysteria2',
  'http',
  'socks5',
  'wireguard',
  'anytls',
];

/**
 * Check if a protocol type value is valid
 */
export function isValidProxyType(type: string): type is ProxyType {
  return (VALID_PROXY_TYPES as readonly string[]).includes(type);
}
