/**
 * Clash Premium YAML format generator
 * Generates Clash Premium YAML configuration from ProxyNode array
 * Does NOT support VLESS, Hysteria, Hysteria2
 */

import type { ProxyNode } from '../types';
import type { FormatType } from '../core/interfaces';
import { ClashYamlGenerator } from './clash-yaml-generator';

/**
 * Generator for Clash Premium YAML format
 * Does NOT support VLESS, Hysteria, Hysteria2 (will filter them out)
 */
export class ClashPremiumGenerator extends ClashYamlGenerator {
  readonly format: FormatType = 'clash-premium';

  /**
   * Protocols not supported by Clash Premium
   */
  private static readonly UNSUPPORTED_PROTOCOLS = new Set(['vless', 'hysteria', 'hysteria2']);

  /**
   * Filter proxies to exclude unsupported protocols
   * @param proxies - All proxy nodes
   * @returns Filtered proxy nodes (excluding VLESS, Hysteria, Hysteria2)
   */
  public filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    return proxies.filter(p => !ClashPremiumGenerator.UNSUPPORTED_PROTOCOLS.has(p.type));
  }

  /**
   * Get the set of protocols supported by Clash Premium
   * @returns Set of supported protocol types (excludes VLESS, Hysteria, Hysteria2)
   */
  getSupportedProtocols(): Set<string> {
    return new Set(['ss', 'ssr', 'vmess', 'trojan', 'http', 'socks5']);
  }
}
