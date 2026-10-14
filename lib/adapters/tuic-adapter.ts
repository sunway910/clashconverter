/**
 * TUIC v5 protocol adapter
 */

import type { ProxyNode, TuicProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { applyCommonClashFields } from './shared';

/**
 * Adapter for TUIC v5 protocol (Clash Meta mihomo / Sing-Box >= 1.3)
 * Auth = uuid + password (legacy v4 token scheme not supported)
 */
export class TuicAdapter implements IProtocolAdapter {
  readonly type = 'tuic';

  toClashJson(node: ProxyNode): Record<string, any> {
    const n = node as unknown as TuicProxyNode;

    const obj: Record<string, any> = {
      type: 'tuic',
      name: n.name,
      server: n.server,
      port: n.port,
      uuid: n.uuid,
      password: n.password,
      udp: n.udp ?? true,
    };

    if (n.sni) obj.sni = n.sni;
    if (n.ip) obj.ip = n.ip;
    if (n['skip-cert-verify']) obj['skip-cert-verify'] = n['skip-cert-verify'];
    if (n.alpn?.length) obj.alpn = n.alpn;
    if (n['congestion-controller']) obj['congestion-controller'] = n['congestion-controller'];
    if (n['udp-relay-mode'] === 'native' || n['udp-relay-mode'] === 'quic') obj['udp-relay-mode'] = n['udp-relay-mode'];
    if (n['reduce-rtt'] !== undefined) obj['reduce-rtt'] = n['reduce-rtt'];
    if (n['disable-sni'] !== undefined) obj['disable-sni'] = n['disable-sni'];
    if (n['heartbeat-interval'] !== undefined) obj['heartbeat-interval'] = n['heartbeat-interval'];
    if (n['max-udp-relay-packet-size'] !== undefined) obj['max-udp-relay-packet-size'] = n['max-udp-relay-packet-size'];
    if (n['max-open-streams'] !== undefined) obj['max-open-streams'] = n['max-open-streams'];
    if (n['fast-open']) obj['fast-open'] = n['fast-open'];
    applyCommonClashFields(node, obj);

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const n = node as unknown as TuicProxyNode;

    const obj: Record<string, any> = {
      tag: n.name,
      type: 'tuic',
      server: n.server,
      server_port: n.port,
      uuid: n.uuid,
      password: n.password,
      tls: {
        enabled: true,
        ...(n.sni && { server_name: n.sni }),
        ...(n.alpn?.length && { alpn: n.alpn }),
        ...(n['skip-cert-verify'] && { insecure: true }),
      },
    };

    if (n['congestion-controller']) obj.congestion_control = n['congestion-controller'];
    if (n['udp-relay-mode']) obj.udp_relay_mode = n['udp-relay-mode'];
    if (n['reduce-rtt'] !== undefined) obj.zero_rtt_handshake = n['reduce-rtt'];
    if (n['heartbeat-interval'] !== undefined) obj.heartbeat = `${n['heartbeat-interval']}ms`;

    return obj;
  }

  toLink(node: ProxyNode): string {
    const n = node as unknown as TuicProxyNode;

    const params: string[] = [];
    if (n.sni) params.push(`sni=${encodeURIComponent(n.sni)}`);
    if (n.alpn?.length) params.push(`alpn=${n.alpn.join(',')}`);
    if (n['congestion-controller']) params.push(`congestion_control=${n['congestion-controller']}`);
    if (n['udp-relay-mode']) params.push(`udp_relay_mode=${n['udp-relay-mode']}`);
    if (n['reduce-rtt']) params.push('reduce-rtt=1');
    if (n['disable-sni']) params.push('disable-sni=1');
    if (n['skip-cert-verify']) params.push('allow_insecure=1');

    let link = `tuic://${encodeURIComponent(n.uuid)}:${encodeURIComponent(n.password)}@${n.server}:${n.port}`;
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(n.name)}`;
    return link;
  }
}
