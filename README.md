# Clash Converter

A client-side proxy configuration converter that transforms various proxy protocols into Clash YAML or Sing-Box JSON formats. Built with Next.js 16, featuring real-time preview with CodeMirror, multi-language support, and comprehensive SEO optimization.

[![Clash Converter](https://img.shields.io/badge/Clash-Converter-blue)](https://clashconverter.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Features

- **Client-side Processing**: All conversions happen in your browser - your proxy configurations are never sent to any server
- **Multi-Protocol Support**: Supports 9 proxy protocols
  - Shadowsocks (SS)
  - ShadowsocksR (SSR)
  - VMess
  - VLESS
  - Trojan
  - Hysteria / Hysteria2
  - HTTP / HTTPS
  - SOCKS5
  - Telegram SOCKS links
- **Multiple Output Formats**:
  - **Proxy Links** - Shareable URI format
  - **Clash Meta (Mihomo)** - Full protocol support
  - **Clash Premium** - Legacy compatibility
  - **Sing-Box** - Universal proxy platform (JSON)
  - **Loon** - iOS proxy client (INI format)
- **Strong Type System**: Discriminated union types with Zod runtime validation
- **Bidirectional Conversion**: Convert between proxy links, Clash YAML, and Sing-Box JSON
- **CodeMirror Editor**: Full-featured code preview with syntax highlighting for YAML/JSON
- **Protocol Adapters**: Clean adapter pattern eliminates code duplication
- **Protocol-specific Dialogs**: Edit individual proxy nodes with dedicated dialog UI
- **IP-Based Locale Detection**: Automatically detects user location and redirects to appropriate language
- **Multi-Language**: English and Simplified Chinese (简体中文)
- **Theme Support**: Dark/Light mode with system preference detection
- **Resources Page**: Proxy client downloads and installation scripts
- **About Page**: Project information and documentation

## Supported Protocols

| Protocol | Format Example |
|----------|----------------|
| SS | `ss://base64(method:password@server:port)#name` |
| SSR | `ssr://base64#name` |
| VMess | `vmess://base64(json)#name` |
| VLESS | `vless://uuid@server:port?params#name` |
| Trojan | `trojan://password@server:port#name` |
| Hysteria | `hysteria://server:port?params#name` |
| Hysteria2 | `hysteria2://password@server:port/?params#name` |
| HTTP | `http://user:pass@server:port#name` |
| SOCKS5 | `socks5://server:port#name` |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sunway910/clashconverter.git
cd clashconverter

# Install dependencies
pnpm install

# Type Checking
npx tsc --noEmit

# Linting
pnpm run lint

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
pnpm build
pnpm start
```

### Cloudflare Workers Deployment

```bash
# Build for Cloudflare
pnpm build:cf

# Deploy to Cloudflare
pnpm deploy:cf

# Preview locally
pnpm preview
```

## Project Structure

```
clashconverter/
├── app/                      # Next.js App Router
│   ├── [locale]/             # Localized routes
│   │   ├── page.tsx          # Main converter page
│   │   ├── about/            # About page
│   │   └── resources/        # Resources page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── robots.ts             # SEO robots.txt
│   └── sitemap.ts            # SEO sitemap
├── components/               # React components
│   ├── converter.tsx         # Main converter component
│   ├── footer.tsx            # Footer component
│   ├── language-toggle.tsx   # Language selector
│   ├── theme-toggle.tsx      # Theme switcher
│   ├── theme-provider.tsx    # Theme context provider
│   ├── google-analytics.tsx  # GA integration
│   ├── google-adsense.tsx    # AdSense integration
│   ├── preview/              # CodeMirror preview editor
│   ├── dialogs/              # Dialog components
│   ├── seo/                  # SEO components
│   ├── about/                # About page components
│   ├── resources/            # Resources page components
│   └── ui/                   # shadcn/ui components
├── lib/                      # Core utilities
│   ├── core/                 # Core architecture
│   │   ├── interfaces.ts     # Type definitions
│   │   ├── base-generator.ts # Base generator class
│   │   ├── factory.ts        # Factory pattern
│   │   ├── converter.ts      # Main converter
│   │   └── registry.ts       # Format registry
│   ├── types/                # Type definitions
│   │   ├── proxy-nodes.ts    # Discriminated union types
│   │   ├── validators.ts      # Zod schemas
│   │   └── types.ts          # Re-exports
│   ├── adapters/             # Protocol adapters
│   │   ├── protocol-adapter.ts
│   ├── generators/           # Output generators
│   │   ├── link-generator.ts
│   ├── parsers/              # Input parsers
│   ├── clash/                # Clash-specific modules
│   ├── singbox/              # Sing-Box modules
│   ├── loon/                 # Loon modules
│   └── errors/               # Custom error classes
├── messages/                 # next-intl translations
├── middleware.ts             # Locale detection
└── public/                   # Static assets
```

## Technology Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.6+ (strict mode)
- **Styling**: Tailwind CSS v3 with custom configuration
- **Components**: shadcn/ui (New York style, Stone color scheme)
- **Icons**: Lucide React
- **Code Editor**: CodeMirror 6 with YAML/JSON support
- **Internationalization**: next-intl v4
- **Notifications**: Sonner
- **Theme**: next-themes
- **Validation**: Zod v4 for runtime schema validation
- **YAML**: yaml library for YAML parsing/generation
- **Deployment**: @opennextjs/cloudflare for Cloudflare Workers

## Architecture

The converter uses a sophisticated architecture pattern with strong emphasis on type safety and maintainability:

### Core System
- **Factory Pattern**: `FormatFactory` creates parsers and generators
- **Registry Pattern**: Auto-initializes all supported formats and protocol adapters
- **Base Classes**: `BaseFormatGenerator` provides common functionality
- **Interfaces**: Strict typing for `IFormatParser` and `IFormatGenerator`
- **Error Handling**: Custom error classes with structured error codes

### Adapter Pattern
Each protocol has its own adapter class implementing `IProtocolAdapter`:
- `toClashJson(node)`: Convert ProxyNode to Clash JSON format
- `toSingBoxJson(node)`: Convert ProxyNode to Sing-Box JSON format
- `toLink(node)`: Convert ProxyNode to shareable link

**Benefits:**
- Clean abstraction layer for protocol-specific logic
- Easy to add new protocol support
- Centralized protocol handling
- Eliminates code duplication

### Type System
- **Discriminated Union Types**: Strong typing for all 9 protocols (no `[key: string]: any`)
- **Runtime Validation**: Zod schemas for all proxy types
- **Type Guards**: Protocol-specific type guards for safe type narrowing

### Supported Formats
| Format | Input | Output | Notes |
|--------|-------|--------|-------|
| Proxy Links | ✅ | ✅ | Universal URI format |
| Clash Meta | ✅ | ✅ | Full protocol support |
| Clash Premium | ✅ | ✅ | No VLESS/Hysteria/Hysteria2 |
| Sing-Box | ✅ | ✅ | No SSR/SOCKS5 support |
| Loon | ✅ | ✅ | iOS client, SS/SSR/VMess/Trojan only |

## Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google AdSense (optional)
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX

# Contact Email (optional, defaults to clashconverter@gmail.com)
NEXT_PUBLIC_CONTACT_EMAIL=your-email@gmail.com

# DNS Configuration (optional, defaults to true)
# Set to 'false' to disable DNS section in generated Clash YAML
NEXT_PUBLIC_ENABLE_DNS_CONFIG=true
```

### Kernel Compatibility

| Feature | Clash Meta (Mihomo) | Clash Premium | Sing-Box | Loon |
|---------|---------------------|---------------|----------|------|
| VLESS | ✅ | ❌ | ✅ | ❌ |
| Hysteria | ✅ | ❌ | ✅ | ❌ |
| Hysteria2 | ✅ ❌ | ✅ | ❌ |
| VMess | ✅ | ✅ | ✅ | ✅ |
| Trojan | ✅ | ✅ | ✅ | ✅ |
| SS | ✅ | ✅ | ✅ | ✅ |
| SSR | ✅ | ✅ | ❌ | ✅ |
| HTTP | ✅ | ✅ | ✅ | ❌ |
| HTTPS | ✅ | ✅ | ✅ | ❌ |
| SOCKS5 | ✅ | ✅ | ❌ | ❌ |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

---

**Domain**: [clashconverter.com](https://clashconverter.com)
