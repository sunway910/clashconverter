/**
 * Sing-Box JSON format generator
 * Generates Sing-Box JSON configuration from ProxyNode array
 * Does NOT support SSR, SOCKS5
 */

import type { ProxyNode } from '../types';
import type { FormatType } from '../core/interfaces';
import { BaseFormatGenerator } from '../core/base-generator';
import { generateSingBoxConfig } from '../singbox/generator';

/**
 * Generator for Sing-Box JSON format
 * Does NOT support SSR, SOCKS5 (will filter them out)
 */
export class SingBoxJsonGenerator extends BaseFormatGenerator {
  readonly format: FormatType = 'sing-box';

  /**
   * Generate the header section of the JSON output
   * @param proxies - Filtered proxy nodes
   * @returns Empty string (header is part of generateSingBoxConfig)
   */
  protected generateHeader(_proxies: ProxyNode[]): string {
    return '';
  }

  /**
   * Generate the body section (main JSON content)
   * @param proxies - Filtered proxy nodes
   * @returns Complete JSON configuration
   */
  protected generateBody(proxies: ProxyNode[]): string {
    return generateSingBoxConfig(proxies);
  }

  /**
   * Generate the footer section
   * @returns Empty string (footer is part of generateSingBoxConfig)
   */
  protected generateFooter(): string {
    return '';
  }

  /**
   * Filter proxies to exclude unsupported protocols
   * @param proxies - All proxy nodes
   * @returns Filtered proxy nodes (excluding SSR, SOCKS5)
   */
  public filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    const unsupported = new Set(['ssr', 'socks5']);
    return proxies.filter(p => !unsupported.has(p.type));
  }

  /**
   * Get the set of protocols supported by Sing-Box
   * @returns Set of supported protocol types (excludes SSR, SOCKS5)
   */
  getSupportedProtocols(): Set<string> {
    return new Set(['ss', 'vmess', 'vless', 'trojan', 'hysteria', 'hysteria2', 'http']);
  }
}
