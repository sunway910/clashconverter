/**
 * Shared option structures used by proxy node types
 * Field names follow Clash Meta (mihomo) configuration keys
 * Reference: https://wiki.metacubex.one/config/proxies/
 */

// ============================================================================
// Primitive unions
// ============================================================================

/**
 * TLS client fingerprint (uTLS) values accepted by Clash Meta / sing-box.
 * The `(string & {})` branch keeps parsing permissive for unknown values
 * while preserving literal completion for the documented set.
 */
export type ClientFingerprint =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'iOS'
  | 'android'
  | 'edge'
  | '360'
  | 'qq'
  | 'random'
  | (string & {});

/**
 * Transport network type.
 * `quic` is accepted for VMess/VLESS link compatibility even though
 * mihomo itself does not expose it as a transport.
 */
export type NetworkType = 'tcp' | 'ws' | 'http' | 'h2' | 'grpc' | 'quic';

/**
 * Preferred IP stack for outgoing connections (`ip-version`)
 */
export type IPVersion = 'dual' | 'ipv4' | 'ipv6' | 'ipv4-prefer' | 'ipv6-prefer';

/**
 * Shadowsocks plugin types (`plugin`)
 */
export type SSPluginType = 'obfs' | 'v2ray-plugin' | 'shadow-tls' | 'restls';

// ============================================================================
// Transport options
// ============================================================================

/**
 * WebSocket transport options (`ws-opts`)
 */
export interface WsOptions {
  path?: string;
  headers?: Record<string, string>;
  'max-early-data'?: number;
  'early-data-header-name'?: string;
  'v2ray-http-upgrade'?: boolean;
  'v2ray-http-upgrade-fast-open'?: boolean;
}

/**
 * gRPC transport options (`grpc-opts`)
 */
export interface GrpcOptions {
  'grpc-service-name'?: string;
}

/**
 * HTTP (h1) transport options (`http-opts`, VMess/VLESS only)
 */
export interface HttpOptions {
  method?: string;
  path?: string[];
  headers?: Record<string, string[]>;
}

/**
 * H2 transport options (`h2-opts`)
 */
export interface H2Options {
  host?: string[];
  path?: string;
}

// ============================================================================
// TLS / security options
// ============================================================================

/**
 * Reality options (`reality-opts`)
 */
export interface RealityOptions {
  'public-key'?: string;
  'short-id'?: string;
  'spider-x'?: string;
  /** Post-quantum (ML-DSA-65) public verify key */
  'mldsa65-verify'?: string;
  /** Encrypted Client Hello config */
  ech?: string;
}

// ============================================================================
// Multiplex / plugin / relay options
// ============================================================================

/**
 * sing-box style multiplex options (`smux`)
 */
export interface SmuxOptions {
  enabled?: boolean;
  protocol?: 'smux' | 'yamux' | 'h2mux';
  'max-connections'?: number;
  'min-streams'?: number;
  'max-streams'?: number;
  padding?: boolean;
  statistic?: boolean;
  'only-tcp'?: boolean;
}

/**
 * Shadowsocks plugin options (`plugin-opts`), shape depends on `plugin`
 */
export interface SSPluginOptions {
  /** obfs: http | tls */
  mode?: string;
  /** obfs host */
  host?: string;
  /** v2ray-plugin / shadow-tls / restls password */
  password?: string;
  /** v2ray-plugin websocket path */
  path?: string;
  /** v2ray-plugin tls */
  tls?: boolean;
  fingerprint?: string;
  headers?: Record<string, string>;
  'skip-cert-verify'?: boolean;
  /** shadow-tls version */
  version?: number;
  /** v2ray-plugin mux (reserved, not supported by mihomo) */
  mux?: boolean;
  'v2ray-http-upgrade'?: boolean;
  'v2ray-http-upgrade-fast-open'?: boolean;
  /** restls hint */
  'version-hint'?: string;
  /** restls script */
  'restls-script'?: string;
}

/**
 * Trojan-Go Shadowsocks relay options (`ss-opts`, encryption=ss;method;password)
 */
export interface TrojanSSOptions {
  enabled: boolean;
  method: string;
  password: string;
}

/**
 * WireGuard peer options (top level or inside `peers`)
 */
export interface WireGuardPeerOptions {
  server?: string;
  port?: number;
  'public-key'?: string;
  'pre-shared-key'?: string;
  reserved?: number[];
  'allowed-ips'?: string[];
}
