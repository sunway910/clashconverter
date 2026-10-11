/**
 * SSRF guard for server-side URL fetching.
 *
 * Borrowed threat model from urlclash-converter's fetch helper: the
 * server-side subscription relay (/api/subscription) must not be usable
 * as a probe against internal networks, so loopback / private /
 * link-local targets are rejected.
 *
 * Scope note: this checks IP literals and well-known hostnames
 * synchronously. Hostnames that RESOLVE to private addresses (DNS
 * rebinding) are not covered here — deploying on edge runtimes without
 * reachable private networks (e.g. Cloudflare Workers) is the primary
 * mitigation for that vector.
 */

/** Hostnames that always refer to the local machine */
const BLOCKED_HOSTNAMES = new Set(['localhost', 'ip6-localhost', 'ip6-loopback']);

/** Hostname suffixes used by local/private networks */
const BLOCKED_HOST_SUFFIXES = ['.local', '.localhost', '.internal', '.lan', '.home.arpa'];

/** Blocked IPv4 ranges as [network, CIDR prefix] pairs */
const BLOCKED_IPV4_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x00000000, 8], // 0.0.0.0/8        "this network"
  [0x0a000000, 8], // 10.0.0.0/8       private
  [0x7f000000, 8], // 127.0.0.0/8      loopback
  [0x64400000, 10], // 100.64.0.0/10    CGNAT (RFC 6598)
  [0xa9fe0000, 16], // 169.254.0.0/16   link-local (incl. cloud metadata endpoint)
  [0xac100000, 12], // 172.16.0.0/12    private
  [0xc0a80000, 16], // 192.168.0.0/16   private
  [0xffffffff, 32], // 255.255.255.255  broadcast
];

/**
 * Parse a dotted-quad IPv4 address into a 32-bit number (null if invalid)
 */
function ipv4ToNumber(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }
  return value;
}

/**
 * Convert a 32-bit number into dotted-quad form
 */
function numberToIpv4(value: number): string {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff].join('.');
}

/**
 * Check a dotted-quad IPv4 address against the blocked ranges
 */
function isBlockedIPv4(ip: string): boolean {
  const value = ipv4ToNumber(ip);
  if (value === null) return false;
  return BLOCKED_IPV4_RANGES.some(([network, prefix]) => {
    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    return (value & mask) === (network & mask);
  });
}

/**
 * Check an IPv6 literal (brackets and zone already stripped):
 * loopback, link-local (fe80::/10) and unique-local (fc00::/7).
 * IPv4-mapped addresses (::ffff:a.b.c.d) go through the IPv4 table.
 */
function isBlockedIPv6(host: string): boolean {
  const lower = host.toLowerCase();
  if (lower === '::' || lower === '::1') return true;

  const mapped = lower.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isBlockedIPv4(mapped[1]);

  if (/^fe[89ab]/.test(lower)) return true;
  if (/^f[cd]/.test(lower)) return true;

  return false;
}

/**
 * Check a URL hostname against loopback / private / link-local targets.
 * Accepts bare hostnames or URL.hostname values (brackets and IPv6 zone
 * identifiers are stripped).
 */
export function isBlockedSubscriptionHost(hostname: string): boolean {
  const host = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/%[0-9a-z]+$/, ''); // IPv6 zone id suffix (fe80::1%25eth0)

  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;

  if (host.includes(':')) return isBlockedIPv6(host);
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return isBlockedIPv4(host);

  // WHATWG URL normalizes decimal/hex IPv4 spellings to dotted quad, but
  // stay defensive about bare-number hosts
  if (/^\d+$/.test(host)) {
    const value = Number(host);
    if (Number.isInteger(value) && value <= 0xffffffff) {
      return isBlockedIPv4(numberToIpv4(value));
    }
    return true; // absurd numeric host — block conservatively
  }

  return false;
}

/**
 * Convenience wrapper for URL objects
 */
export function isBlockedSubscriptionUrl(url: URL): boolean {
  return isBlockedSubscriptionHost(url.hostname);
}
