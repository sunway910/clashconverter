/**
 * Trojan protocol adapter
 */

import type { ProxyNode, TrojanProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import {
  applyCommonClashFields,
  buildSingBoxTls,
  buildSingBoxTransport,
} from './shared';

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
    if (trojanNode['h2-opts']) obj['h2-opts'] = trojanNode['h2-opts'];
    if (trojanNode['reality-opts']) obj['reality-opts'] = trojanNode['reality-opts'];
    if (trojanNode.alpn?.length) obj.alpn = trojanNode.alpn;
    if (trojanNode['client-fingerprint']) obj['client-fingerprint'] = trojanNode['client-fingerprint'];
    if (trojanNode.fingerprint) obj.fingerprint = trojanNode.fingerprint;
    if (trojanNode['ss-opts']) obj['ss-opts'] = trojanNode['ss-opts'];
    applyCommonClashFields(node, obj);

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
    };

    // Trojan always uses TLS
    const tls = buildSingBoxTls(node, { force: true });
    if (tls) obj.tls = tls;

    const transport = buildSingBoxTransport(node);
    if (transport) obj.transport = transport;

    return obj;
  }

  toLink(node: ProxyNode): string {
    const trojanNode = node as unknown as TrojanProxyNode;

    let link = `trojan://${trojanNode.password}@${trojanNode.server}:${trojanNode.port}`;
    const params: string[] = [];
    params.push(`type=${trojanNode.network || 'tcp'}`);

    const reality = trojanNode['reality-opts'];
    if (reality) {
      params.push('security=reality');
      if (reality['public-key']) params.push(`pbk=${encodeURIComponent(reality['public-key'])}`);
      if (reality['short-id']) params.push(`sid=${encodeURIComponent(reality['short-id'])}`);
      if (reality['spider-x']) params.push(`spx=${encodeURIComponent(reality['spider-x'])}`);
    } else if (trojanNode['skip-cert-verify']) {
      params.push('security=tls');
      params.push('allowInsecure=1');
    }

    if (trojanNode.sni) params.push(`sni=${encodeURIComponent(trojanNode.sni)}`);

    const ws = trojanNode['ws-opts'];
    if (trojanNode.network === 'ws' && ws) {
      if (ws.path) params.push(`path=${encodeURIComponent(ws.path)}`);
      if (ws.headers?.Host) params.push(`host=${encodeURIComponent(ws.headers.Host)}`);
    }
    const grpc = trojanNode['grpc-opts'];
    if (trojanNode.network === 'grpc' && grpc?.['grpc-service-name']) {
      params.push(`serviceName=${encodeURIComponent(grpc['grpc-service-name'])}`);
    }
    const h2 = trojanNode['h2-opts'];
    if (trojanNode.network === 'h2' && h2) {
      if (h2.path) params.push(`path=${encodeURIComponent(h2.path)}`);
      if (h2.host?.length) params.push(`host=${encodeURIComponent(h2.host.join(','))}`);
    }

    if (trojanNode.alpn?.length) params.push(`alpn=${trojanNode.alpn.join(',')}`);
    if (trojanNode['client-fingerprint']) params.push(`fp=${encodeURIComponent(trojanNode['client-fingerprint'])}`);
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(trojanNode.name)}`;
    return link;
  }
}
