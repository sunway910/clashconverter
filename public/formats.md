# ClashConverter — Formats

ClashConverter converts between proxy share links / configuration files and target client formats. Content below reflects the formats actually registered in the converter engine.

## Input formats

| Input | Description |
|---|---|
| Proxy links | One share link per line: `ss://`, `ssr://`, `vmess://`, `vless://`, `trojan://`, `hysteria://`, `hysteria2://`, `tuic://`, `wireguard://`/`wg://`, `anytls://`, `http://`, `socks5://` |
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

| Protocol | Links | Clash Meta | Clash Premium | Sing-Box | Surge 5 | Surfboard | Loon | QuantumultX |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Shadowsocks (SS) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ShadowsocksR (SSR) | ✓ | ✓ | ✓ | ✗ | ✓¹ | ✗ | ✓ | ✓ |
| VMess | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| VLESS | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Trojan (incl. Trojan-Go) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hysteria | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Hysteria2 | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ |
| TUIC v5 | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ |
| HTTP | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| SOCKS5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| WireGuard | ✓ | ✓ | ✓ | ✓ | ✗² | ✗ | ✗ | ✗ |
| AnyTLS | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |

¹ SSR is wrapped as an external `ssr-local` entry (requires the ssr-local binary on the device).
² Surge handles WireGuard through a separate `[WireGuard]` section, which this converter does not generate.

Legend: ✓ supported · ✗ filtered out (with a toast notification naming the dropped nodes)

## Behavior details

- **Clash Meta vs Clash Premium**: Clash Meta (Mihomo) is the actively maintained kernel and supports all modern protocols (VLESS, Hysteria, Hysteria2, TUIC v5, AnyTLS). Clash Premium is the legacy kernel; those protocols are filtered out when it is selected.
- **Sing-Box**: the Sing-Box kernel has no SSR support — SSR nodes are filtered out with a notice instead of being converted.
- **Surge 5**: Hysteria2 requires Surge 5.6+, TUIC v5 and smart policy groups require Surge 5.8+; SSR runs through an external ssr-local entry.
- **Loon**: Hysteria2 and TUIC v5 require Loon 3.1+.
- **Invalid nodes** are dropped during parsing; only valid ones reach the output.
- **Duplicate names** get numeric suffixes (`name_1`, `name_2`, …).
- Feature flags (`NEXT_PUBLIC_ENABLE_*` env vars) can hide individual output formats from the UI; the compatibility matrix above describes the engine, not UI visibility.

## Related documents

- [Index](index.md) — site overview
- [Protocols](protocols.md) — protocol list and URI syntax
- [FAQ](faq.md) — frequently asked questions
- [llms.txt](llms.txt) — documentation index
