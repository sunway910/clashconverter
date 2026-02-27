/**
 * Shadowsocks (SS) protocol adapter
 */

import type { ProxyNode, SSProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { base64Encode } from '../utils';

/**
 * Adapter for Shadowsocks protocol
 */
export class SSAdapter implements IProtocolAdapter {
  readonly type = 'ss';

  toClashJson(node: ProxyNode): Record<string, any> {
    const ssNode = node as unknown as SSProxyNode;

    return {
      type: 'ss',
      name: ssNode.name,
      server: ssNode.server,
      port: ssNode.port,
      cipher: ssNode.cipher || 'aes-256-gcm',
      password: ssNode.password,
      udp: true,
    };
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const ssNode = node as unknown as SSProxyNode;

    return {
      tag: ssNode.name,
      type: 'shadowsocks',
      server: ssNode.server,
      server_port: ssNode.port,
      method: ssNode.cipher || 'aes-128-gcm',
      password: ssNode.password,
    };
  }

  toLink(node: ProxyNode): string {
    const ssNode = node as unknown as SSProxyNode;

    const userInfo = `${ssNode.cipher}:${ssNode.password}`;
    const encoded = base64Encode(userInfo);
    return `ss://${encoded}@${ssNode.server}:${ssNode.port}#${encodeURIComponent(ssNode.name)}`;
  }
}
