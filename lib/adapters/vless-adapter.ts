/**
 * VLESS protocol adapter
 */

import type { ProxyNode, VLESSProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { applyCommonClashFields, buildSingBoxTls, buildSingBoxTransport } from './shared';

/**
 * Adapter for VLESS protocol
 */
export class VLESSAdapter implements IProtocolAdapter {
  readonly type = 'vless';

  toClashJson(node: ProxyNode): Record<string, any> {
    const vlessNode = node as unknown as VLESSProxyNode;

    const obj: Record<string, any> = {
      type: 'vless',
      name: vlessNode.name,
      server: vlessNode.server,
      port: vlessNode.port,
      uuid: vlessNode.uuid,
      network: vlessNode.network || 'tcp',
    };

    if (vlessNode.tls !== undefined) obj.tls = vlessNode.tls;
    if (vlessNode.servername) obj.servername = vlessNode.servername;
    if (vlessNode['skip-cert-verify']) obj['skip-cert-verify'] = vlessNode['skip-cert-verify'];
    if (vlessNode.flow) obj.flow = vlessNode.flow;
    if (vlessNode['reality-opts']) obj['reality-opts'] = vlessNode['reality-opts'];
    if (vlessNode['client-fingerprint']) obj['client-fingerprint'] = vlessNode['client-fingerprint'];
    if (vlessNode['ws-opts']) obj['ws-opts'] = vlessNode['ws-opts'];
    if (vlessNode['grpc-opts']) obj['grpc-opts'] = vlessNode['grpc-opts'];
    if (vlessNode['h2-opts']) obj['h2-opts'] = vlessNode['h2-opts'];
    if (vlessNode['http-opts']) obj['http-opts'] = vlessNode['http-opts'];
    if (vlessNode.alpn?.length) obj.alpn = vlessNode.alpn;
    if (vlessNode.udp !== undefined) obj.udp = vlessNode.udp;
    if (vlessNode['packet-addr'] !== undefined) obj['packet-addr'] = vlessNode['packet-addr'];
    if (vlessNode.xudp !== undefined) obj.xudp = vlessNode.xudp;
    if (vlessNode['packet-encoding']) obj['packet-encoding'] = vlessNode['packet-encoding'];
    if (vlessNode.fingerprint) obj.fingerprint = vlessNode.fingerprint;
    if (vlessNode.smux) obj.smux = vlessNode.smux;
    applyCommonClashFields(node, obj);

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const vlessNode = node as unknown as VLESSProxyNode;

    const obj: Record<string, any> = {
      tag: vlessNode.name,
      type: 'vless',
      server: vlessNode.server,
      server_port: vlessNode.port,
      uuid: vlessNode.uuid,
    };

    if (vlessNode.flow) obj.flow = vlessNode.flow;

    if (vlessNode.udp !== undefined) obj.udp = vlessNode.udp;

    const transport = buildSingBoxTransport(node);
    if (transport) obj.transport = transport;

    const tls = buildSingBoxTls(node);
    if (tls) obj.tls = tls;

    return obj;
  }

  toLink(node: ProxyNode): string {
    const vlessNode = node as unknown as VLESSProxyNode;

    let link = `vless://${vlessNode.uuid}@${vlessNode.server}:${vlessNode.port}`;
    const params: string[] = [];
    params.push(`security=${vlessNode['reality-opts'] ? 'reality' : vlessNode.tls ? 'tls' : 'none'}`);
    params.push(`type=${vlessNode.network || 'tcp'}`);
    params.push('encryption=none');
    if (vlessNode.flow && vlessNode.flow !== '') params.push(`flow=${vlessNode.flow}`);
    if (vlessNode.network === 'tcp' || !vlessNode.flow || vlessNode.flow === '') params.push('headerType=none');
    if (vlessNode.sni) params.push(`sni=${encodeURIComponent(vlessNode.sni)}`);
    if (vlessNode['skip-cert-verify']) params.push('allowInsecure=1');
    const ws = vlessNode['ws-opts'];
    if (vlessNode.network === 'ws' && ws) {
      if (ws.path) params.push(`path=${encodeURIComponent(ws.path)}`);
      if (ws.headers?.Host) params.push(`host=${encodeURIComponent(ws.headers.Host)}`);
    }
    const grpc = vlessNode['grpc-opts'];
    if (vlessNode.network === 'grpc' && grpc?.['grpc-service-name']) {
      params.push(`serviceName=${encodeURIComponent(grpc['grpc-service-name'])}`);
    }
    if (vlessNode.alpn?.length) params.push(`alpn=${vlessNode.alpn.join(',')}`);
    if (vlessNode['client-fingerprint']) params.push(`fp=${encodeURIComponent(vlessNode['client-fingerprint'])}`);
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(vlessNode.name)}`;
    return link;
  }
}
