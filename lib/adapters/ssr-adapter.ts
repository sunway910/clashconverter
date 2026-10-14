/**
 * ShadowsocksR (SSR) protocol adapter
 */

import type { ProxyNode, SSRProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { applyCommonClashFields } from './shared';
import { UnsupportedProtocolError } from '../errors';

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

    if (ssrNode['protocol-param']) obj['protocol-param'] = ssrNode['protocol-param'];
    if (ssrNode['obfs-param']) obj['obfs-param'] = ssrNode['obfs-param'];
    if (ssrNode.group) obj.group = ssrNode.group;
    if (ssrNode.udp !== undefined) obj.udp = ssrNode.udp;
    applyCommonClashFields(node, obj);

    return obj;
  }

  toSingBoxJson(_node: ProxyNode): Record<string, any> {
    // Sing-Box has no SSR support: SSR nodes are filtered by the sing-box
    // generator (SING_BOX_SUPPORTED_PROTOCOLS). Fabricating a shadowsocks node
    // here would silently produce a non-working outbound (SSR ciphers/params
    // are not valid SS), so fail loudly instead.
    throw UnsupportedProtocolError.forKernel('ssr', 'sing-box');
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
    if (ssrNode['protocol-param']) {
      paramsParts.push(`protoparam=${btoa(ssrNode['protocol-param'])}`);
    }
    if (ssrNode['obfs-param']) {
      paramsParts.push(`obfsparam=${btoa(ssrNode['obfs-param'])}`);
    }

    const paramsStr = paramsParts.join('&');
    const encodedParams = btoa(paramsStr);

    return `ssr://${encoded}/${encodedParams}`;
  }
}
