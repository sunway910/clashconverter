/**
 * Clash YAML generator using yaml library and protocol adapters
 * Generates Clash YAML configuration from ProxyNode array
 */

import { stringify } from 'yaml';
import type { ProxyNode } from '../../types';
import { CLASH_RULES } from '../config/rules';
import {
  DNS_CONFIG,
  BASIC_CONFIG,
  HEADER_BANNER,
  FOOTER_BANNER,
  PROXY_GROUPS_CONFIG,
} from '../config/dns';
import { ProtocolAdapterRegistry } from '../../adapters/protocol-adapter';

/**
 * Generate header banner with metadata
 * @param nodeCount - Number of proxy nodes
 * @returns Header string array
 */
function generateHeader(nodeCount: number): string[] {
  const now = new Date();
  const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const lines: string[] = [];
  lines.push(...HEADER_BANNER);
  lines.push(`#  create_time：${createTime}`);
  lines.push(`#  node num：${nodeCount}`);
  lines.push(...FOOTER_BANNER);
  return lines;
}

/**
 * Generate proxy groups section
 * @param proxyNames - Array of proxy names
 * @returns Proxy groups YAML string
 */
function generateProxyGroups(proxyNames: string[]): string {
  const groups: Record<string, unknown>[] = [];

  for (const group of PROXY_GROUPS_CONFIG) {
    const groupObj: Record<string, unknown> = {
      name: group.name,
      type: group.type,
    };

    if (group.url) groupObj.url = group.url;
    if (group.interval) groupObj.interval = group.interval;
    if (group.tolerance) groupObj.tolerance = group.tolerance;

    // Combine static proxies with all proxies if useAllProxies is true
    const allProxies = group.useAllProxies ? [...group.proxies, ...proxyNames] : group.proxies;
    groupObj.proxies = allProxies;

    groups.push(groupObj);
  }

  return groups.length > 0 ? '\nproxy-groups:\n' + stringify(groups).split('\n').map(line => '  ' + line).join('\n') : '';
}

/**
 * Generate DNS configuration section
 * @returns DNS configuration YAML string or empty string
 */
function generateDnsConfig(): string {
  // Check if DNS config is enabled via environment variable
  const enabled = process.env.NEXT_PUBLIC_ENABLE_DNS_CONFIG !== 'false';
  return enabled ? '\n' + DNS_CONFIG.join('\n') : '';
}

/**
 * Generate complete Clash YAML configuration
 * @param proxies - Array of ProxyNode objects
 * @returns Complete Clash YAML configuration string
 */
export function generateSimpleYaml(proxies: ProxyNode[]): string {
  if (proxies.length === 0) {
    return '# No proxies found\n';
  }

  const parts: string[] = [];

  // Generate header
  parts.push(...generateHeader(proxies.length));

  // Generate basic configuration
  parts.push(...BASIC_CONFIG);

  // Generate proxies section using adapters - use JSON format for single-line output
  parts.push('proxies:');
  for (const proxy of proxies) {
    // Get adapter for this proxy type
    const adapter = ProtocolAdapterRegistry.get(proxy.type);
    if (adapter) {
      // Use adapter to convert to Clash JSON format
      const clashJson = adapter.toClashJson(proxy);
      // Use JSON.stringify for single-line inline format
      parts.push('  - ' + JSON.stringify(clashJson));
    }
  }

  // Generate unique names to avoid duplicates
  const uniqueNames = Array.from(new Set(proxies.map((p) => p.name)));

  // Generate proxy groups
  parts.push(generateProxyGroups(uniqueNames));

  // Generate DNS configuration
  parts.push(generateDnsConfig());

  // Add rules section
  parts.push(CLASH_RULES);

  return parts.join('\n');
}
