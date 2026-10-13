/**
 * Surge 5 format generator
 * Generates Surge 5 configuration from ProxyNode array
 *
 * Supported protocols: SS, VMess, SSR (via external ssr-local), Trojan, HTTP
 * Not supported: SOCKS5, VLESS, Hysteria, Hysteria2, WireGuard, AnyTLS
 *
 * Reference: forecho/proxy-config-templates Surge demo
 */

import type { ProxyNode } from '../types';
import type { FormatType } from '../core/interfaces';
import { BaseFormatGenerator } from '../core/base-generator';
import {
  SURGE_GENERAL,
  SURGE_PROXY_GROUPS,
  SURGE_RULES,
  SURGE_URL_REWRITE,
  SURGE_BUILTIN_POLICIES,
  type SurgeProxyGroupConfig,
} from './config/surge-config';

/**
 * Generator for Surge configuration format (Surge 5, smart groups need 5.8+)
 */
export class SurgeGenerator extends BaseFormatGenerator {
  readonly format: FormatType = 'surge';

  private static readonly SUPPORTED_PROTOCOLS = new Set(['ss', 'vmess', 'ssr', 'trojan', 'http']);

  /**
   * Generate output; Surge groups require at least one node, bail out early when empty
   */
  public generate(proxies: ProxyNode[]): string {
    const filtered = this.filterProxies(proxies);
    if (filtered.length === 0) {
      return '# No proxies supported by Surge\n';
    }
    return super.generate(proxies);
  }

  /**
   * Generate the header section ([General], [Proxy])
   */
  protected generateHeader(proxies: ProxyNode[]): string {
    const lines: string[] = ['[General]', ...SURGE_GENERAL, '', '[Proxy]', 'DIRECT = direct'];

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
   */
  protected generateBody(proxies: ProxyNode[]): string {
    const lines: string[] = ['[Proxy Group]'];
    const proxyNames = proxies.map((p) => p.name);

    for (const group of SURGE_PROXY_GROUPS) {
      lines.push(...this.formatProxyGroup(group, proxyNames));
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate the footer section ([Rule], [URL Rewrite])
   */
  protected generateFooter(): string {
    const lines: string[] = ['[Rule]', ...SURGE_RULES, '', '[URL Rewrite]', ...SURGE_URL_REWRITE, ''];
    return lines.join('\n');
  }

  /**
   * Filter proxies to only supported protocols for Surge
   * Supported: SS, VMess, SSR (external), Trojan, HTTP
   */
  public filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    return proxies.filter((p) => SurgeGenerator.SUPPORTED_PROTOCOLS.has(p.type));
  }

  /**
   * Get the set of protocols supported by Surge (in this generator)
   */
  getSupportedProtocols(): Set<string> {
    return new Set(SurgeGenerator.SUPPORTED_PROTOCOLS);
  }

  /**
   * Quote a policy name unless it is a built-in policy
   */
  private quotePolicy(name: string): string {
    return SURGE_BUILTIN_POLICIES.has(name) ? name : `"${name}"`;
  }

  /**
   * Join a [Proxy] line; names containing commas/quotes get wrapped in quotes
   */
  private joinProxyLine(name: string, params: string[]): string {
    const safeName = /[",]/.test(name) ? `"${name.replace(/"/g, '\\"')}"` : name;
    return `${safeName} = ${params.join(',')}`;
  }

  /**
   * Format a proxy node as a Surge [Proxy] line (no spaces after commas)
   */
  private formatProxyNode(proxy: ProxyNode): string {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    switch (proxy.type) {
      case 'ss': {
        const node = proxy as any;
        const params = [
          'ss',
          node.server,
          String(node.port),
          `encrypt-method=${node.cipher || 'aes-256-gcm'}`,
          `password=${node.password}`,
          'tfo=false',
          'udp-relay=false',
        ];
        return this.joinProxyLine(node.name, params);
      }

      case 'vmess': {
        const node = proxy as any;
        const network = node.network || 'tcp';
        const wsOpts = node['ws-opts'];
        const params = [
          'vmess',
          node.server,
          String(node.port),
          `username=${node.uuid}`,
          `tls=${node.tls ? 'true' : 'false'}`,
          `vmess-aead=${node.aead === true ? 'true' : 'false'}`,
          'tls13=false',
        ];
        if (network === 'ws') {
          params.push('ws=true');
          if (wsOpts?.path) params.push(`ws-path=${wsOpts.path}`);
          if (wsOpts?.headers?.Host) params.push(`ws-headers=Host:${wsOpts.headers.Host}`);
        }
        params.push(`sni=${node.sni || node.servername || node.server}`);
        params.push(`skip-cert-verify=${node['skip-cert-verify'] ? 'true' : 'false'}`);
        params.push('tfo=false', 'udp-relay=false');
        return this.joinProxyLine(node.name, params);
      }

      case 'ssr': {
        // SSR has no native Surge support; wrap the ssr-local binary as an external policy
        const node = proxy as any;
        const args: string[] = [];
        const pushArg = (flag: string, value: string | number) => {
          args.push(`args=${flag}`, `args=${value}`);
        };
        pushArg('-l', 1080);
        pushArg('-s', node.server);
        pushArg('-p', node.port);
        pushArg('-m', node.cipher);
        pushArg('-k', node.password);
        pushArg('-o', node.obfs || 'plain');
        pushArg('-O', node.protocol || 'origin');
        const params = [
          'external',
          'exec=/usr/bin/ssr-local',
          ...args,
          'local-port=1080',
          `addresses=${node.server}`,
          'tfo=false',
          'udp-relay=false',
        ];
        return this.joinProxyLine(node.name, params);
      }

      case 'trojan': {
        const node = proxy as any;
        const params = ['trojan', node.server, String(node.port), `password=${node.password}`];
        if (node.sni || node.servername) {
          params.push(`sni=${node.sni || node.servername}`);
        }
        params.push(`skip-cert-verify=${node['skip-cert-verify'] ? 'true' : 'false'}`);
        params.push('tfo=false', 'udp-relay=false');
        return this.joinProxyLine(node.name, params);
      }

      case 'http': {
        const node = proxy as any;
        const params = ['http', node.server, String(node.port)];
        if (node.username) params.push(`username=${node.username}`);
        if (node.password) params.push(`password=${node.password}`);
        if (node.tls) params.push('tls=true');
        if (node['skip-cert-verify']) params.push('skip-cert-verify=true');
        return this.joinProxyLine(node.name, params);
      }

      default:
        return '';
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  /**
   * Format a proxy group as Surge [Proxy Group] line(s)
   * Group refs are quoted unless built-in; smart/url-test groups get
   * policy-regex-filter / interval / timeout / udp-relay params
   */
  private formatProxyGroup(group: SurgeProxyGroupConfig, proxyNames: string[]): string[] {
    const lines: string[] = [];
    if (group.commentBefore) {
      lines.push(...group.commentBefore);
    }

    const refs = (group.useAllProxies ? [...group.proxies, ...proxyNames] : group.proxies).map((ref) =>
      this.quotePolicy(ref)
    );

    const parts: string[] = [group.type, ...refs];
    if (group.policyRegexFilter) parts.push(`policy-regex-filter=${group.policyRegexFilter}`);
    if (group.interval) parts.push(`interval=${group.interval}`);
    if (group.timeout) parts.push(`timeout=${group.timeout}`);
    if (group.udpRelay) parts.push('udp-relay=true');

    lines.push(`${group.name} = ${parts.join(', ')}`);
    return lines;
  }
}
