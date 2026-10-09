/**
 * AnyTLS protocol adapter
 */

import type { ProxyNode, AnyTLSProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';

/**
 * Adapter for AnyTLS protocol (Clash Meta >= 1.19.2, Sing-Box >= 1.12)
 */
export class AnyTLSAdapter implements IProtocolAdapter {
  readonly type = 'anytls';

  toClashJson(node: ProxyNode): Record<string, any> {
    const n = node as unknown as AnyTLSProxyNode;

    const obj: Record<string, any> = {
      type: 'anytls',
      name: n.name,
      server: n.server,
      port: n.port,
      password: n.password,
      udp: n.udp ?? true,
    };

    if (n.sni) obj.sni = n.sni;
    if (n['skip-cert-verify']) obj['skip-cert-verify'] = n['skip-cert-verify'];
    if (n.alpn?.length) obj.alpn = n.alpn;
    if (n['client-fingerprint']) obj['client-fingerprint'] = n['client-fingerprint'];
    if (n['idle-session-check-interval'] !== undefined) obj['idle-session-check-interval'] = n['idle-session-check-interval'];
    if (n['idle-session-timeout'] !== undefined) obj['idle-session-timeout'] = n['idle-session-timeout'];
    if (n['min-idle-session'] !== undefined) obj['min-idle-session'] = n['min-idle-session'];

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const n = node as unknown as AnyTLSProxyNode;

    const obj: Record<string, any> = {
      tag: n.name,
      type: 'anytls',
      server: n.server,
      server_port: n.port,
      password: n.password,
      tls: {
        enabled: true,
        ...(n.sni && { server_name: n.sni }),
        ...(n.alpn?.length && { alpn: n.alpn }),
        ...(n['skip-cert-verify'] && { insecure: true }),
      },
    };

    // sing-box duration fields accept "Ns" strings (a bare integer means nanoseconds)
    if (n['idle-session-check-interval'] !== undefined) obj.idle_session_check_interval = `${n['idle-session-check-interval']}s`;
    if (n['idle-session-timeout'] !== undefined) obj.idle_session_timeout = `${n['idle-session-timeout']}s`;
    if (n['min-idle-session'] !== undefined) obj.min_idle_session = n['min-idle-session'];

    return obj;
  }

  toLink(node: ProxyNode): string {
    const n = node as unknown as AnyTLSProxyNode;

    const params: string[] = [];
    if (n.sni) params.push(`sni=${encodeURIComponent(n.sni)}`);
    if (n.alpn?.length) params.push(`alpn=${n.alpn.join(',')}`);
    if (n['client-fingerprint']) params.push(`fp=${encodeURIComponent(n['client-fingerprint'])}`);
    if (n['skip-cert-verify']) params.push('allowInsecure=1');
    params.push(`udp=${n.udp === false ? '0' : '1'}`);
    if (n['idle-session-check-interval'] !== undefined) params.push(`idle-session-check-interval=${n['idle-session-check-interval']}`);
    if (n['idle-session-timeout'] !== undefined) params.push(`idle-session-timeout=${n['idle-session-timeout']}`);
    if (n['min-idle-session'] !== undefined) params.push(`min-idle-session=${n['min-idle-session']}`);

    let link = `anytls://${encodeURIComponent(n.password)}@${n.server}:${n.port}`;
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(n.name)}`;
    return link;
  }
}
