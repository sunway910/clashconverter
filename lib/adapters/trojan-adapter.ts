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
    if (trojanNode.network && trojanNode.network !== 'tcp') obj.network = trojanNode.network;
    if (trojanNode['ws-opts']) obj['ws-opts'] = trojanNode['ws-opts'];
    if (trojanNode['grpc-opts']) obj['grpc-opts'] = trojanNode['grpc-opts'];
    if (trojanNode.alpn?.length) obj.alpn = trojanNode.alpn;
    if (trojanNode['client-fingerprint']) obj['client-fingerprint'] = trojanNode['client-fingerprint'];
    if (trojanNode['ss-opts']) obj['ss-opts'] = trojanNode['ss-opts'];

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
        ...(trojanNode.alpn?.length && { alpn: trojanNode.alpn }),
      },
    };

    // Transport layer (ws / grpc / h2)
    const wsOpts = trojanNode['ws-opts'];
    if (trojanNode.network === 'ws' && wsOpts) {
      obj.transport = {
        type: 'ws',
        ...(wsOpts.path && { path: wsOpts.path }),
        ...(wsOpts.headers && { headers: wsOpts.headers }),
      };
    }
    const grpcOpts = trojanNode['grpc-opts'];
    if (trojanNode.network === 'grpc' && grpcOpts) {
      obj.transport = {
        type: 'grpc',
        ...(grpcOpts['grpc-service-name'] && { service_name: grpcOpts['grpc-service-name'] }),
      };
    }
    if (trojanNode.network === 'h2') {
      obj.transport = { type: 'http' };
    }

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
    const wsOpts = trojanNode['ws-opts'];
    if (trojanNode.network === 'ws' && wsOpts) {
      if (wsOpts.path) params.push(`path=${encodeURIComponent(wsOpts.path)}`);
      if (wsOpts.headers?.Host) params.push(`host=${encodeURIComponent(wsOpts.headers.Host)}`);
    }
    const grpcOpts = trojanNode['grpc-opts'];
    if (trojanNode.network === 'grpc' && grpcOpts?.['grpc-service-name']) {
      params.push(`serviceName=${encodeURIComponent(grpcOpts['grpc-service-name'])}`);
    }
    if (trojanNode.alpn?.length) params.push(`alpn=${trojanNode.alpn.join(',')}`);
    if (trojanNode['client-fingerprint']) params.push(`fp=${encodeURIComponent(trojanNode['client-fingerprint'])}`);
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(trojanNode.name)}`;
    return link;
  }
}
