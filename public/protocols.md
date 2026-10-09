# ClashConverter — Protocols

ClashConverter supports 11 proxy protocols for parsing and generation. Trojan links additionally support Trojan-Go extensions (WebSocket / gRPC / h2 transports and `encryption=ss;method;password` relays).

## Supported protocols and share-link syntax

| Protocol | Scheme | Link format |
|---|---|---|
| Shadowsocks (SS) | `ss://` | `ss://base64(method:password@server:port)#name` or SIP002 `ss://base64(method:password)@server:port#name` |
| ShadowsocksR (SSR) | `ssr://` | `ssr://base64(server:port:protocol:method:obfs:base64(password)/?params)#name` |
| VMess | `vmess://` | `vmess://base64(JSON)` where JSON carries `add`, `port`, `id`, `aid`, `scy`, `net`, `tls`, `sni`, `ps` |
| VLESS | `vless://` | `vless://uuid@server:port?type=…&security=tls\|reality&sni=…#name` |
| Trojan | `trojan://` | `trojan://password@server:port?params#name` (params: `type`, `sni`/`peer`, `allowInsecure`, `alpn`, `fp`, `serviceName`) |
| Hysteria | `hysteria://` | `hysteria://server:port?auth=…&upmbps=…&downmbps=…#name` (v1 uses `auth`) |
| Hysteria2 | `hysteria2://` | `hysteria2://password@server:port/?insecure=1&sni=…#name` (v2 uses `password`) |
| HTTP | `http://` / `https://` | `http://user:pass@server:port#name` |
| SOCKS5 | `socks5://` / `socks://` | `socks5://user:pass@server:port#name` |
| WireGuard | `wireguard://` / `wg://` | `wireguard://private-key@server:port?publickey=…&address=…&mtu=…#name` (peer public key required) |
| AnyTLS | `anytls://` | `anytls://password@server:port?sni=…&alpn=…#name` |

## Parsing behavior

- Node names come from the `#name` fragment (URL-decoded); links without one receive the protocol's default name, and duplicates are suffixed (`name_1`, `name_2`, …).
- Base64 payloads are decoded as UTF-8; protocol prefixes are case-insensitive while base64 body casing is preserved.
- Non-ASCII (internationalized) hostnames in `server`, `sni`, `servername`, and WebSocket `Host` fields are automatically converted to Punycode (`中文.com` → `xn--fiq228c.com`), including recovery of percent-encoded hosts produced by URL parsers.
- Telegram proxy links (`https://t.me/socks?…`, `https://t.me/http?…`) are also recognized and parsed as SOCKS5/HTTP nodes.
- Lines starting with `#` are treated as comments and skipped.

## Related documents

- [Index](index.md) — site overview
- [Formats](formats.md) — per-kernel protocol compatibility matrix
- [FAQ](faq.md) — frequently asked questions
- [llms.txt](llms.txt) — documentation index
