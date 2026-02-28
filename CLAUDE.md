# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ClashConverter** is a client-side proxy configuration converter built with Next.js 16. It transforms various proxy protocols (SS, SSR, Vmess, Trojan, Hysteria, VLESS, HTTP, SOCKS5) into Clash YAML or Sing-Box JSON formats.

**Key Design Principle**: Pure frontend static service - user inputs are never stored on backend servers for privacy. All processing happens client-side.

**Task Hook** Execute `pnpm test && pnpm build` after each task item completed, exec `git commit` after `pnpm test && pnpm build`

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
- **Component**: shadcn@latest
- **Validation**: zod v4 for runtime schema validation
- **YAML**: yaml library for YAML parsing/generation

## Architecture

### Path Aliases (configured in tsconfig.json and components.json)
- `@/*` → `./` (root directory)
- `@/components` → Components directory (for shadcn/ui)
- `@/lib` → Library directory

### Component System
- Uses shadcn@latest with RSC (React Server Components) enabled
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
- **Loon** - iOS client, SS/SSR/VMess/Trojan only (INI format)

### Key Implementation Details

#### Core Architecture (`lib/core/`)
- **Factory Pattern**: `FormatFactory` creates appropriate parsers/generators
- **Registry Pattern**: Auto-initializes all supported formats and protocol adapters on startup
- **Base Classes**: `BaseFormatGenerator` provides common functionality
- **Interfaces**: Strict typing with `IFormatParser` and `IFormatGenerator`
- **Error Handling**: Custom error classes with structured error codes

#### Adapter Pattern (`lib/adapters/`)
Each protocol has its own adapter class implementing `IProtocolAdapter`:
- `toClashJson(node)`: Convert ProxyNode to Clash JSON format
- `toSingBoxJson(node)`: Convert ProxyNode to Sing-Box JSON format
- `toLink(node)`: Convert ProxyNode to shareable link

Benefits:
- Clean abstraction for protocol-specific logic
- Consistent interface for all protocols
- Easy to extend with new protocols
- Eliminates code duplication

#### Type System (`lib/types/`)
- **Strong Typing**: Discriminated union types for all 9 protocols (no `[key: string]: any`)
- **Zod Validation**: Runtime schema validation with `validateProxyNode()`, `safeValidateProxyNode()`
- **Type Guards**: Protocol-specific type guards (`isSSProxy`, `isVMessProxy`, etc.)

```typescript
// Type-safe proxy node (discriminated union)
type ProxyNode =
  | SSProxyNode
  | SSRProxyNode
  | VMessProxyNode
  | VLESSProxyNode
  | TrojanProxyNode
  | HysteriaProxyNode
  | Hysteria2ProxyNode
  | HTTPProxyNode
  | SOCKS5ProxyNode;
```

#### Parser Logic (`lib/parsers/`)
- `parseProxyLink()`: Attempts to parse a single link using all protocol parsers
- `parseMultipleProxies()`: Parses multiple lines, returns `{ proxies, unsupported }`
- Uses yaml library for YAML parsing (replaced custom parser)
- Zod validation for all parsed nodes

#### Generator Logic (`lib/generators/`)
- **Clash YAML Generator**: Uses yaml library + adapters for complete Clash YAML output
- **Clash Premium Generator**: Filters out unsupported protocols
- **Sing-Box JSON Generator**: Uses adapters for Sing-Box format
- **Text Generator**: Uses adapters for proxy link generation
- **Loon Generator**: INI format for iOS client

All generators now use protocol adapters via `ProtocolAdapterRegistry` for format conversion.

#### Error Handling (`lib/errors/`)
Custom error class hierarchy:
- `ConverterError` - Base error with error code
- `ParseError` - Parsing errors (invalid format, missing fields, etc.)
- `GenerateError` - Generation errors (serialization, invalid config)
- `UnsupportedProtocolError` - Protocol not supported for format/kernel
- `ValidationError` - Data validation failures (Zod validation)

### Locale Detection
- Uses `middleware.ts` for locale detection
- Detects user country from Cloudflare/Vercel headers: `cf-ipcountry`, `x-vercel-ip-country`
- Redirects Chinese regions (CN, HK, TW, MO, SG) to `/zh`, others to `/en`
- Stores preference in `NEXT_LOCALE` cookie (1 year expiry)

### Kernel Type Selection
Users can choose between:
- **Clash Meta (Mihomo)**: Supports all protocols including VLESS, Hysteria, Hysteria2
- **Clash Premium**: Does NOT support VLESS, Hysteria, Hysteria2 (shows warning toast, filters nodes)
- **Sing-Box**: Supports SS, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP (no SSR/SOCKS5)
- **Loon**: Supports SS, SSR, VMess, Trojan only (no HTTP/SOCKS5)

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

### Type System
- All proxy nodes use discriminated union types - NO `[key: string]: any`
- Use type assertions for backward compatibility: `node as unknown as SpecificType`
- Always validate input with Zod schemas before trusting data

### Adding New Protocol Support
1. Create adapter in `lib/adapters/[protocol]-adapter.ts` implementing `IProtocolAdapter`
2. Add parser function in `lib/parsers/protocol-parsers.ts`
3. Add Zod schema in `lib/types/validators.ts`
4. Add protocol type to `lib/types/proxy-nodes.ts`
5. Register adapter in `lib/core/registry.ts` (in `initializeProtocolAdapters()`)
6. Update type guards in `lib/types/proxy-nodes.ts`
7. Add format example in `messages/en.json` and `messages/zh.json`

### Adding New Output Format
1. Create generator in `lib/generators/[format]-generator.ts`
2. Implement `IFormatGenerator` interface (extend `BaseFormatGenerator`)
3. Add to format registry in `lib/core/registry.ts` (in `initializeFormatRegistry()`)
4. Update `FormatType` in `lib/core/interfaces.ts`
5. Add UI option in converter component
6. Add translations

### Error Handling Best Practices
- Always use custom error classes from `lib/errors/`
- Use `ParseError` for parsing failures
- Use `GenerateError` for generation failures
- Use `UnsupportedProtocolError` for protocol/format incompatibility
- Use `ValidationError` for data validation failures
- Include error context using `detail` parameter

### Common Issues
- **Protocol case sensitivity**: Only lowercase the protocol prefix, preserve base64 casing
- **Hash fragment names**: Always extract `#name` from links for node naming
- **Hysteria types**: hysteria v1 uses `auth`, v2 uses `password`
- **Clash Premium compatibility**: VLESS/Hysteria must be filtered with toast notification
- **Sing-Box compatibility**: SSR/SOCKS5 must be filtered with toast notification
- **YAML parsing**: Using yaml library - ensure valid YAML syntax

### Environment Variables
```bash
# Analytics & Monetization
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX              # Google Analytics
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXX       # Google AdSense
NEXT_PUBLIC_CONTACT_EMAIL=xxx@gmail.com     # Footer contact email

# Feature Flags
NEXT_PUBLIC_ENABLE_DNS_CONFIG=true          # Include DNS in Clash YAML (default: true)
NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER=true   # Show Clash Premium output option (default: true)
NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER=true      # Show Clash Meta output option (default: true)
NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER=true         # Show Sing-Box output option (default: true)
NEXT_PUBLIC_ENABLE_LOON_TRANSFER=true            # Show Loon output option (default: true)
```

### Feature Flags (`lib/features.ts`)
The application supports environment variable-based feature flags to control which conversion formats are displayed in the UI:

- `isFormatEnabled(format)` - Check if a specific format is enabled
- `getEnabledFormats()` - Get list of all enabled formats
- `ENABLED_FORMATS` - Constant object with enablement status

**Usage:**
- Set environment variable to `false` to hide the format option from UI
- Default: All formats are enabled when variables are not set
- Example: `NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER=false` hides Sing-Box conversion option

**IMPORTANT - Environment Variable Loading:**
- Next.js loads environment variables at server startup
- After modifying `.env` file, you **MUST restart the dev server** for changes to take effect
- Run `pnpm dev` again after changing environment variables
- To clear cached values: `rm -rf .next && pnpm dev`

### Testing
Run TypeScript check and tests before committing:
```bash
npx tsc --noEmit
pnpm test
```

## Project Structure (Post-Refactor)

```
lib/
├── core/                    # Core architecture (Factory, Registry, Base Classes)
│   ├── interfaces.ts        # IFormatParser, IFormatGenerator
│   ├── base-generator.ts   # BaseFormatGenerator abstract class
│   ├── factory.ts          # FormatFactory with custom errors
│   ├── converter.ts        # Main conversion orchestrator
│   ├── registry.ts         # Auto-initialization (formats + adapters)
│   └── index.ts
├── types/                  # Type definitions and validation
│   ├── proxy-nodes.ts      # Discriminated union types (9 protocols)
│   ├── validators.ts        # Zod schemas for runtime validation
│   └── types.ts            # Re-exports
├── adapters/               # Protocol adapters (Adapter Pattern)
│   ├── protocol-adapter.ts # IProtocolAdapter interface + Registry
│   ├── ss-adapter.ts
│   ├── ssr-adapter.ts
│   ├── vmess-adapter.ts
│   ├── vless-adapter.ts
│   ├── trojan-adapter.ts
│   ├── hysteria-adapter.ts  # Hysteria + Hysteria2
│   ├── http-adapter.ts
│   └── socks5-adapter.ts
├── generators/             # Output generators
│   ├── link-generator.ts   # Proxy link generation using adapters
│   ├── clash-yaml-generator.ts
│   ├── clash-premium-generator.ts
│   ├── singbox-json-generator.ts
│   ├── loon-generator.ts
│   └── txt-generator.ts
├── parsers/                # Input parsers
│   ├── protocol-parsers.ts # Individual protocol parsers
│   ├── clash-yaml-parser.ts
│   ├── singbox-json-parser.ts
│   ├── txt-parser.ts
│   └── index.ts
├── errors/                 # Custom error classes
│   └── index.ts            # ConverterError, ParseError, etc.
├── clash/                  # Clash-specific modules
│   ├── parser/yaml.ts      # YAML parser using yaml library
│   └── generator/yaml.ts   # YAML generator using yaml library + adapters
├── singbox/                # Sing-Box specific modules
│   ├── parser.ts
│   └── generator.ts
└── loon/                   # Loon specific modules
    ├── loon-generator.ts
    └── config/
```

## SEO Domain

Primary domain: clashconverter.com
