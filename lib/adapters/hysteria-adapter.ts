/**
 * Hysteria and Hysteria2 protocol adapters
 */

import type { ProxyNode, HysteriaProxyNode, Hysteria2ProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';

/**
 * Adapter for Hysteria v1 protocol
 */
export class HysteriaAdapter implements IProtocolAdapter {
  readonly type = 'hysteria';

  toClashJson(node: ProxyNode): Record<string, any> {
    const hysNode = node as unknown as HysteriaProxyNode;

    return {
      type: 'hysteria',
      name: hysNode.name,
      server: hysNode.server,
      port: hysNode.port,
      auth_str: hysNode.auth_str || hysNode.auth || '',
      protocol: hysNode.protocol || 'udp',
      'skip-cert-verify': hysNode['skip-cert-verify'] || false,
      sni: hysNode.sni || '',
      up: hysNode.up || 10,
      down: hysNode.down || 50,
      alpn: hysNode.alpn || (hysNode.alpn === '' ? [] : ['h3']),
    };
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const hysNode = node as unknown as HysteriaProxyNode;

    return {
      tag: hysNode.name,
      type: 'hysteria',
      server: hysNode.server,
      server_port: hysNode.port,
      auth: hysNode.auth_str || hysNode.auth || '',
      up_mbps: hysNode.up || 10,
      down_mbps: hysNode.down || 50,
      ...(hysNode.sni && { server_name: hysNode.sni }),
    };
  }

  toLink(node: ProxyNode): string {
    const hysNode = node as unknown as HysteriaProxyNode;

    let link = `hysteria://${hysNode.server}:${hysNode.port}`;
    const params: string[] = [];
    if (hysNode.protocol) params.push(`protocol=${hysNode.protocol}`);
    const authValue = hysNode.auth_str || hysNode.auth;
    if (authValue) params.push(`auth=${encodeURIComponent(authValue)}`);
    if (hysNode.sni) params.push(`peer=${encodeURIComponent(hysNode.sni)}`);
    if (hysNode['skip-cert-verify']) params.push('insecure=1');
    if (hysNode.up) params.push(`upmbps=${hysNode.up}`);
    if (hysNode.down) params.push(`downmbps=${hysNode.down}`);
    if (hysNode.alpn) {
      const alpnValue = Array.isArray(hysNode.alpn) ? hysNode.alpn[0] : hysNode.alpn;
      params.push(`alpn=${encodeURIComponent(alpnValue)}`);
    }
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(hysNode.name)}`;
    return link;
  }
}

/**
 * Adapter for Hysteria2 protocol
 */
export class Hysteria2Adapter implements IProtocolAdapter {
  readonly type = 'hysteria2';

  toClashJson(node: ProxyNode): Record<string, any> {
    const hys2Node = node as unknown as Hysteria2ProxyNode;

    const obj: Record<string, any> = {
      type: 'hysteria2',
      name: hys2Node.name,
      server: hys2Node.server,
      port: hys2Node.port,
      password: hys2Node.password,
    };

    if (hys2Node['skip-cert-verify']) obj['skip-cert-verify'] = hys2Node['skip-cert-verify'];
    if (hys2Node.sni) obj.sni = hys2Node.sni;

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const hys2Node = node as unknown as Hysteria2ProxyNode;

    const obj: Record<string, any> = {
      tag: hys2Node.name,
      type: 'hysteria2',
      server: hys2Node.server,
      server_port: hys2Node.port,
      password: hys2Node.password,
      tls: {
        enabled: true,
      },
    };

    if (hys2Node.sni) {
      obj.tls.server_name = hys2Node.sni;
    }

    return obj;
  }

  toLink(node: ProxyNode): string {
    const hys2Node = node as unknown as Hysteria2ProxyNode;

    let link = `hysteria2://${hys2Node.password}@${hys2Node.server}:${hys2Node.port}`;
    const params: string[] = [];
    if (hys2Node.sni) params.push(`sni=${encodeURIComponent(hys2Node.sni)}`);
    if (hys2Node['skip-cert-verify']) params.push('insecure=1');
    if (params.length) link += `/?${params.join('&')}`;
    link += `#${encodeURIComponent(hys2Node.name)}`;
    return link;
  }
}
