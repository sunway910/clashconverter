# ClashConverter — FAQ

Frequently asked questions about ClashConverter (https://clashconverter.com).

## What is Clash Converter?

Clash Converter is a free online tool that converts proxy share links (SS, SSR, VMess, Trojan, Hysteria, Hysteria2, VLESS, HTTP, SOCKS5, WireGuard, AnyTLS) into Clash Meta (Mihomo), Clash Premium, Sing-Box, Loon, QuantumultX, or Surfboard configuration formats — and converts configurations back into shareable links.

## Is Clash Converter safe to use?

Yes. All conversion happens client-side in your browser. Proxy links, server addresses, credentials, and generated configurations are never uploaded to any server. See [privacy.md](privacy.md) for the full policy.

## Which proxy protocols are supported?

11 protocols: Shadowsocks (SS), ShadowsocksR (SSR), VMess, VLESS, Trojan (including Trojan-Go transports), Hysteria, Hysteria2, HTTP, SOCKS5, WireGuard, and AnyTLS. See [protocols.md](protocols.md) for URI syntax and [formats.md](formats.md) for per-client support.

## What is the difference between Clash Meta and Clash Premium?

Clash Meta (Mihomo) is the actively maintained kernel and supports all modern protocols including VLESS, Hysteria, Hysteria2, and AnyTLS. Clash Premium is the original kernel, no longer maintained; those protocols are filtered out (with a warning) when it is selected.

## How do I convert proxy links to Clash format?

Paste your proxy links (one per line) into the input box — e.g. `ss://base64#name`, `vmess://base64#name` — pick Clash Meta as the output format, click convert, then download or copy the generated YAML.

## Can I convert Clash YAML back to proxy links?

Yes. Use "Swap Direction" to switch the converter direction, then paste a Clash YAML or Sing-Box JSON configuration; all proxy nodes are extracted and emitted as shareable links.

## Does it work with Clash Verge and other clients?

Yes. Generated Clash Meta YAML works with Mihomo-based clients (Clash Verge Rev, Clash Nyanpasu, mihomo party, etc.), Sing-Box JSON with Sing-Box clients, and the Loon / QuantumultX / Surfboard outputs with their respective apps.

## Why should I use this converter?

Comprehensive protocol support (11 protocols), fully in-browser processing for privacy, no registration or usage limits, automatic handling of edge cases (IDN/Punycode hostnames, duplicate names, invalid nodes), and active open-source maintenance.

## Related documents

- [Index](index.md) — site overview
- [Formats](formats.md) — formats and compatibility matrix
- [Protocols](protocols.md) — protocol syntax
- [Privacy](privacy.md) — privacy policy
- [llms.txt](llms.txt) — documentation index
