/**
 * ShadowsocksR (SSR) protocol adapter
 */

import type { ProxyNode, SSRProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';

/**
 * Base64 encode with URL-safe variant (no padding)
 */
function base64EncodeUrlSafe(str: string): string {
  const encoded = btoa(str);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Adapter for ShadowsocksR protocol
 */
export class SSRAdapter implements IProtocolAdapter {
  readonly type = 'ssr';

  toClashJson(node: ProxyNode): Record<string, any> {
    const ssrNode = node as unknown as SSRProxyNode;

    const obj: Record<string, any> = {
      type: 'ssr',
      name: ssrNode.name,
      server: ssrNode.server,
      port: ssrNode.port,
      cipher: ssrNode.cipher,
      password: ssrNode.password,
      protocol: ssrNode.protocol,
      obfs: ssrNode.obfs,
    };

    if (ssrNode.protocolparam) obj.protocolparam = ssrNode.protocolparam;
    if (ssrNode.obfsparam) obj.obfsparam = ssrNode.obfsparam;
    if (ssrNode.group) obj.group = ssrNode.group;

    return obj;
  }

  toSingBoxJson(_node: ProxyNode): Record<string, any> {
    const ssrNode = _node as unknown as SSRProxyNode;

    // Sing-Box doesn't support SSR, create a basic shadowsocks fallback
    return {
      tag: ssrNode.name,
      type: 'shadowsocks',
      server: ssrNode.server,
      server_port: ssrNode.port,
      method: ssrNode.cipher || 'aes-128-gcm',
      password: ssrNode.password,
    };
  }

  toLink(node: ProxyNode): string {
    const ssrNode = node as unknown as SSRProxyNode;

    // SSR format: ssr://base64(main)/base64(params)
    const cipher = ssrNode.cipher === 'dummy' ? 'auto' : ssrNode.cipher;
    const passwordEncoded = btoa(ssrNode.password);
    const plain = `${ssrNode.server}:${ssrNode.port}:${ssrNode.protocol}:${cipher}:${ssrNode.obfs}:${passwordEncoded}/`;
    let encoded = btoa(plain);
    encoded = encoded.replace(/=+$/, '');

    // Build params string with base64 encoded VALUES
    const paramsParts: string[] = [];
    paramsParts.push(`remarks=${btoa(ssrNode.name)}`);
    if (ssrNode.group) {
      paramsParts.push(`group=${btoa(ssrNode.group)}`);
    }
    if (ssrNode.protocolparam) {
      paramsParts.push(`protoparam=${btoa(ssrNode.protocolparam)}`);
    }
    if (ssrNode.obfsparam) {
      paramsParts.push(`obfsparam=${btoa(ssrNode.obfsparam)}`);
    }

    const paramsStr = paramsParts.join('&');
    const encodedParams = btoa(paramsStr);

    return `ssr://${encoded}/${encodedParams}`;
  }
}
