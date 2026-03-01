/**
 * TXT format generator (proxy links)
 * Generates plain text proxy links from ProxyNode array
 */

import type { ProxyNode } from '../types';
import type { IFormatGenerator, FormatType } from '../core/interfaces';
import { proxiesToLinks } from './link-generator';

/**
 * Generator for plain text proxy link format
 */
export class TxtGenerator implements IFormatGenerator {
  readonly format: FormatType = 'txt';

  /**
   * Generate plain text proxy links
   * @param proxies - Array of proxy nodes to convert
   * @returns Plain text with one proxy link per line
   */
  generate(proxies: ProxyNode[]): string {
    return proxiesToLinks(proxies).join('\n');
  }

  /**
   * Get the set of protocols supported by TXT format
   * @returns Set of all supported protocol types
   */
  getSupportedProtocols(): Set<string> {
    return new Set(['ss', 'ssr', 'vmess', 'trojan', 'hysteria', 'hysteria2', 'vless', 'http', 'socks5']);
  }

  /**
   * Filter proxies (TXT supports all protocols)
   * @param proxies - All proxy nodes
   * @returns All proxies (no filtering needed)
   */
  filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    return proxies;
  }
}
