/**
 * Shadowsocks (SS) protocol adapter
 */

import type { ProxyNode, SSProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { base64Encode } from '../utils';
import { applyCommonClashFields, buildSingBoxMultiplex } from './shared';

/**
 * Serialize plugin-opts into the `key=value;...` form shared by
 * SIP002 links and sing-box plugin_opts
 */
function serializePluginOpts(ssNode: SSProxyNode): string[] {
  const opts = ssNode['plugin-opts'] || {};
  const parts: string[] = [];
  if (opts.mode) parts.push(`obfs=${opts.mode}`);
  if (opts.host) parts.push(`obfs-host=${opts.host}`);
  if (opts.password) parts.push(`password=${opts.password}`);
  if (opts.path) parts.push(`path=${opts.path}`);
  if (opts.tls) parts.push('tls');
  if (opts.version !== undefined) parts.push(`version=${opts.version}`);
  return parts;
}

/**
 * Adapter for Shadowsocks protocol
 */
export class SSAdapter implements IProtocolAdapter {
  readonly type = 'ss';

  toClashJson(node: ProxyNode): Record<string, any> {
    const ssNode = node as unknown as SSProxyNode;

    const obj: Record<string, any> = {
      type: 'ss',
      name: ssNode.name,
      server: ssNode.server,
      port: ssNode.port,
      cipher: ssNode.cipher || 'aes-256-gcm',
      password: ssNode.password,
      udp: ssNode.udp ?? true,
    };

    if (ssNode.plugin) obj.plugin = ssNode.plugin;
    if (ssNode['plugin-opts']) obj['plugin-opts'] = ssNode['plugin-opts'];
    if (ssNode['udp-over-tcp'] !== undefined) obj['udp-over-tcp'] = ssNode['udp-over-tcp'];
    if (ssNode['udp-over-tcp-version'] !== undefined) obj['udp-over-tcp-version'] = ssNode['udp-over-tcp-version'];
    if (ssNode['client-fingerprint']) obj['client-fingerprint'] = ssNode['client-fingerprint'];
    if (ssNode.smux) obj.smux = ssNode.smux;
    applyCommonClashFields(node, obj);

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const ssNode = node as unknown as SSProxyNode;

    const obj: Record<string, any> = {
      tag: ssNode.name,
      type: 'shadowsocks',
      server: ssNode.server,
      server_port: ssNode.port,
      method: ssNode.cipher || 'aes-128-gcm',
      password: ssNode.password,
    };

    if (ssNode['udp-over-tcp']) obj.udp_over_tcp = true;

    // sing-box plugins use the binary name + key=value opts string
    if (ssNode.plugin) {
      obj.plugin = ssNode.plugin === 'obfs' ? 'obfs-local' : ssNode.plugin;
      const parts = serializePluginOpts(ssNode);
      if (parts.length) obj.plugin_opts = parts.join(';');
    }

    const multiplex = buildSingBoxMultiplex(node);
    if (multiplex) obj.multiplex = multiplex;

    return obj;
  }

  toLink(node: ProxyNode): string {
    const ssNode = node as unknown as SSProxyNode;

    const userInfo = `${ssNode.cipher}:${ssNode.password}`;
    const encoded = base64Encode(userInfo);
    let link = `ss://${encoded}@${ssNode.server}:${ssNode.port}`;

    // SIP002 plugin parameter: plugin=obfs-local;obfs=http;obfs-host=...
    if (ssNode.plugin) {
      const parts = [ssNode.plugin === 'obfs' ? 'obfs-local' : ssNode.plugin, ...serializePluginOpts(ssNode)];
      link += `/?plugin=${encodeURIComponent(parts.join(';'))}`;
    }

    link += `#${encodeURIComponent(ssNode.name)}`;
    return link;
  }
}
