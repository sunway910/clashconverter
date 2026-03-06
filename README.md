# Clash Converter

A client-side proxy configuration converter that transforms various proxy protocols into Clash YAML or Sing-Box JSON formats.

[![Clash Converter](https://img.shields.io/badge/Clash-Converter-blue)](https://clashconverter.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Features

- **Client-side Processing**: All conversions happen in your browser - no server involved
- **9 Proxy Protocols**: SS, SSR, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, SOCKS5
- **Multiple Output Formats**: Clash Meta, Clash Premium, Sing-Box, Loon
- **Bidirectional Conversion**: Proxy links ↔ Clash YAML ↔ Sing-Box JSON
- **Multi-Language**: English & 简体中文
- **Dark/Light Theme**: System preference detection

## Quick Start

```bash
# Clone and install
git clone https://github.com/sunway910/clashconverter.git
cd clashconverter
pnpm install

# Development
pnpm dev

# Production build
pnpm build

# Cloudflare Workers
pnpm build:cf && pnpm deploy:cf
```

## Environment Variables

Create `.env.local`:

```bash
# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXX

# Optional: Contact email
NEXT_PUBLIC_CONTACT_EMAIL=your-email@gmail.com

# Feature flags (default: true)
NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER=true
NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER=true
NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER=true
NEXT_PUBLIC_ENABLE_LOON_TRANSFER=true
```

## Project Structure

```
clashconverter/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/              # Core utilities
│   ├── core/         # Factory & Registry patterns
│   ├── adapters/     # Protocol adapters
│   ├── generators/   # Output generators
│   ├── parsers/      # Input parsers
│   └── types/        # Type definitions
├── messages/         # i18n translations
└── public/           # Static assets
```

## Architecture

- **Factory Pattern**: `FormatFactory` creates parsers/generators
- **Adapter Pattern**: Clean protocol-specific logic abstraction
- **Type Safety**: Discriminated union types + Zod runtime validation
- **Error Handling**: Custom error classes with structured codes

## License

MIT License - see [LICENSE](LICENSE) for details.


## Support

Domain: [clashconverter.com](https://clashconverter.com)
