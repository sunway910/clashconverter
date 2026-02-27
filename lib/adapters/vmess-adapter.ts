/**
 * VMess protocol adapter
 */

import type { ProxyNode, VMessProxyNode } from '../types';
import type { IProtocolAdapter } from './protocol-adapter';

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
      udp: true,
    };

    if (vmessNode.tls !== undefined) obj.tls = vmessNode.tls;
    if (vmessNode['skip-cert-verify'] !== undefined) obj['skip-cert-verify'] = vmessNode['skip-cert-verify'];
    if (vmessNode.servername) obj.servername = vmessNode.servername;

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
      packet_encoding: 'xudp',
      security: vmessNode.cipher || 'auto',
      alter_id: 0,
    };

    if (vmessNode.network === 'ws') {
      obj.transport = { type: 'ws' };
    }

    if (vmessNode.tls || vmessNode.servername) {
      obj.tls = {
        enabled: true,
        ...(vmessNode.servername && { server_name: vmessNode.servername }),
      };
    }

    if (vmessNode['skip-cert-verify']) {
      if (!obj.tls) obj.tls = { enabled: true };
      obj.tls.insecure = vmessNode['skip-cert-verify'];
    }

    return obj;
  }

  toLink(node: ProxyNode): string {
    const vmessNode = node as unknown as VMessProxyNode;

    const jsonStr = `{"v":"2","ps":"${vmessNode.name}","add":"${vmessNode.server}","port":${vmessNode.port},"id":"${vmessNode.uuid}","aid":${vmessNode.alterId || 0},"scy":"${vmessNode.cipher || 'auto'}","net":"${vmessNode.network || 'tcp'}","tls":"${vmessNode.tls ? 'tls' : ''}"}`;
    const encoded = btoa(jsonStr);
    return `vmess://${encoded}`;
  }
}
