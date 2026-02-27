/**
 * Clash YAML parser using yaml library
 * Parses Clash YAML configuration to extract proxy nodes
 */

import { parse } from 'yaml';
import { safeValidateProxyNode } from '../../types/validators';

/**
 * Parse Clash YAML to extract proxy nodes
 * @param yaml - YAML string
 * @returns Array of ProxyNode objects
 */
export function parseYamlToProxies(yaml: string): import('../../types').ProxyNode[] {
  try {
    // Parse YAML string to JavaScript object
    const config = parse(yaml);

    // Validate that config is an object
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return [];
    }

    // Extract proxies array from config
    const proxies = (config as any).proxies;

    // Validate proxies is an array
    if (!Array.isArray(proxies)) {
      return [];
    }

    // Validate each proxy and filter out invalid ones
    const validProxies: import('../../types').ProxyNode[] = [];
    for (const proxy of proxies) {
      // Ensure proxy has required fields
      if (!proxy || typeof proxy !== 'object' || !proxy.type || !proxy.name) {
        continue;
      }

      // Validate using zod schema
      const validatedProxy = safeValidateProxyNode(proxy);
      if (validatedProxy) {
        validProxies.push(validatedProxy);
      }
    }

    return validProxies;
  } catch (error) {
    console.error('Failed to parse Clash YAML:', error);
    return [];
  }
}

// Re-export proxiesToLinks from the link-generator module
// This maintains backward compatibility for code that imports from this file
export { proxiesToLinks } from '../../generators/link-generator';
