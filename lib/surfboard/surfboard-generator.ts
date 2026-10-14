/**
 * Surfboard format generator
 * Generates Surfboard configuration from ProxyNode array
 *
 * Surfboard uses Surge-like format with surge_ver = -3 (special identifier for Surfboard)
 * Reference: subconverter implementation
 */

import type { ProxyNode } from '../types';
import type { FormatType } from '../core/interfaces';
import { BaseFormatGenerator } from '../core/base-generator';
import {
  SURFBOARD_GENERAL,
  SURFBOARD_PROXY_GROUPS,
  SURFBOARD_RULES,
  SURFBOARD_BUILTIN_POLICIES,
  type SurfboardProxyGroupConfig,
} from './config/surfboard-config';

/**
 * Generator for Surfboard configuration format
 * Surfboard is an Android proxy client that uses Surge-like format
 *
 * Supported protocols: SS, VMess, Trojan, HTTP, SOCKS5, Hysteria2
 * Not supported: SSR, VLESS, Hysteria (v1)
 */
export class SurfboardGenerator extends BaseFormatGenerator {
  readonly format: FormatType = 'surfboard';

  /**
   * Generate output; groups require at least one node, bail out early when empty
   */
  public generate(proxies: ProxyNode[]): string {
    const filtered = this.filterProxies(proxies);
    if (filtered.length === 0) {
      return '# No proxies supported by Surfboard\n';
    }
    return super.generate(proxies);
  }

  /**
   * Generate the header section ([General], [Proxy])
   * @param proxies - Filtered proxy nodes
   * @returns Header sections
   */
  protected generateHeader(proxies: ProxyNode[]): string {
    const lines: string[] = [];

    // [General] section
    lines.push('[General]');
    lines.push(...SURFBOARD_GENERAL);
    lines.push('');

    // [Proxy] section - proxy nodes
    lines.push('[Proxy]');
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
   * Generate the body section ([Proxy Group])
   * Region groups (filter) expand matching node names generator-side — Surfboard
   * has no policy-regex-filter — and are omitted when no node matches.
   * @param proxies - Filtered proxy nodes
   * @returns Body sections
   */
  protected generateBody(proxies: ProxyNode[]): string {
    const lines: string[] = ['[Proxy Group]'];
    const proxyNames = proxies.map((p) => p.name);

    // Region groups with no matching nodes are omitted
    const omitted = new Set<string>();
    for (const group of SURFBOARD_PROXY_GROUPS) {
      const filter = group.filter;
      if (filter && !proxyNames.some((name) => this.matchesFilter(name, filter))) {
        omitted.add(group.name);
      }
    }

    for (const group of SURFBOARD_PROXY_GROUPS) {
      if (group.filter && omitted.has(group.name)) continue;
      lines.push(...this.formatProxyGroup(group, proxyNames, omitted));
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate the footer section ([Rule])
   * @returns Footer sections
   */
  protected generateFooter(): string {
    const lines: string[] = [];

    // [Rule] section
    lines.push('[Rule]');
    lines.push(...SURFBOARD_RULES);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Filter proxies to only supported protocols for Surfboard
   * Surfboard supports: SS, VMess, Trojan, HTTP, SOCKS5, Hysteria2
   * Surfboard does NOT support: SSR, VLESS, Hysteria (v1)
   * @param proxies - All proxy nodes
   * @returns Filtered proxy nodes
   */
  public filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    const supportedProtocols = new Set(['ss', 'vmess', 'trojan', 'http', 'socks5', 'hysteria2']);
    return proxies.filter((p) => supportedProtocols.has(p.type));
  }

  /**
   * Get the set of protocols supported by Surfboard
   * @returns Set of supported protocol types
   */
  getSupportedProtocols(): Set<string> {
    return new Set(['ss', 'vmess', 'trojan', 'http', 'socks5', 'hysteria2']);
  }

  /**
   * Format a proxy node as a Surfboard proxy string
   * Format: name = protocol,server,port,...params
   *
   * Based on subconverter implementation (surge_ver = -3 for Surfboard):
   * - Shadowsocks: ss, host, port, encrypt-method=method, password=password
   * - VMess: vmess, host, port, username=uuid, tls=true/false, vmess-aead=true/false, ws=true, ws-path=path, ws-headers=Host:host
   * - Trojan: trojan, host, port, password=password, sni=host
   * - HTTP: http, host, port, username=user, password=pass, tls=true/false
   * - SOCKS5: socks5, host, port, username=user, password=pass
   * - Hysteria2: hysteria, host, port, password=password, download-bandwidth=speed
   *
   * @param proxy - The proxy node to format
   * @returns Surfboard formatted proxy string
   */
  private formatProxyNode(proxy: ProxyNode): string {
    const name = proxy.name;
    const params: string[] = [];

    switch (proxy.type) {
      case 'ss': {
        // Shadowsocks: ss, host, port, encrypt-method=method, password=password
        params.push('ss');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`encrypt-method=${proxy.cipher || 'aes-256-gcm'}`);
        params.push(`password=${proxy.password}`);
        break;
      }

      case 'vmess': {
        // VMess: vmess, host, port, username=uuid, tls=true/false, vmess-aead=true/false, ws=true, ws-path=path, ws-headers=Host:host
        const vmessProxy = proxy as any;
        params.push('vmess');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`username=${vmessProxy.uuid}`);

        // TLS
        if (vmessProxy.tls) {
          params.push('tls=true');
        }

        // AEAD
        if (vmessProxy.alterId === 0 || vmessProxy.aead) {
          params.push('vmess-aead=true');
        }

        // WebSocket transport
        const network = vmessProxy.network || 'tcp';
        const wsOpts = vmessProxy['ws-opts'];

        if (network === 'ws') {
          params.push('ws=true');
          if (wsOpts?.path) {
            params.push(`ws-path=${wsOpts.path}`);
          }
          if (wsOpts?.headers?.Host) {
            params.push(`ws-headers=Host:${wsOpts.headers.Host}`);
          }
        }

        // Skip cert verify
        if (vmessProxy['skip-cert-verify']) {
          params.push('skip-cert-verify=true');
        }

        break;
      }

      case 'trojan': {
        // Trojan: trojan, host, port, password=password, sni=host
        const trojanProxy = proxy as any;
        params.push('trojan');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`password=${trojanProxy.password}`);

        // SNI
        if (trojanProxy.sni || trojanProxy.servername) {
          params.push(`sni=${trojanProxy.sni || trojanProxy.servername}`);
        }

        // Skip cert verify
        if (trojanProxy['skip-cert-verify']) {
          params.push('skip-cert-verify=true');
        }

        break;
      }

      case 'http': {
        // HTTP: http, host, port, username=user, password=pass, tls=true/false
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

        // TLS
        if (httpProxy.tls) {
          params.push('tls=true');
        }

        // Skip cert verify
        if (httpProxy['skip-cert-verify']) {
          params.push('skip-cert-verify=true');
        }

        break;
      }

      case 'socks5': {
        // SOCKS5: socks5, host, port, username=user, password=pass
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

        break;
      }

      case 'hysteria2': {
        // Hysteria2: hysteria, host, port, password=password, download-bandwidth=speed
        const hy2Proxy = proxy as any;
        params.push('hysteria');
        params.push(proxy.server);
        params.push(String(proxy.port));
        params.push(`password=${hy2Proxy.password}`);

        // Skip cert verify
        if (hy2Proxy['skip-cert-verify']) {
          params.push('skip-cert-verify=true');
        }

        break;
      }

      default:
        // Unsupported protocol - return empty string
        return '';
    }

    return `${name} = ${params.join(', ')}`;
  }

  /**
   * Check a node name against a group filter regex
   */
  private matchesFilter(name: string, filter: string): boolean {
    try {
      return new RegExp(filter).test(name);
    } catch {
      return false;
    }
  }

  /**
   * Quote a policy name unless it is a built-in policy
   */
  private quotePolicy(name: string): string {
    return SURFBOARD_BUILTIN_POLICIES.has(name) ? name : `"${name}"`;
  }

  /**
   * Format a proxy group as Surge-compatible [Proxy Group] line(s)
   * Format: name = type, "policy1", "policy2", ..., url=..., interval=..., tolerance=...
   *
   * Policy types:
   * - select = Select (manual selection)
   * - url-test = URLTest (auto-select fastest)
   * - fallback = Fallback (use first available)
   * - load-balance = LoadBalance (distribute load)
   *
   * @param group - The proxy group configuration
   * @param proxyNames - List of all proxy names
   * @param omitted - Names of groups skipped in this generation (their references are pruned)
   * @returns Surfboard formatted proxy group lines
   */
  private formatProxyGroup(group: SurfboardProxyGroupConfig, proxyNames: string[], omitted: Set<string>): string[] {
    const lines: string[] = [];
    if (group.commentBefore) {
      lines.push(...group.commentBefore);
    }

    let refs = group.proxies;
    if (group.useAllProxies) refs = [...refs, ...proxyNames];
    if (group.filter) refs = proxyNames.filter((name) => this.matchesFilter(name, group.filter!));
    refs = refs.filter((ref) => !omitted.has(ref));

    const parts: string[] = [group.type, ...refs.map((ref) => this.quotePolicy(ref))];
    if (group.url) parts.push(`url=${group.url}`);
    if (group.interval) parts.push(`interval=${group.interval}`);
    if (group.tolerance) parts.push(`tolerance=${group.tolerance}`);

    lines.push(`${group.name} = ${parts.join(', ')}`);
    return lines;
  }
}
