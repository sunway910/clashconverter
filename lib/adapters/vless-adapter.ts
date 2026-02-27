/**
 * VLESS protocol adapter
 */

import type { ProxyNode, VLESSProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';

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

    if (vlessNode.tls || vlessNode.servername) {
      obj.tls = {
        enabled: true,
        ...(vlessNode.servername && { server_name: vlessNode.servername }),
      };
    }

    if (vlessNode['reality-opts']) {
      if (!obj.tls) obj.tls = { enabled: true };
      obj.tls.reality = {
        enabled: true,
        public_key: vlessNode['reality-opts']['public-key'] || '',
        short_id: vlessNode['reality-opts']['short-id'] || '',
      };
    }

    if (vlessNode['skip-cert-verify']) {
      if (!obj.tls) obj.tls = { enabled: true };
      obj.tls.insecure = vlessNode['skip-cert-verify'];
    }

    return obj;
  }

  toLink(node: ProxyNode): string {
    const vlessNode = node as unknown as VLESSProxyNode;

    let link = `vless://${vlessNode.uuid}@${vlessNode.server}:${vlessNode.port}`;
    const params: string[] = [];
    params.push(`security=${vlessNode.tls ? 'tls' : 'none'}`);
    params.push(`type=${vlessNode.network || 'tcp'}`);
    params.push('encryption=none');
    if (vlessNode.flow && vlessNode.flow !== '') params.push(`flow=${vlessNode.flow}`);
    if (vlessNode.network === 'tcp' || !vlessNode.flow || vlessNode.flow === '') params.push('headerType=none');
    if (vlessNode.sni) params.push(`sni=${encodeURIComponent(vlessNode.sni)}`);
    if (vlessNode['skip-cert-verify']) params.push('allowInsecure=1');
    if (params.length) link += `?${params.join('&')}`;
    link += `#${encodeURIComponent(vlessNode.name)}`;
    return link;
  }
}
