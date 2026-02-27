/**
 * SOCKS5 protocol adapter
 */

import type { ProxyNode, SOCKS5ProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { UnsupportedProtocolError } from '../errors';

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

    return obj;
  }

  toSingBoxJson(_node: ProxyNode): Record<string, any> {
    // Sing-Box doesn't support SOCKS5 as an outbound
    throw UnsupportedProtocolError.forFormat('socks5', 'sing-box');
  }

  toLink(node: ProxyNode): string {
    const socksNode = node as unknown as SOCKS5ProxyNode;

    let link = `socks5://`;
    if (socksNode.username && socksNode.password) {
      link += `${encodeURIComponent(socksNode.username)}:${encodeURIComponent(socksNode.password)}@`;
    }
    link += `${socksNode.server}:${socksNode.port}`;
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
