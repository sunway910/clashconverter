/**
 * QuantumultX format generator
 * Generates QuantumultX configuration from ProxyNode array
 */

import type { ProxyNode } from '../types';
import type { FormatType } from '../core/interfaces';
import { BaseFormatGenerator } from '../core/base-generator';
import {
  QUANX_GENERAL,
  QUANX_DNS,
  QUANX_REMOTE_RULES,
  QUANX_RULES,
  QUANX_PROXY_GROUPS,
  type QuanxProxyGroupConfig,
} from './config/quantumultx-config';

/**
 * Generator for QuantumultX configuration format
 * QuantumultX is an iOS proxy client with specific configuration format
 *
 * Supported protocols: SS, SSR, VMess, Trojan, HTTP, SOCKS5
 * Not supported: VLESS, Hysteria, Hysteria2
 */
export class QuanxGenerator extends BaseFormatGenerator {
  readonly format: FormatType = 'quantumultx';

  /**
   * Generate the header section ([general], [dns], [server_local])
   * @param proxies - Filtered proxy nodes
   * @returns Header sections
   */
  protected generateHeader(proxies: ProxyNode[]): string {
    const lines: string[] = [];

    // [general] section
    lines.push('[general]');
    lines.push(...QUANX_GENERAL);
    lines.push('');

    // [dns] section
    lines.push('[dns]');
    lines.push(...QUANX_DNS);
    lines.push('');

    // [server_local] section - proxy nodes
    lines.push('[server_local]');
    for (const proxy of proxies) {
      const formatted = this.formatProxyNode(proxy);
      if (formatted) {
        lines.push(formatted);
      }
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate the body section ([policy], [filter_remote], [filter_local])
   * @param proxies - Filtered proxy nodes
   * @returns Body sections
   */
  protected generateBody(proxies: ProxyNode[]): string {
    const lines: string[] = [];
    const proxyNames = proxies.map((p) => p.name);

    // [policy] section - proxy groups
    lines.push('[policy]');
    for (const group of QUANX_PROXY_GROUPS) {
      const groupLine = this.formatProxyGroup(group, proxyNames);
      lines.push(groupLine);
    }
    lines.push('');

    // [filter_remote] section
    lines.push('[filter_remote]');
    lines.push(...QUANX_REMOTE_RULES);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate the footer section ([filter_local])
   * @returns Footer sections
   */
  protected generateFooter(): string {
    const lines: string[] = [];

    // [filter_local] section
    lines.push('[filter_local]');
    lines.push(...QUANX_RULES);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Filter proxies to only supported protocols for QuantumultX
   * QuantumultX supports: SS, SSR, VMess, Trojan, HTTP, SOCKS5
   * QuantumultX does NOT support: VLESS, Hysteria, Hysteria2
   * @param proxies - All proxy nodes
   * @returns Filtered proxy nodes
   */
  public filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    const supportedProtocols = new Set(['ss', 'ssr', 'vmess', 'trojan', 'http', 'socks5']);
    return proxies.filter((p) => supportedProtocols.has(p.type));
  }

  /**
   * Get the set of protocols supported by QuantumultX
   * @returns Set of supported protocol types
   */
  getSupportedProtocols(): Set<string> {
    return new Set(['ss', 'ssr', 'vmess', 'trojan', 'http', 'socks5']);
  }

  /**
   * Format a proxy node as a QuantumultX proxy string
   * Format: name = protocol,server,port,...params
   *
   * Based on subconverter implementation:
   * - VMess: vmess = host:port, method=method, password=uuid, obfs=ws/wss, obfs-host=host, obfs-uri=path, tls13=true/false, tag=name
   * - Shadowsocks: shadowsocks = host:port, method=method, password=password, obfs=ws/wss, obfs-host=host, obfs-uri=path, tag=name
   * - ShadowsocksR: shadowsocks = host:port, method=method, password=password, ssr-protocol=protocol, ssr-protocol-param=param, obfs=obfs, obfs-host=obfsparam, tag=name
   * - Trojan: trojan = host:port, password=password, over-tls=true/false, tls-host=host, tls13=true/false, tag=name
   * - HTTP: http = host:port, username=user, password=pass, over-tls=true/false, tag=name
   * - SOCKS5: socks5 = host:port, username=user, password=pass, over-tls=true/false, tag=name
   *
   * @param proxy - The proxy node to format
   * @returns QuantumultX formatted proxy string
   */
  private formatProxyNode(proxy: ProxyNode): string {
    const name = proxy.name;
    const params: string[] = [];

    switch (proxy.type) {
      case 'ss':
        // Shadowsocks: name = shadowsocks, host, port, method=password
        params.push('shadowsocks');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`${proxy.cipher || 'aes-256-gcm'}=${proxy.password}`);
        break;

      case 'ssr': {
        // ShadowsocksR: name = shadowsocks, host, port, method=password, ssr-protocol=protocol, ssr-protocol-param=, obfs=obfs, obfs-host=, tag=name
        const ssrProxy = proxy as any;
        params.push('shadowsocks');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`${proxy.cipher || 'none'}=${proxy.password}`);
        params.push(`ssr-protocol=${ssrProxy.protocol || 'origin'}`);
        params.push('ssr-protocol-param=');
        params.push(`obfs=${ssrProxy.obfs || 'plain'}`);
        params.push('obfs-host=');
        params.push(`tag=${name}`);
        break;
      }

      case 'vmess': {
        // VMess: name = vmess, host, port, method=method, password=uuid, obfs=ws/wss, obfs-host=host, obfs-uri=path, tls13=true/false, tag=name
        const vmessProxy = proxy as any;
        params.push('vmess');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`method=${vmessProxy.cipher || 'auto'}`);
        params.push(`password=${vmessProxy.uuid}`);

        // Handle transport (ws/wss)
        const network = vmessProxy.network || 'tcp';
        const wsOpts = vmessProxy['ws-opts'];

        if (network === 'ws') {
          if (vmessProxy.tls) {
            params.push('obfs=wss');
            params.push('tls13=true');
          } else {
            params.push('obfs=ws');
          }

          if (wsOpts) {
            if (wsOpts.headers?.Host) {
              params.push(`obfs-host=${wsOpts.headers.Host}`);
            }
            if (wsOpts.path) {
              params.push(`obfs-uri=${wsOpts.path}`);
            }
          }
        }

        // AEAD
        if (vmessProxy.alterId === 0 || vmessProxy.aead) {
          params.push('aead=true');
        }

        params.push(`tag=${name}`);
        break;
      }

      case 'trojan': {
        // Trojan: name = trojan, host, port, password=password, over-tls=true/false, tls-host=host, tls13=true/false, tag=name
        const trojanProxy = proxy as any;
        params.push('trojan');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`password=${trojanProxy.password}`);

        // TLS settings
        if (trojanProxy.sni || trojanProxy.servername) {
          params.push('over-tls=true');
          params.push(`tls-host=${trojanProxy.sni || trojanProxy.servername}`);
          params.push('tls13=true');
        }

        // Skip cert verify
        if (trojanProxy['skip-cert-verify']) {
          params.push('tls-verification=false');
        }

        params.push(`tag=${name}`);
        break;
      }

      case 'http': {
        // HTTP: name = http, host, port, username=user, password=pass, over-tls=true/false, tag=name
        const httpProxy = proxy as any;
        params.push('http');
        params.push(proxy.server);
        params.push(String(proxy.port));

        if (httpProxy.username) {
          params.push(`username=${httpProxy.username}`);
        }
        if (httpProxy.password) {
          params.push(`password=${httpProxy.password}`);
        }

        // HTTPS (over-tls)
        if (httpProxy.tls) {
          params.push('over-tls=true');
          params.push('tls13=true');
        }

        if (httpProxy['skip-cert-verify']) {
          params.push('tls-verification=false');
        }

        params.push(`tag=${name}`);
        break;
      }

      case 'socks5': {
        // SOCKS5: name = socks5, host, port, username=user, password=pass, over-tls=true/false, tag=name
        const socksProxy = proxy as any;
        params.push('socks5');
        params.push(proxy.server);
        params.push(String(proxy.port));

        if (socksProxy.username) {
          params.push(`username=${socksProxy.username}`);
        }
        if (socksProxy.password) {
          params.push(`password=${socksProxy.password}`);
        }

        // SOCKS5 over TLS
        if (socksProxy.tls) {
          params.push('over-tls=true');
          params.push('tls13=true');
        }

        params.push(`tag=${name}`);
        break;
      }

      default:
        // Unsupported protocol - return empty string
        return '';
    }

    return `${name} = ${params.join(', ')}`;
  }

  /**
   * Format a proxy group as a QuantumultX policy string
   * Format: name = type,proxy1,proxy2,...,img-url=...
   *
   * Policy types:
   * - static = Select (manual selection)
   * - url-latency-benchmark = URLTest (auto-select fastest)
   * - available = Fallback (use first available)
   * - round-robin = LoadBalance (distribute load)
   *
   * @param group - The proxy group configuration
   * @param proxyNames - List of all proxy names
   * @returns QuantumultX formatted policy string
   */
  private formatProxyGroup(group: QuanxProxyGroupConfig, proxyNames: string[]): string {
    let result = `${group.name} = ${group.type}`;

    // Add proxies
    const allProxies = group.useAllProxies ? [...group.proxies, ...proxyNames] : group.proxies;
    if (allProxies.length > 0) {
      result += ',' + allProxies.join(',');
    }

    // Add url and interval for url-latency-benchmark type
    if (group.type === 'url-latency-benchmark') {
      if (group.url) {
        result += `,url=${group.url}`;
      }
      if (group.interval) {
        result += `,interval=${group.interval}`;
      }
      if (group.tolerance) {
        result += `,tolerance=${group.tolerance}`;
      }
    }

    // Add img-url if present
    if (group.img) {
      result += `,img-url=${group.img}`;
    }

    return result;
  }
}
