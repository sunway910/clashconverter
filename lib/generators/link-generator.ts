/**
 * Link generation utility using protocol adapters
 * Converts ProxyNode array to shareable proxy links
 */

import type { ProxyNode } from '../types';
import { ProtocolAdapterRegistry } from '../adapters/protocol-adapter';

/**
 * Convert proxies to proxy links using adapters
 * @param proxies - Array of ProxyNode objects
 * @returns Array of proxy link strings
 */
export function proxiesToLinks(proxies: ProxyNode[]): string[] {
  const links: string[] = [];

  for (const proxy of proxies) {
    const adapter = ProtocolAdapterRegistry.get(proxy.type);
    if (adapter) {
      links.push(adapter.toLink(proxy));
    }
  }

  return links;
}

/**
 * Convert a single proxy to its link format
 * @param proxy - ProxyNode to convert
 * @returns Proxy link string or empty string if unsupported type
 */
export function proxyToLink(proxy: ProxyNode): string {
  const adapter = ProtocolAdapterRegistry.get(proxy.type);
  return adapter ? adapter.toLink(proxy) : '';
}
