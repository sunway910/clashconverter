/**
 * VMess protocol adapter
 */

import type { ProxyNode, VMessProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';
import { base64Encode } from '../utils';
import {
  applyCommonClashFields,
  buildSingBoxMultiplex,
  buildSingBoxTls,
  buildSingBoxTransport,
} from './shared';

/**
 * Adapter for VMess protocol
 */
export class VMessAdapter implements IProtocolAdapter {
  readonly type = 'vmess';

  toClashJson(node: ProxyNode): Record<string, any> {
    const vmessNode = node as unknown as VMessProxyNode;

    const obj: Record<string, any> = {
      type: 'vmess',
      name: vmessNode.name,
      server: vmessNode.server,
      port: vmessNode.port,
      uuid: vmessNode.uuid,
      alterId: vmessNode.alterId || 0,
      cipher: vmessNode.cipher || 'auto',
      network: vmessNode.network || 'tcp',
      udp: vmessNode.udp ?? true,
    };

    if (vmessNode.tls !== undefined) obj.tls = vmessNode.tls;
    if (vmessNode['skip-cert-verify'] !== undefined) obj['skip-cert-verify'] = vmessNode['skip-cert-verify'];
    if (vmessNode.servername) obj.servername = vmessNode.servername;
    if (vmessNode.sni) obj.sni = vmessNode.sni;
    if (vmessNode.alpn?.length) obj.alpn = vmessNode.alpn;
    if (vmessNode['ws-opts']) obj['ws-opts'] = vmessNode['ws-opts'];
    if (vmessNode['grpc-opts']) obj['grpc-opts'] = vmessNode['grpc-opts'];
    if (vmessNode['h2-opts']) obj['h2-opts'] = vmessNode['h2-opts'];
    if (vmessNode['http-opts']) obj['http-opts'] = vmessNode['http-opts'];
    if (vmessNode['reality-opts']) obj['reality-opts'] = vmessNode['reality-opts'];
    if (vmessNode['client-fingerprint']) obj['client-fingerprint'] = vmessNode['client-fingerprint'];
    if (vmessNode['packet-addr'] !== undefined) obj['packet-addr'] = vmessNode['packet-addr'];
    if (vmessNode.xudp !== undefined) obj.xudp = vmessNode.xudp;
    if (vmessNode['packet-encoding']) obj['packet-encoding'] = vmessNode['packet-encoding'];
    if (vmessNode['global-padding'] !== undefined) obj['global-padding'] = vmessNode['global-padding'];
    if (vmessNode['authenticated-length'] !== undefined) obj['authenticated-length'] = vmessNode['authenticated-length'];
    if (vmessNode.fingerprint) obj.fingerprint = vmessNode.fingerprint;
    if (vmessNode.smux) obj.smux = vmessNode.smux;
    applyCommonClashFields(node, obj);

    return obj;
  }

  toSingBoxJson(node: ProxyNode): Record<string, any> {
    const vmessNode = node as unknown as VMessProxyNode;

    const obj: Record<string, any> = {
      tag: vmessNode.name,
      type: 'vmess',
      server: vmessNode.server,
      server_port: vmessNode.port,
      uuid: vmessNode.uuid,
      alter_id: vmessNode.alterId || 0,
      security: vmessNode.cipher || 'auto',
      packet_encoding: vmessNode['packet-encoding'] || 'xudp',
    };

    const transport = buildSingBoxTransport(node);
    if (transport) obj.transport = transport;

    const tls = buildSingBoxTls(node);
    if (tls) obj.tls = tls;

    const multiplex = buildSingBoxMultiplex(node);
    if (multiplex) obj.multiplex = multiplex;

    return obj;
  }

  toLink(node: ProxyNode): string {
    const vmessNode = node as unknown as VMessProxyNode;

    // v2rayN share format
    const link: Record<string, unknown> = {
      v: '2',
      ps: vmessNode.name,
      add: vmessNode.server,
      port: vmessNode.port,
      id: vmessNode.uuid,
      aid: vmessNode.alterId || 0,
      scy: vmessNode.cipher || 'auto',
      net: vmessNode.network || 'tcp',
      type: 'none',
      host: '',
      path: '',
      tls: vmessNode.tls ? 'tls' : '',
      sni: vmessNode.sni || vmessNode.servername || '',
    };

    // Transport specifics
    const ws = vmessNode['ws-opts'];
    if (vmessNode.network === 'ws' && ws) {
      link.path = ws.path || '';
      link.host = ws.headers?.Host || '';
    }
    const grpc = vmessNode['grpc-opts'];
    if (vmessNode.network === 'grpc' && grpc) {
      link.path = grpc['grpc-service-name'] || '';
    }
    const h2 = vmessNode['h2-opts'];
    if (vmessNode.network === 'h2' && h2) {
      link.path = h2.path || '';
      link.host = (h2.host || []).join(',');
    }

    if (vmessNode.alpn?.length) link.alpn = vmessNode.alpn.join(',');
    if (vmessNode['client-fingerprint']) link.fp = vmessNode['client-fingerprint'];

    const encoded = base64Encode(JSON.stringify(link));
    return `vmess://${encoded}`;
  }
}
