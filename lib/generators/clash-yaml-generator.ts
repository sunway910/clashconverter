/**
 * Clash YAML format generator (Meta)
 * Generates Clash Meta YAML configuration from ProxyNode array
 */

import type { ProxyNode } from '../types';
import type { FormatType } from '../core/interfaces';
import { BaseFormatGenerator } from '../core/base-generator';
import { generateSimpleYaml } from '../clash/generator/yaml';

/**
 * Generator for Clash Meta YAML format
 * Supports all protocols including VLESS, Hysteria, Hysteria2
 */
export class ClashYamlGenerator extends BaseFormatGenerator {
  readonly format: FormatType = 'clash-meta';

  /**
   * Generate the header section of the YAML output
   * @param proxies - Filtered proxy nodes
   * @returns Empty string (header is part of generateSimpleYaml)
   */
  protected generateHeader(_proxies: ProxyNode[]): string {
    return '';
  }

  /**
   * Generate the body section (main YAML content)
   * @param proxies - Filtered proxy nodes
   * @returns Complete YAML configuration
   */
  protected generateBody(proxies: ProxyNode[]): string {
    return generateSimpleYaml(proxies);
  }

  /**
   * Generate the footer section
   * @returns Empty string (footer is part of generateSimpleYaml)
   */
  protected generateFooter(): string {
    return '';
  }

  /**
   * Filter proxies (Clash Meta supports all protocols)
   * @param proxies - All proxy nodes
   * @returns All proxies (no filtering needed)
   */
  public filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    return proxies;
  }

  /**
   * Get the set of protocols supported by Clash Meta
   * @returns Set of all supported protocol types
   */
  getSupportedProtocols(): Set<string> {
    return new Set(['ss', 'ssr', 'vmess', 'trojan', 'hysteria', 'hysteria2', 'vless', 'http', 'socks5']);
  }
}
