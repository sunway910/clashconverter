# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ClashConverter** is a client-side proxy configuration converter built with Next.js. It transforms various proxy protocols (SS, SSR, Vmess, Trojan, Hysteria, VLESS, HTTP, SOCKS5) into Clash YAML format.

**Key Design Principle**: Pure frontend static service - user inputs are never stored on backend servers for privacy. All processing happens client-side.

## Development Commands

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start        # Start production server
pnpm run lint     # Run ESLint
```

## Technology Stack

- **Framework**: Next.js 16.1.1 with App Router (React Server Components enabled)
- **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style, Stone color scheme)
- **Language**: TypeScript (strict mode)
- **Icons**: Lucide

## Architecture

### Project Structure
```
app/                    # Next.js App Router directory
├── layout.tsx          # Root layout with Geist Sans/Mono fonts
├── page.tsx            # Main page (currently placeholder)
├── globals.css         # Tailwind v4 + dark mode CSS variables
└── favicon.ico
components.json         # shadcn/ui configuration
```

### Path Aliases (configured in tsconfig.json and components.json)
- `@/*` → `./` (root directory)
- `@/components` → Components directory (for shadcn/ui)
- `@/lib/utils` → Utility functions (for shadcn/ui helpers)
- `@/hooks` → Custom React hooks

### Component System
- Uses shadcn/ui with RSC (React Server Components) enabled
- Style: "new-york" with "stone" base color
- CSS variables enabled for theming (supports dark/light mode)
- When adding shadcn components: use `npx shadcn@latest add <component>`

## Planned Features

1. **Protocol Conversion**: Parse and convert multiple proxy formats to Clash YAML
2. **Preview & Download**: Generate YAML with live preview and download capability
3. **Multi-language**: Simplified Chinese, English, Traditional Chinese
4. **Theme Toggle**: Dark/light mode (defaults to system preference)
5. **SEO**: Optimized for Google traffic
6. **Analytics**: Google AdSense and Google Analytics via environment variables

## Reference Implementation

For the conversion UI and functionality logic: https://v1.v2rayse.com/en/v2ray-clash

## SEO Domain

Primary domain: clashconverter.com
