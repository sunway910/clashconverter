/**
 * WireGuard protocol adapter
 */

import type { ProxyNode, WireGuardProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';

/**
 * Adapter for WireGuard protocol
 */
export class WireGuardAdapter implements IProtocolAdapter {
  readonly type = 'wireguard';

  toClashJson(node: ProxyNode): Record<string, any> {
    const wg = node as unknown as WireGuardProxyNode;

    const obj: Record<string, any> = {
      type: 'wireguard',
      name: wg.name,
      server: wg.server,
      port: wg.port,
      'private-key': wg['private-key'],
      'public-key': wg['public-key'],
      udp: wg.udp ?? true,
    };

    if (wg.ip) obj.ip = wg.ip;
    if (wg.ipv6) obj.ipv6 = wg.ipv6;
    if (wg['pre-shared-key']) obj['pre-shared-key'] = wg['pre-shared-key'];
    if (wg['allowed-ips']?.length) obj['allowed-ips'] = wg['allowed-ips'];
    if (wg.reserved !== undefined) obj.reserved = wg.reserved;
    if (wg.mtu) obj.mtu = wg.mtu;
    if (wg['remote-dns-resolve'] !== undefined) obj['remote-dns-resolve'] = wg['remote-dns-resolve'];
    if (wg.dns?.length) obj.dns = wg.dns;
    if (wg['dialer-proxy']) obj['dialer-proxy'] = wg['dialer-proxy'];

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const wg = node as unknown as WireGuardProxyNode;

    // Legacy wireguard outbound (works on sing-box 1.8+; the endpoint form requires 1.11+)
    const obj: Record<string, any> = {
      tag: wg.name,
      type: 'wireguard',
      server: wg.server,
      server_port: wg.port,
      local_address: [wg.ip, wg.ipv6].filter(Boolean),
      private_key: wg['private-key'],
      peer_public_key: wg['public-key'],
    };

    if (wg['pre-shared-key']) obj.pre_shared_key = wg['pre-shared-key'];
    if (wg.reserved !== undefined) obj.reserved = wg.reserved;
    if (wg.mtu) obj.mtu = wg.mtu;

    return obj;
  }

  toLink(node: ProxyNode): string {
    const wg = node as unknown as WireGuardProxyNode;

    const params: string[] = [];
    params.push(`publickey=${encodeURIComponent(wg['public-key'])}`);
    const addresses = [wg.ip, wg.ipv6].filter(Boolean);
    if (addresses.length) params.push(`address=${addresses.join(',')}`);
    if (wg['allowed-ips']?.length) params.push(`allowed-ips=${wg['allowed-ips'].join(',')}`);
    if (wg['pre-shared-key']) params.push(`pre-shared-key=${encodeURIComponent(wg['pre-shared-key'])}`);
    if (wg.reserved !== undefined) {
      params.push(`reserved=${Array.isArray(wg.reserved) ? wg.reserved.join(',') : wg.reserved}`);
    }
    if (wg.mtu) params.push(`mtu=${wg.mtu}`);
    if (wg.dns?.length) params.push(`dns=${wg.dns.join(',')}`);
    if (wg['remote-dns-resolve']) params.push('remote-dns-resolve=true');

    let link = `wireguard://${encodeURIComponent(wg['private-key'])}@${wg.server}:${wg.port}`;
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(wg.name)}`;
    return link;
  }
}
