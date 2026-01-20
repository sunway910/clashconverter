import { ParsedProxy, ProxyNode } from '../types';
import { parseSS, parseSSR, parseVmess, parseTrojan, parseHysteria, parseHysteria2, parseVless, parseHttp, parseSocks5, parseTelegramLink } from './protocol-parsers';

// js-set-map-lookups: Use Set for O(1) protocol lookups instead of Array.includes()
const KNOWN_PROTOCOLS = new Set(['ss', 'ssr', 'vmess', 'trojan', 'hysteria', 'hysteria2', 'vless', 'http', 'https', 'socks', 'socks5']);

// js-set-map-lookups: Use Set for O(1) supported protocol lookups
const SUPPORTED_PROTOCOLS = new Set(['ss', 'ssr', 'vmess', 'trojan', 'hysteria', 'hysteria2', 'vless', 'http', 'https', 'socks', 'socks5']);

// js-hoist-regexp: Hoist RegExp outside function for reuse
const TELEGRAM_LINK_REGEX = /^https:\/\/t\.me\/(socks|http)/;

// Helper function to check if a link is a Telegram proxy link
function isTelegramLink(link: string): boolean {
  return TELEGRAM_LINK_REGEX.test(link);
}

export function parseProxyLink(link: string): ParsedProxy | null {
  link = link.trim();
  if (!link) return null;

  // Check protocol prefix (case-insensitive) but keep original casing for base64 content
  const protocol = link.split(':')[0].toLowerCase();
  const hasKnownProtocol = KNOWN_PROTOCOLS.has(protocol);

  // If it has a known protocol, only lowercase the protocol part
  if (hasKnownProtocol && link.includes('://')) {
    const protocolEnd = link.indexOf('://');
    link = link.substring(0, protocolEnd).toLowerCase() + link.substring(protocolEnd);
  }

  // Try Telegram links first before regular HTTP/HTTPS
  if (isTelegramLink(link)) {
    const result = parseTelegramLink(link);
    if (result) return result;
  }

  // Try each parser
  const parsers = [
    parseSS,
    parseSSR,
    parseVmess,
    parseTrojan,
    parseHysteria2,
    parseHysteria,
    parseVless,
    parseHttp,
    parseSocks5,
  ];

  for (const parser of parsers) {
    const result = parser(link);
    if (result) return result;
  }

  return null;
}

export function parseMultipleProxies(input: string): { proxies: ProxyNode[]; unsupported: string[] } {
  const lines = input.split(/[\r\n]+/).filter(line => line.trim());
  const proxies: ProxyNode[] = [];
  const unsupported: string[] = [];

  // Track name occurrences for duplicate handling
  const nameCount = new Map<string, number>();
  // Counter for default names
  let defaultNameCounter = 0;

  // Default protocol names that should use defaultName_X format
  const defaultProtocolNames = new Set(['SS', 'SSR', 'Vmess', 'Trojan', 'Hysteria', 'Hysteria2', 'VLESS', 'HTTP', 'SOCKS5', 'Telegram']);

  for (const line of lines) {
    const result = parseProxyLink(line);
    if (result) {
      const config = result.config;
      const originalName = config.name;

      // Check if this is a default protocol name
      if (defaultProtocolNames.has(originalName)) {
        // Use defaultName_X format
        defaultNameCounter++;
        config.name = `defaultName_${defaultNameCounter}`;
      } else {
        // Handle user-provided names
        // First occurrence keeps original name (but adds _1 per expected output)
        // Wait, looking at expected output more carefully:
        // - v2rayse_test -> v2rayse_test_1 (first occurrence)
        // - v2rayse_test -> v2rayse_test_2 (second occurrence)
        // - test -> test (unique name, no suffix)
        // - Hys-1.2.3.4 -> Hys-1.2.3.4 (unique name, no suffix)

        // So the logic is:
        // - For names that appear multiple times: first gets _1, second gets _2, etc.
        // - For names that appear only once: no suffix

        // We need to count all occurrences first, then add suffixes
        const count = nameCount.get(originalName) || 0;
        nameCount.set(originalName, count + 1);
        config.name = originalName; // Keep original for now, will add suffixes later
      }

      proxies.push(config);
    } else {
      // Check if it looks like a proxy link (has ://) but failed to parse
      if (line.includes('://')) {
        const protocol = line.split(':')[0].toLowerCase().trim();
        // js-set-map-lookups: Use Set.has() for O(1) lookup instead of Array.includes()
        if (protocol && !SUPPORTED_PROTOCOLS.has(protocol)) {
          unsupported.push(protocol);
        }
      }
    }
  }

  // Second pass: add suffixes for duplicate names
  const occurrenceCount = new Map<string, number>();
  for (const proxy of proxies) {
    const originalName = proxy.name;
    if (defaultProtocolNames.has(originalName)) {
      // Already has defaultName_X format
      continue;
    }

    const totalCount = nameCount.get(originalName) || 0;
    if (totalCount > 1) {
      // This name appears multiple times, add suffix
      const count = occurrenceCount.get(originalName) || 0;
      occurrenceCount.set(originalName, count + 1);
      proxy.name = `${originalName}_${count + 1}`;
    }
    // If totalCount == 1, keep original name without suffix
  }

  return { proxies, unsupported };
}
