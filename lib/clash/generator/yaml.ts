/**
 * Clash YAML generator using yaml library and protocol adapters
 * Generates Clash YAML configuration from ProxyNode array
 */

import { stringify } from 'yaml';
import type { ProxyNode } from '../../types';
import { CLASH_RULES } from '../config/rules';
import {
  DNS_CONFIG,
  DNS_CONFIG_META_EXTRA,
  BASIC_CONFIG,
  BASIC_CONFIG_PREMIUM,
  HEADER_BANNER,
  FOOTER_BANNER,
  PROXY_GROUPS_CONFIG,
  RULE_PROVIDERS_CONFIG,
  type ClashKernel,
} from '../config/base';
import { ProtocolAdapterRegistry } from '../../adapters/protocol-adapter';
import { cleanOutput } from '../../adapters/shared';

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
 * @param kernel - Target kernel (meta supports region filtering via include-all)
 * @returns Proxy groups YAML string
 */
function generateProxyGroups(proxyNames: string[], kernel: ClashKernel): string {
  const groups: Record<string, unknown>[] = [];

  // Groups that only exist on the meta kernel (rely on include-all / filter)
  const metaOnlyNames = new Set(
    PROXY_GROUPS_CONFIG.filter(g => g.metaOnly).map(g => g.name)
  );

  for (const group of PROXY_GROUPS_CONFIG) {
    // Region groups rely on mihomo's include-all + filter, unavailable on Premium
    if (kernel === 'premium' && group.metaOnly) continue;

    const groupObj: Record<string, unknown> = {
      name: group.name,
      type: group.type,
    };

    if (group.url) groupObj.url = group.url;
    if (group.interval) groupObj.interval = group.interval;
    if (group.tolerance) groupObj.tolerance = group.tolerance;
    if (kernel === 'meta' && group.filter) groupObj.filter = group.filter;
    if (kernel === 'meta' && group.includeAll) groupObj['include-all'] = true;

    // Start from static proxies, dropping references to groups not emitted on this kernel
    let proxies = group.proxies;
    if (kernel === 'premium') {
      proxies = proxies.filter(name => !metaOnlyNames.has(name));
    }

    // Combine static proxies with all proxies
    if (group.useAllProxies || (kernel === 'premium' && group.premiumUseAllProxies)) {
      proxies = [...proxies, ...proxyNames];
    }
    if (proxies.length > 0) groupObj.proxies = proxies;

    groups.push(groupObj);
  }

  return groups.length > 0 ? '\nproxy-groups:\n' + stringify(groups).split('\n').map(line => '  ' + line).join('\n') : '';
}

/**
 * Generate rule-providers section (remote rulesets)
 * @returns Rule providers YAML string
 */
function generateRuleProviders(): string {
  return '\nrule-providers:\n' + stringify(RULE_PROVIDERS_CONFIG).split('\n').map(line => '  ' + line).join('\n');
}

/**
 * Generate DNS configuration section
 * @param kernel - Target kernel (proxy-server-nameserver is meta-only)
 * @returns DNS configuration YAML string or empty string
 */
function generateDnsConfig(kernel: ClashKernel): string {
  // Check if DNS config is enabled via environment variable
  const enabled = process.env.NEXT_PUBLIC_ENABLE_DNS_CONFIG !== 'false';
  if (!enabled) return '';
  const lines = kernel === 'meta' ? [...DNS_CONFIG, ...DNS_CONFIG_META_EXTRA] : [...DNS_CONFIG];
  return lines.join('\n');
}

/**
 * Generate complete Clash YAML configuration
 * @param proxies - Array of ProxyNode objects
 * @param kernel - Target kernel flavor (meta default)
 * @returns Complete Clash YAML configuration string
 */
export function generateSimpleYaml(proxies: ProxyNode[], kernel: ClashKernel = 'meta'): string {
  if (proxies.length === 0) {
    return '# No proxies found\n';
  }

  const parts: string[] = [];

  // Generate header
  parts.push(...generateHeader(proxies.length));

  // Generate basic configuration
  parts.push(...(kernel === 'premium' ? BASIC_CONFIG_PREMIUM : BASIC_CONFIG));

  // Generate proxies section using adapters - use JSON format for single-line output
  parts.push('proxies:');
  for (const proxy of proxies) {
    // Get adapter for this proxy type
    const adapter = ProtocolAdapterRegistry.get(proxy.type);
    if (adapter) {
      // Use adapter to convert to Clash JSON format, then drop empty values
      const clashJson = cleanOutput(adapter.toClashJson(proxy));
      // Use JSON.stringify for single-line inline format
      parts.push('  - ' + JSON.stringify(clashJson));
    }
  }

  // Generate unique names to avoid duplicates
  const uniqueNames = Array.from(new Set(proxies.map((p) => p.name)));

  // Generate proxy groups
  parts.push(generateProxyGroups(uniqueNames, kernel));

  // Generate rule providers (remote rulesets)
  parts.push(generateRuleProviders());

  // Generate DNS configuration
  parts.push(generateDnsConfig(kernel));

  // Add rules section (Premium core has no REJECT-DROP policy, fall back to REJECT)
  parts.push(kernel === 'premium' ? CLASH_RULES.replace(/REJECT-DROP/g, 'REJECT') : CLASH_RULES);

  return parts.join('\n');
}
