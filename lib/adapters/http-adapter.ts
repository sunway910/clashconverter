/**
 * HTTP protocol adapter
 */

import type { ProxyNode, HTTPProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { applyCommonClashFields, buildSingBoxTls } from './shared';

/**
 * Adapter for HTTP protocol
 */
export class HTTPAdapter implements IProtocolAdapter {
  readonly type = 'http';

  toClashJson(node: ProxyNode): Record<string, any> {
    // Type assertion: this adapter only handles HTTP proxy nodes
    const httpNode = node as unknown as HTTPProxyNode;

    const obj: Record<string, any> = {
      type: 'http',
      name: httpNode.name,
      server: httpNode.server,
      port: httpNode.port,
    };

    if (httpNode.username) obj.username = httpNode.username;
    if (httpNode.password) obj.password = httpNode.password;
    if (httpNode.tls) obj.tls = httpNode.tls;
    if (httpNode.sni) obj.sni = httpNode.sni;
    if (httpNode['skip-cert-verify'] !== undefined) obj['skip-cert-verify'] = httpNode['skip-cert-verify'];
    if (httpNode.fingerprint) obj.fingerprint = httpNode.fingerprint;
    if (httpNode.headers) obj.headers = httpNode.headers;
    applyCommonClashFields(node, obj);

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const httpNode = node as unknown as HTTPProxyNode;

    const obj: Record<string, any> = {
      tag: httpNode.name,
      type: 'http',
      server: httpNode.server,
      server_port: httpNode.port,
      users: [
        {
          username: httpNode.username,
          password: httpNode.password,
        },
      ],
      set_system_proxy: true,
    };

    const tls = buildSingBoxTls(node);
    if (tls) obj.tls = tls;

    return obj;
  }

  toLink(node: ProxyNode): string {
    const httpNode = node as unknown as HTTPProxyNode;

    let link = `http://`;
    if (httpNode.username && httpNode.password) {
      link += `${encodeURIComponent(httpNode.username)}:${encodeURIComponent(httpNode.password)}@`;
    }
    link += `${httpNode.server}:${httpNode.port}`;
    if (httpNode.tls) link += '?tls=1';
    if (!this.isDefaultName(httpNode.name)) {
      link += `#${encodeURIComponent(httpNode.name)}`;
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
