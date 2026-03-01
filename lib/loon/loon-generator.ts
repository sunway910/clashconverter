/**
 * Loon format generator
 * Generates Loon configuration from ProxyNode array
 */

import type { ProxyNode } from '../types';
import type { FormatType } from '../core/interfaces';
import { BaseFormatGenerator } from '../core/base-generator';
import {
  LOON_GENERAL,
  LOON_REMOTE_RULES,
  LOON_RULES,
  LOON_SCRIPTS,
  LOON_MITM,
  LOON_REMOTE_PROXY,
  LOON_REMOTE_FILTER,
  LOON_REWRITE,
  LOON_HOST,
  LOON_PROXY_GROUPS,
  type LoonProxyGroupConfig,
} from './config/loon-config';

/**
 * Generator for Loon configuration format
 * Loon is an iOS proxy client with specific configuration format
 */
export class LoonGenerator extends BaseFormatGenerator {
  readonly format: FormatType = 'loon';

  /**
   * Generate the header section ([General] and [Proxy])
   * @param proxies - Filtered proxy nodes
   * @returns Header and Proxy sections
   */
  protected generateHeader(proxies: ProxyNode[]): string {
    const lines: string[] = [];

    // [General] section
    lines.push('[General]');
    lines.push(...LOON_GENERAL);
    lines.push('');

    // [Proxy] section
    lines.push('[Proxy]');
    for (const proxy of proxies) {
      lines.push(this.formatProxyNode(proxy));
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate the body section ([Remote Proxy] to [Script])
   * @param proxies - Filtered proxy nodes
   * @returns Body sections
   */
  protected generateBody(proxies: ProxyNode[]): string {
    const lines: string[] = [];
    const proxyNames = proxies.map((p) => p.name);

    // [Remote Proxy]
    lines.push('[Remote Proxy]');
    if (LOON_REMOTE_PROXY) {
      lines.push(LOON_REMOTE_PROXY);
    }
    lines.push('');

    // [Remote Filter]
    lines.push('[Remote Filter]');
    if (LOON_REMOTE_FILTER) {
      lines.push(LOON_REMOTE_FILTER);
    }
    lines.push('');

    // [Proxy Group] section
    lines.push('[Proxy Group]');
    for (const group of LOON_PROXY_GROUPS) {
      const groupLine = this.formatProxyGroup(group, proxyNames);
      lines.push(groupLine);
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate the footer section ([Rule] to [MITM])
   * @returns Footer sections
   */
  protected generateFooter(): string {
    const lines: string[] = [];

    // [Rule] section
    lines.push('[Rule]');
    lines.push(...LOON_RULES);
    lines.push('');

    // [Remote Rule] section
    lines.push('[Remote Rule]');
    lines.push(...LOON_REMOTE_RULES);
    lines.push('');

    // [Rewrite] section
    lines.push('[Rewrite]');
    if (LOON_REWRITE) {
      lines.push(LOON_REWRITE);
    }
    lines.push('');

    // [Host] section
    lines.push('[Host]');
    if (LOON_HOST) {
      lines.push(LOON_HOST);
    }
    lines.push('');

    // [Script] section
    lines.push('[Script]');
    lines.push(...LOON_SCRIPTS);
    lines.push('');

    // [MITM] section
    lines.push('[MITM]');
    lines.push(...LOON_MITM);

    return lines.join('\n');
  }

  /**
   * Filter proxies to only supported protocols for Loon
   * Loon supports: SS, SSR, VMess, Trojan
   * Loon does NOT support: Hysteria, Hysteria2, VLESS, HTTP, HTTPS, SOCKS5
   * @param proxies - All proxy nodes
   * @returns Filtered proxy nodes
   */
  public filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    const supportedProtocols = new Set(['ss', 'ssr', 'vmess', 'trojan']);
    return proxies.filter((p) => supportedProtocols.has(p.type));
  }

  /**
   * Get the set of protocols supported by Loon
   * @returns Set of supported protocol types
   */
  getSupportedProtocols(): Set<string> {
    return new Set(['ss', 'ssr', 'vmess', 'trojan']);
  }

  /**
   * Format a proxy node as a Loon proxy string
   * Format: name = Protocol,server,port,...params
   * @param proxy - The proxy node to format
   * @returns Loon formatted proxy string
   */
  private formatProxyNode(proxy: ProxyNode): string {
    const name = proxy.name;
    const params: string[] = [];

    switch (proxy.type) {
      case 'ss':
        // Shadowsocks: name = Shadowsocks,server,port,method,password
        params.push('Shadowsocks');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(proxy.cipher || 'aes-256-gcm');
        params.push(`"${proxy.password}"`);
        break;

      case 'ssr':
        // ShadowsocksR: name = ShadowsocksR,server,port,method,password,protocol=...,protocol-param=...,obfs=...,obfs-param=
        params.push('ShadowsocksR');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(proxy.cipher || 'none');
        params.push(`"${proxy.password}"`);
        params.push(`protocol=${proxy.protocol || 'origin'}`);
        params.push('protocol-param=');
        params.push(`obfs=${proxy.obfs || 'plain'}`);
        params.push('obfs-param=');
        break;

      case 'vmess':
        // vmess: name = vmess,server,port,cipher,uuid,over-tls=...,transport=...,path=...,host=...,skip-cert-verify=...
        params.push('vmess');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push((proxy as any).cipher || 'auto');
        params.push(`"${(proxy as any).uuid}"`);
        params.push(`over-tls=${(proxy as any).tls ? 'true' : 'false'}`);
        params.push(`transport=${(proxy as any).network || 'tcp'}`);
        params.push(`path=${(proxy as any)['ws-opts']?.path || '/'}`);
        params.push(`host=${(proxy as any)['ws-opts']?.headers?.Host || ''}`);
        params.push(`skip-cert-verify=${(proxy as any)['skip-cert-verify'] ? 'true' : 'false'}`);
        break;

      case 'trojan':
        // trojan: name = trojan,server,port,password,skip-cert-verify=...
        params.push('trojan');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`"${(proxy as any).password}"`);
        params.push(`skip-cert-verify=${(proxy as any)['skip-cert-verify'] ? 'true' : 'false'}`);
        break;

      default:
        // Unsupported protocol - return empty string
        return '';
    }

    return `${name} = ${params.join(',')}`;
  }

  /**
   * Format a proxy group as a Loon proxy group string
   * Format: name = type,proxy1,proxy2,...,img-url=...
   * @param group - The proxy group configuration
   * @param proxyNames - List of all proxy names
   * @returns Loon formatted proxy group string
   */
  private formatProxyGroup(group: LoonProxyGroupConfig, proxyNames: string[]): string {
    let result = `${group.name} = ${group.type}`;

    // Add proxies
    const allProxies = group.useAllProxies ? [...group.proxies, ...proxyNames] : group.proxies;
    if (allProxies.length > 0) {
      result += ',' + allProxies.join(',');
    }

    // Add img-url if present
    if (group.img) {
      result += `,img-url=${group.img}`;
    }

    return result;
  }
}
