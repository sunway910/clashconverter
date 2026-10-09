# ClashConverter — Index

ClashConverter (https://clashconverter.com) is a free online proxy configuration converter. It converts proxy share links and configuration files between formats: proxy links (SS, SSR, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, SOCKS5, WireGuard, AnyTLS) ⇄ Clash Meta (Mihomo) YAML, Clash Premium YAML, Sing-Box JSON, Loon, QuantumultX, and Surfboard configurations.

## Core features

- **Convert proxy links to config files**: paste one share link per line (`ss://`, `ssr://`, `vmess://`, `vless://`, `trojan://`, `hysteria://`, `hysteria2://`, `wireguard://`/`wg://`, `anytls://`, `http://`, `socks5://`), choose an output format, and get a ready-to-use configuration.
- **Convert config files back to links**: paste a Clash YAML or Sing-Box JSON configuration (or switch direction) and extract all proxy nodes as shareable links.
- **Subscription URL input**: fetch and convert a proxy subscription directly from its URL.
- **11 proxy protocols** with per-kernel protocol filtering and toast warnings when nodes must be dropped for a target client.
- **Duplicate node names** are automatically suffixed (`name_1`, `name_2`, …) to keep configurations valid.
- **One-click download or copy** of the generated configuration.

## Quick start

1. Open https://clashconverter.com/
2. Paste proxy links (one per line) into the input box — or paste a Clash YAML / Sing-Box JSON config and use "Swap Direction" to convert back to links.
3. Select the target format: Clash Meta (Mihomo), Clash Premium, Sing-Box, Loon, QuantumultX, or Surfboard.
4. Click convert, then download or copy the generated configuration.

## Privacy model

All parsing, validation, and conversion happen entirely in the browser using client-side JavaScript. Proxy links, server addresses, ports, UUIDs, passwords, and subscription URLs are **never uploaded to, stored on, or logged by any server** — there is no upload step and no backend processing. Closing the tab discards everything. See [privacy.md](privacy.md) for cookies, analytics, and advertising details.

## Project

- Free, no registration, no usage limits.
- Open source: https://github.com/sunway910/clashconverter
- Multilingual: English and Chinese (中文) interfaces.

## Related documents

- [llms.txt](llms.txt) — documentation index for AI agents
- [Formats](formats.md) — input/output formats and kernel compatibility matrix
- [Protocols](protocols.md) — supported protocols and URI syntax
- [FAQ](faq.md) — frequently asked questions
- [Privacy](privacy.md) — privacy policy
- [About](about.md) — project background
- [Advertise](advertise.md) — advertising inquiries
