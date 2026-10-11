/**
 * Shared helpers for converting proxy share-link query parameters
 * into Clash Meta option structures. Used by the protocol link parsers.
 */

import type {
  GrpcOptions,
  H2Options,
  HttpOptions,
  SSPluginOptions,
  SSPluginType,
  WsOptions,
} from '../types/options';

export type LinkParams = Record<string, string>;

/**
 * Parse "true"/"1" style flags (case-insensitive)
 */
export function isTruthyParam(value: string | undefined): boolean {
  return value !== undefined && /^(true|1)$/i.test(value);
}

/**
 * Extract uTLS client fingerprint from common param spellings
 */
export function parseFingerprint(params: LinkParams): string | undefined {
  return params.fp || params['client-fingerprint'] || params.fingerprint || undefined;
}

/**
 * Parse comma separated ALPN into a clean array
 */
export function parseAlpn(params: LinkParams): string[] | undefined {
  if (!params.alpn) return undefined;
  const alpn = params.alpn.split(',').map((s) => s.trim()).filter(Boolean);
  return alpn.length ? alpn : undefined;
}

/**
 * Build Clash `ws-opts` from link params (path / Host / early-data)
 */
export function buildWsOpts(params: LinkParams): WsOptions | undefined {
  const opts: WsOptions = {};
  const path = params.path?.trim();
  const host = params.host?.trim();
  if (path) opts.path = path;
  if (host) opts.headers = { Host: host };
  // early data: explicit key or the common `ed` shorthand (e.g. ed=2048)
  const maxEarlyData = parseInt(params['max-early-data'] || params.ed || '', 10);
  if (Number.isInteger(maxEarlyData) && maxEarlyData > 0) opts['max-early-data'] = maxEarlyData;
  if (opts['max-early-data'] !== undefined && params['early-data-header-name']) {
    opts['early-data-header-name'] = params['early-data-header-name'];
  }
  return Object.keys(opts).length ? opts : undefined;
}

/**
 * Build Clash `grpc-opts` from link params.
 * Some exporters put the service name in `path` for grpc links.
 */
export function buildGrpcOpts(params: LinkParams): GrpcOptions | undefined {
  const name = params.serviceName || params['service-name'] || params.service || params.path;
  const serviceName = name?.trim();
  return serviceName ? { 'grpc-service-name': serviceName } : undefined;
}

/**
 * Build Clash `h2-opts` from link params (host list / path)
 */
export function buildH2Opts(params: LinkParams): H2Options | undefined {
  const opts: H2Options = {};
  if (params.host) {
    const host = params.host.split(',').map((s) => s.trim()).filter(Boolean);
    if (host.length) opts.host = host;
  }
  if (params.path) opts.path = params.path;
  return (opts.host?.length || opts.path) ? opts : undefined;
}

/**
 * Build Clash `http-opts` from link params (h1 transport)
 */
export function buildHttpOpts(params: LinkParams): HttpOptions | undefined {
  const opts: HttpOptions = {};
  if (params.path) {
    const path = params.path.split(',').map((s) => s.trim()).filter(Boolean);
    if (path.length) opts.path = path;
  }
  if (params.host) {
    const host = params.host.split(',').map((s) => s.trim()).filter(Boolean);
    if (host.length) opts.headers = { Host: host };
  }
  if (params.method) opts.method = params.method;
  return (opts.path?.length || opts.headers || opts.method) ? opts : undefined;
}

/**
 * Parsed SIP002 plugin parameter
 */
export interface SSPluginParam {
  plugin: SSPluginType;
  'plugin-opts': SSPluginOptions;
}

/** SIP002 plugin binary names -> Clash plugin type */
const SS_PLUGIN_NAME_MAP: Record<string, SSPluginType> = {
  'obfs-local': 'obfs',
  'simple-obfs': 'obfs',
  'obfs-local.exe': 'obfs',
  'v2ray-plugin': 'v2ray-plugin',
  'shadow-tls': 'shadow-tls',
  'shadow-tls-local': 'shadow-tls',
  restls: 'restls',
};

/**
 * Parse the SIP002 `plugin` query value:
 * `obfs-local;obfs=http;obfs-host=example.com`
 */
export function buildSsPlugin(value: string | undefined): SSPluginParam | undefined {
  if (!value) return undefined;

  const segments = value.split(';').map((s) => s.trim()).filter(Boolean);
  if (!segments.length) return undefined;

  const plugin = SS_PLUGIN_NAME_MAP[segments[0]];
  if (!plugin) return undefined;

  const opts: SSPluginOptions = {};
  for (const segment of segments.slice(1)) {
    const eq = segment.indexOf('=');
    const key = eq === -1 ? segment : segment.slice(0, eq);
    const val = eq === -1 ? '' : segment.slice(eq + 1);
    switch (key) {
      case 'obfs':
      case 'mode':
        opts.mode = val;
        break;
      case 'obfs-host':
      case 'host':
        opts.host = val;
        break;
      case 'password':
        opts.password = val;
        break;
      case 'path':
        opts.path = val;
        break;
      case 'tls':
        opts.tls = true;
        break;
      case 'version':
        opts.version = parseInt(val, 10) || undefined;
        break;
      case 'version-hint':
        opts['version-hint'] = val;
        break;
      case 'restls-script':
        opts['restls-script'] = val;
        break;
      case 'mux':
        opts.mux = isTruthyParam(val);
        break;
      case 'v2ray-http-upgrade':
        opts['v2ray-http-upgrade'] = isTruthyParam(val);
        break;
      case 'v2ray-http-upgrade-fast-open':
        opts['v2ray-http-upgrade-fast-open'] = isTruthyParam(val);
        break;
      default:
        break;
    }
  }

  return { plugin, 'plugin-opts': opts };
}
