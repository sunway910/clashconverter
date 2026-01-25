# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ClashConverter** is a client-side proxy configuration converter built with Next.js 16. It transforms various proxy protocols (SS, SSR, Vmess, Trojan, Hysteria, VLESS, HTTP, SOCKS5) into Clash YAML or Sing-Box JSON formats.

**Key Design Principle**: Pure frontend static service - user inputs are never stored on backend servers for privacy. All processing happens client-side.

## Development Commands

```bash
pnpm dev      # Start development server on port 3000
pnpm build    # Build for production
pnpm start    # Start production server
pnpm run lint # Run ESLint
npx tsc --noEmit # TypeScript type check

# Cloudflare deployment
pnpm build:cf # Build for Cloudflare Workers
pnpm deploy:cf # Deploy to Cloudflare
pnpm preview   # Preview Cloudflare build locally
```

## Technology Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5.6+ (strict mode)
- **Styling**: Tailwind CSS v3 with shadcn/ui components
- **Icons**: Lucide React
- **Code Editor**: CodeMirror 6 with YAML/JSON language support
- **Internationalization**: next-intl v4
- **Notifications**: Sonner (toast)
- **Theme**: next-themes
- **Deployment**: @opennextjs/cloudflare for Cloudflare Workers

## Architecture

### Project Structure
```
app/                      # Next.js App Router directory
├── [locale]/             # Localized routes (en, zh)
│   ├── page.tsx          # Main converter page
│   ├── about/            # About page with SEO metadata
│   ├── resources/        # Resources page with downloads
│   └── layout.tsx        # Locale-specific layout (fonts, providers)
├── layout.tsx            # Root layout (minimal wrapper)
├── globals.css           # Tailwind v3 + dark mode CSS variables
├── sitemap.ts            # Dynamic sitemap generation
└── robots.ts             # SEO robots.txt

components/               # React components
├── converter.tsx         # Main converter component
├── footer.tsx            # Footer with copyright & contact
├── language-toggle.tsx   # Language selector (Select)
├── theme-toggle.tsx      # Theme switcher (dark/light)
├── theme-provider.tsx    # Theme context provider
├── google-analytics.tsx  # GA integration
├── google-adsense.tsx    # AdSense integration
├── preview/              # CodeMirror preview editor
│   └── preview-editor.tsx
├── dialogs/              # Dialog components
│   └── client-dialog.tsx
├── seo/                  # SEO components
│   └── seo-head.tsx      # Dynamic metadata & structured data
├── about/                # About page components
│   └── about-content.tsx
├── resources/            # Resources page components
│   └── resources-content.tsx
└── ui/                   # shadcn/ui components
    ├── button.tsx
    ├── textarea.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── select.tsx
    ├── hover-card.tsx
    └── accordion.tsx

lib/                      # Core utilities
├── core/                 # Core architecture (NEW)
│   ├── interfaces.ts     # IFormatParser, IFormatGenerator
│   ├── base-generator.ts # Base class for generators
│   ├── factory.ts        # FormatFactory for parsers/generators
│   ├── converter.ts      # Main conversion orchestrator
│   ├── registry.ts       # Auto-initializes supported formats
│   └── index.ts
├── adapters/             # Protocol adapters (NEW)
│   ├── protocol-adapter.ts
│   ├── ss-adapter.ts
│   ├── ssr-adapter.ts
│   ├── vmess-adapter.ts
│   ├── vless-adapter.ts
│   ├── trojan-adapter.ts
│   ├── hysteria-adapter.ts
│   ├── http-adapter.ts
│   ├── socks5-adapter.ts
│   └── index.ts
├── parsers/              # Input format parsers
│   ├── index.ts          # Parser orchestration
│   ├── protocol-parsers.ts # Individual protocol parsers
│   ├── clash-yaml-parser.ts
│   ├── singbox-json-parser.ts
│   └── txt-parser.ts
├── generators/           # Output format generators
│   ├── index.ts
│   ├── clash-yaml-generator.ts
│   ├── clash-premium-generator.ts
│   ├── singbox-json-generator.ts
│   └── txt-generator.ts
├── clash/                # Clash-specific modules
│   ├── config/
│   │   ├── dns.ts        # DNS configuration
│   │   └── rules.ts      # Clash routing rules
│   ├── generator/
│   │   └── yaml.ts       # Clash YAML generator
│   └── parser/
│       └── yaml.ts       # Clash YAML parser
├── singbox/              # Sing-Box specific modules
│   ├── generator.ts      # Sing-Box JSON generator
│   └── parser.ts         # Sing-Box JSON parser
├── types.ts              # TypeScript interfaces
├── utils.ts              # Utility functions
└── seo.ts                # SEO utilities & structured data

messages/                 # next-intl translation files
├── en.json               # English translations
└── zh.json               # Simplified Chinese translations

middleware.ts             # Locale detection middleware (not proxy.ts)
i18n.ts                   # next-intl configuration
```

### Path Aliases (configured in tsconfig.json and components.json)
- `@/*` → `./` (root directory)
- `@/components` → Components directory (for shadcn/ui)
- `@/lib` → Library directory

### Component System
- Uses shadcn/ui with RSC (React Server Components) enabled
- Style: "new-york" with "stone" base color
- CSS variables enabled for theming (supports dark/light mode)
- When adding shadcn components: use `npx shadcn@latest add <component>`

## Core Features

### Protocol Support
The app supports 9 proxy protocols:
1. **SS** (Shadowsocks) - `ss://base64#name`
2. **SSR** (ShadowsocksR) - `ssr://base64#name`
3. **VMess** - `vmess://base64(json)#name`
4. **VLESS** - `vless://uuid@server:port?params#name`
5. **Trojan** - `trojan://password@server:port#name`
6. **Hysteria** - `hysteria://server:port?params#name`
7. **Hysteria2** - `hysteria2://password@server:port/?params#name`
8. **HTTP** - `http://user:pass@server:port#name`
9. **SOCKS5** - `socks5://server:port#name`

### Format Support

#### Input Formats
- **Proxy Links** - URI format (ss://, vmess://, etc.)
- **Clash YAML** - Complete configuration files
- **Sing-Box JSON** - JSON configuration format

#### Output Formats
- **Proxy Links** - Shareable URI format
- **Clash Meta (Mihomo)** - Full protocol support
- **Clash Premium** - Limited protocol support (no VLESS/Hysteria)
- **Sing-Box JSON** - No SSR/SOCKS5 support

### Key Implementation Details

#### Core Architecture (`lib/core/`)
- **Factory Pattern**: `FormatFactory` creates appropriate parsers/generators
- **Registry Pattern**: Auto-initializes all supported formats on startup
- **Base Classes**: `BaseFormatGenerator` provides common functionality
- **Interfaces**: Strict typing with `IFormatParser` and `IFormatGenerator`

#### Adapter Pattern (`lib/adapters/`)
Each protocol has its own adapter class:
- Clean abstraction for protocol-specific logic
- Consistent interface for all protocols
- Easy to extend with new protocols

#### Parser Logic (`lib/parsers/`)
- `parseProxyLink()`: Attempts to parse a single link using all protocol parsers
- `parseMultipleProxies()`: Parses multiple lines, returns `{ proxies, unsupported }`
- Protocol case handling: Only the protocol prefix is lowercased; base64 content preserves original casing
- Unsupported protocols trigger error toasts via Sonner

#### Generator Logic (`lib/generators/`)
- **Clash YAML Generator**: Generates complete Clash YAML with DNS, proxy groups, rules
- **Clash Premium Generator**: Filters out unsupported protocols (VLESS, Hysteria, Hysteria2)
- **Sing-Box JSON Generator**: Generates Sing-Box configuration (filters SSR/SOCKS5)
- **Text Generator**: Converts proxy nodes back to shareable links

#### Type System (`lib/types.ts`)
```typescript
type ProxyType = 'ss' | 'ssr' | 'vmess' | 'trojan' | 'hysteria' | 'hysteria2' | 'vless' | 'http' | 'socks5';
type FormatType = 'txt' | 'clash-meta' | 'clash-premium' | 'sing-box';

interface ProxyNode {
  name: string;
  type: ProxyType;
  server: string;
  port: number;
  [key: string]: any; // Protocol-specific fields
}

interface ParseResult {
  proxies: ProxyNode[];
  unsupported: string[];
  filteredCounts: Record<string, number>;
}

interface ConversionResult {
  output: string;
  filteredCounts: Record<string, number>;
  unsupported: string[];
  isJson: boolean;
}
```

### Locale Detection
- Uses `middleware.ts` for locale detection (not proxy.ts - that was old pattern)
- Detects user country from Cloudflare/Vercel headers: `cf-ipcountry`, `x-vercel-ip-country`
- Redirects Chinese regions (CN, HK, TW, MO, SG) to `/zh`, others to `/en`
- Stores preference in `NEXT_LOCALE` cookie (1 year expiry)

### Kernel Type Selection
Users can choose between:
- **Clash Meta (Mihomo)**: Supports all protocols including VLESS, Hysteria, Hysteria2
- **Clash Premium**: Does NOT support VLESS, Hysteria, Hysteria2 (shows warning toast, filters nodes)
- **Sing-Box**: Supports SS, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP (no SSR/SOCKS5)

### CodeMirror Integration
- Full-featured code editor with syntax highlighting
- YAML and JSON language support
- Used for output preview

### SEO Implementation
- **Dynamic metadata**: Each page has `generateMetadata()` function
- **Structured data**: JSON-LD schemas for SoftwareApplication, FAQPage, HowTo, etc.
- **Hreflang**: Proper multilingual SEO support
- **Sitemap**: Dynamic generation with locale support
- **114+ keywords**: Comprehensive keyword targeting

## Important Notes for Development

### Adding New Protocol Support
1. Create adapter in `lib/adapters/[protocol]-adapter.ts`
2. Add parser function in `lib/parsers/protocol-parsers.ts`
3. Add to parsers array in `lib/parsers/index.ts`
4. Add link generator in `lib/generators/txt-generator.ts`
5. Update `ProxyType` in `lib/types.ts`
6. Add format example in `messages/en.json` and `messages/zh.json`
7. Update kernel compatibility checks

### Adding New Output Format
1. Create generator in `lib/generators/[format]-generator.ts`
2. Implement `IFormatGenerator` interface
3. Add to format registry in `lib/core/registry.ts`
4. Update `FormatType` in `lib/core/interfaces.ts`
5. Add UI option in converter component
6. Add translations

### Common Issues
- **Protocol case sensitivity**: Only lowercase the protocol prefix, preserve base64 casing
- **Hash fragment names**: Always extract `#name` from links for node naming
- **Hysteria types**: hysteria v1 uses `auth`, v2 uses `password`
- **Clash Premium compatibility**: VLESS/Hysteria must be filtered with toast notification
- **Sing-Box compatibility**: SSR/SOCKS5 must be filtered with toast notification

### Environment Variables
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX              # Google Analytics
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXX       # Google AdSense
NEXT_PUBLIC_CONTACT_EMAIL=xxx@gmail.com     # Footer contact email
NEXT_PUBLIC_ENABLE_DNS_CONFIG=true          # Include DNS in Clash YAML
```

### Testing
Run TypeScript check before committing:
```bash
npx tsc --noEmit
```

## SEO Domain

Primary domain: clashconverter.com

## Page-Specific Notes

### Main Page (`app/[locale]/page.tsx`)
- Uses converter component with state management
- SEO content component with FAQ and features

### About Page (`app/[locale]/about/page.tsx`)
- Has dedicated `generateMetadata()` function
- Uses `AboutContent` component
- ProfilePage schema for structured data

### Resources Page (`app/[locale]/resources/page.tsx`)
- Has dedicated `generateMetadata()` function
- Uses `ResourcesContent` component
- CollectionPage schema for structured data
- Links to client downloads and installation scripts

## Deployment

### Standard Deployment
```bash
pnpm build
pnpm start
```

### Cloudflare Workers
```bash
pnpm build:cf
pnpm deploy:cf
```

Uses `@opennextjs/cloudflare` for seamless deployment to Cloudflare Pages/Workers.
