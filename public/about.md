# ClashConverter — About

ClashConverter (https://clashconverter.com) is a free, open-source, client-side proxy configuration converter. Its mission: make proxy configuration conversion fast, private, and accurate — with no accounts, no uploads, and no usage limits.

## Open source & maintenance

ClashConverter is developed and maintained in the open by [@sunway910](https://github.com/sunway910). The complete source code — parsers, generators, adapters, and this website — lives at https://github.com/sunway910/clashconverter, where release notes are published in the repository's CHANGELOG. Anyone can audit exactly how data is handled, file bug reports, or self-host the tool.

Protocol support tracks the ecosystem: when a new protocol variant or transport gains adoption, the parsers and adapters are updated (most recently WireGuard and AnyTLS, plus Trojan-Go transport support for Trojan links). Feature and protocol requests are welcome through GitHub Issues or the contact page (https://clashconverter.com/en/contact).

## Technical shape (useful for agents)

- Next.js App Router application; the converter engine is pure TypeScript with no backend processing of user data.
- Engine architecture: protocol parsers (`lib/parsers/`), per-protocol adapters (`lib/adapters/`), format generators (`lib/generators/`), zod-validated discriminated-union types (`lib/types/`), and a format registry (`lib/core/registry.ts`) that registers every input parser and output generator.
- Internationalized (English / Chinese) via next-intl, with locale negotiated by country/`NEXT_LOCALE` cookie.

## Related documents

- [Index](index.md) — site overview
- [Formats](formats.md) — formats and compatibility matrix
- [Protocols](protocols.md) — supported protocols
- [Privacy](privacy.md) — privacy policy summary
- [Advertise](advertise.md) — advertising inquiries
- [llms.txt](llms.txt) — documentation index
