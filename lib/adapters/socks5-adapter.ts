/**
 * SOCKS5 protocol adapter
 */

import type { ProxyNode, SOCKS5ProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { applyCommonClashFields } from './shared';

/**
 * Adapter for SOCKS5 protocol
 */
export class SOCKS5Adapter implements IProtocolAdapter {
  readonly type = 'socks5';

  toClashJson(node: ProxyNode): Record<string, any> {
    const socksNode = node as unknown as SOCKS5ProxyNode;

    const obj: Record<string, any> = {
      type: 'socks5',
      name: socksNode.name,
      server: socksNode.server,
      port: socksNode.port,
    };

    if (socksNode.username) obj.username = socksNode.username;
    if (socksNode.password) obj.password = socksNode.password;
    if (socksNode.tls !== undefined) obj.tls = socksNode.tls;
    if (socksNode.udp !== undefined) obj.udp = socksNode.udp;
    if (socksNode['skip-cert-verify'] !== undefined) obj['skip-cert-verify'] = socksNode['skip-cert-verify'];
    if (socksNode.fingerprint) obj.fingerprint = socksNode.fingerprint;
    applyCommonClashFields(node, obj);

    return obj;
  }

  toSingBoxJson(_node: ProxyNode): Record<string, any> {
    const socksNode = _node as unknown as SOCKS5ProxyNode;

    const obj: Record<string, any> = {
      tag: socksNode.name,
      type: 'socks',
      server: socksNode.server,
      server_port: socksNode.port,
      version: '5',
    };

    if (socksNode.username) obj.username = socksNode.username;
    if (socksNode.password) obj.password = socksNode.password;

    return obj;
  }

  toLink(node: ProxyNode): string {
    const socksNode = node as unknown as SOCKS5ProxyNode;

    let link = `socks5://`;
    if (socksNode.username && socksNode.password) {
      link += `${encodeURIComponent(socksNode.username)}:${encodeURIComponent(socksNode.password)}@`;
    }
    link += `${socksNode.server}:${socksNode.port}`;

    const params: string[] = [];
    if (socksNode.tls) params.push('tls=1');
    if (socksNode.udp !== undefined) params.push(`udp=${socksNode.udp ? '1' : '0'}`);
    if (params.length) link += `?${params.join('&')}`;

    if (!this.isDefaultName(socksNode.name)) {
      link += `#${encodeURIComponent(socksNode.name)}`;
    }
    return link;
  }

  /**
   * Check if a name is a default name (should not have suffix)
   */
  private isDefaultName(name: string): boolean {
    return /^defaultName_\d+$/.test(name);
  }
}
