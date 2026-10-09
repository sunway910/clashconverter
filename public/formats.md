# ClashConverter — Formats

ClashConverter converts between proxy share links / configuration files and target client formats. Content below reflects the formats actually registered in the converter engine.

## Input formats

| Input | Description |
|---|---|
| Proxy links | One share link per line: `ss://`, `ssr://`, `vmess://`, `vless://`, `trojan://`, `hysteria://`, `hysteria2://`, `wireguard://`/`wg://`, `anytls://`, `http://`, `socks5://` |
| Clash YAML | Complete Clash configuration files (`proxies:` entries), parsed and validated per protocol |
| Sing-Box JSON | `outbounds` entries from Sing-Box JSON configurations |
| Subscription URL | Fetch a remote proxy subscription and convert its content |

## Output formats

| Output | Format | Notes |
|---|---|---|
| Clash Meta (Mihomo) | YAML | Full protocol support, recommended |
| Clash Premium | YAML | Legacy kernel, reduced protocol support |
| Sing-Box | JSON | Full protocol support |
| Loon | INI | iOS client |
| QuantumultX | CONF | iOS client |
| Surfboard | CONF | Android client |
| Proxy links | Text | Shareable URI list, one per line |

## Protocol compatibility matrix

Which protocols survive conversion into each target format (unsupported nodes are filtered out with a warning):

| Protocol | Links | Clash Meta | Clash Premium | Sing-Box | Loon | QuantumultX | Surfboard |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Shadowsocks (SS) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ShadowsocksR (SSR) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| VMess | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| VLESS | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Trojan (incl. Trojan-Go) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hysteria | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Hysteria2 | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| HTTP | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| SOCKS5 | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| WireGuard | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| AnyTLS | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |

Legend: ✓ supported · ✗ filtered out (with a toast notification naming the dropped nodes)

## Behavior details

- **Clash Meta vs Clash Premium**: Clash Meta (Mihomo) is the actively maintained kernel and supports all modern protocols (VLESS, Hysteria, Hysteria2, AnyTLS). Clash Premium is the legacy kernel; those protocols are filtered out when it is selected.
- **Invalid nodes** are dropped during parsing; only valid ones reach the output.
- **Duplicate names** get numeric suffixes (`name_1`, `name_2`, …).
- Feature flags (`NEXT_PUBLIC_ENABLE_*` env vars) can hide individual output formats from the UI; the compatibility matrix above describes the engine, not UI visibility.

## Related documents

- [Index](index.md) — site overview
- [Protocols](protocols.md) — protocol list and URI syntax
- [FAQ](faq.md) — frequently asked questions
- [llms.txt](llms.txt) — documentation index
