// ============================================================================
// Strongly Typed ProxyNode Definitions
// ============================================================================

// Re-export all proxy node types from the dedicated types file
export type {
  ProxyType,
  SSProxyNode,
  SSRProxyNode,
  VMessProxyNode,
  VLESSProxyNode,
  TrojanProxyNode,
  HysteriaProxyNode,
  Hysteria2ProxyNode,
  HTTPProxyNode,
  SOCKS5ProxyNode,
  LegacyProxyNode,
} from './types/proxy-nodes';

// Re-export type guards
export {
  isSSProxy,
  isSSRProxy,
  isVMessProxy,
  isVLESSProxy,
  isTrojanProxy,
  isHysteriaProxy,
  isHysteria2Proxy,
  isHTTPProxy,
  isSOCKS5Proxy,
  isValidProxyType,
} from './types/proxy-nodes';

// Re-export ProxyNode as a type alias for convenience
export type { ProxyNode } from './types/proxy-nodes';

// Re-export validators
export {
  validateProxyNode,
  validateProxyNodes,
  safeValidateProxyNode,
  isValidProxyNode,
  getSchemaForType,
  ssProxySchema,
  ssrProxySchema,
  vmessProxySchema,
  vlessProxySchema,
  trojanProxySchema,
  hysteriaProxySchema,
  hysteria2ProxySchema,
  httpProxySchema,
  socks5ProxySchema,
} from './types/validators';

// ============================================================================
// Legacy Types (to be migrated)
// ============================================================================

export interface ClashConfig {
  proxies: import('./types/proxy-nodes').ProxyNode[];
  proxyNames: string[];
}

export interface ParsedProxy {
  name: string;
  config: import('./types/proxy-nodes').ProxyNode;
}

// Output format types
export type OutputFormat = 'clash-meta' | 'clash-premium' | 'sing-box' | 'loon';

