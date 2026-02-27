/**
 * Trojan protocol adapter
 */

import type { ProxyNode, TrojanProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';

/**
 * Adapter for Trojan protocol
 */
export class TrojanAdapter implements IProtocolAdapter {
  readonly type = 'trojan';

  toClashJson(node: ProxyNode): Record<string, any> {
    const trojanNode = node as unknown as TrojanProxyNode;

    const obj: Record<string, any> = {
      type: 'trojan',
      name: trojanNode.name,
      server: trojanNode.server,
      port: trojanNode.port,
      password: trojanNode.password,
      udp: trojanNode.udp ?? true,
    };

    if (trojanNode['skip-cert-verify']) obj['skip-cert-verify'] = trojanNode['skip-cert-verify'];
    if (trojanNode.sni) obj.sni = trojanNode.sni;

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const trojanNode = node as unknown as TrojanProxyNode;

    const obj: Record<string, any> = {
      tag: trojanNode.name,
      type: 'trojan',
      server: trojanNode.server,
      server_port: trojanNode.port,
      password: trojanNode.password,
      tls: {
        enabled: true,
        ...(trojanNode['skip-cert-verify'] !== undefined && { insecure: trojanNode['skip-cert-verify'] }),
        ...(trojanNode.sni && { server_name: trojanNode.sni }),
      },
    };

    return obj;
  }

  toLink(node: ProxyNode): string {
    const trojanNode = node as unknown as TrojanProxyNode;

    let link = `trojan://${trojanNode.password}@${trojanNode.server}:${trojanNode.port}`;
    const params: string[] = [];
    params.push(`type=${trojanNode.network || 'tcp'}`);
    if (trojanNode['skip-cert-verify']) {
      params.push('security=tls');
      params.push('allowInsecure=1');
    }
    if (trojanNode.sni) params.push(`sni=${encodeURIComponent(trojanNode.sni)}`);
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(trojanNode.name)}`;
    return link;
  }
}
