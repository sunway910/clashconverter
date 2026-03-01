# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-03-01

### Added
- **Feature Flags System**: Environment variable control for output format visibility
  - `isFormatEnabled()` function to check format enablement status
  - `getEnabledFormats()` and `getEnabledFormatsMap()` utility functions
  - Unit tests with comprehensive coverage for all scenarios
- **Integration Tests**: End-to-end tests for all output formats
  - Clash Meta integration tests
  - Clash Premium integration tests
  - Sing-Box integration tests
  - Loon integration tests
  - Test helpers for fixture loading and YAML/JSON comparison
- **Test Infrastructure**
  - Vitest configuration with path alias support
  - Test fixture directories for each format
  - Comparison utilities for order-insensitive YAML/JSON validation

### Refactored
- **Generator Interface**: Added `filterProxies()` method to `IFormatGenerator`
  - Enables external filtering of proxy nodes by format
  - Supports testing of format-specific protocol filtering
  - Changed visibility from `protected` to `public` in all generators
- **next.config.ts**: Simplified configuration
  - Removed redundant `loadEnvFile()` function
  - Next.js now auto-loads `.env` files natively
  - Reduced configuration by 40+ lines

### Removed
- **Debug Utilities**
  - Removed `/debug-env` page (no longer needed)
  - Removed `/api/test-env` route (no longer needed)
- **Old Test Fixtures**
  - Removed `test/clash/` directory (reorganized to format-specific directories)

### Fixed
- Removed Turbopack workaround that was no longer necessary
- Next.js native `.env` loading works correctly without custom implementation

### Technical
- **New Directories**
  - `test/integration/` - Integration test suite
  - `test/clash-meta/` - Clash Meta test fixtures
  - `test/clash-premium/` - Clash Premium test fixtures
  - `test/sing-box/` - Sing-Box test fixtures
  - `test/loon/` - Loon test fixtures
- **New Files**
  - `lib/__tests__/features.test.ts` - Feature flags unit tests
  - `lib/__tests__/features-runtime.test.ts` - Runtime behavior tests
  - `test/integration/helpers/` - Test helper utilities
- **Dependencies**: No new dependencies added

## [1.2.0] - 2025-02-26

### Added
- **Custom Error Class Hierarchy**: Structured error handling with error codes
  - `ConverterError` base class with `ErrorCode` enum
  - `ParseError` for parsing failures
  - `GenerateError` for generation failures
  - `UnsupportedProtocolError` for protocol/format incompatibility
  - `ValidationError` for Zod validation failures
  - Each error includes `code`, `detail`, and optional `format` fields
- **Discriminated Union Types**: Strong typing for all 9 proxy protocols
  - Separate interfaces for each protocol type (SS, SSR, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, SOCKS5)
  - Removed `[key: string]: any` index signature for true type safety
  - Type guards for safe type narrowing
- **Zod Runtime Validation**: Runtime schema validation for TypeScript types
  - Zod schemas for all 9 proxy protocols
  - `validateProxyNode()` function for runtime validation
  - Integration with discriminated union types
- **YAML Library Integration**: Replaced hand-written YAML parser with `yaml` npm package
  - More robust YAML parsing and generation
  - Better support for complex YAML structures
  - Improved error messages for invalid YAML
- **Protocol Adapter Pattern**: Clean abstraction for protocol-specific logic
  - `IProtocolAdapter` interface with `toClashJson()`, `toSingBoxJson()`, `toLink()` methods
  - Protocol adapter registry for dynamic adapter lookup
  - Centralized link generation via `link-generator.ts`
  - Eliminates code duplication across generators
- **Module Structure Improvements**
  - `lib/types/` directory for type definitions
  - `lib/adapters/` directory for protocol adapters
  - `lib/errors/` directory for error classes
  - `lib/generators/` directory for output generators

### Refactored
- **Type System** (`lib/types/proxy-nodes.ts`)
  - Migrated from generic `ProxyNode` interface to discriminated union types
  - Each protocol has dedicated interface with specific fields
  - Type assertions pattern: `node as unknown as SpecificType`
- **Error Handling** (Project-wide)
  - All parsers now throw `ParseError` instead of generic `Error`
  - All generators now throw `GenerateError` or `UnsupportedProtocolError`
  - Validators throw `ValidationError` for schema validation failures
  - Consistent error messages with error codes and details
- **YAML Parser** (`lib/clash/parser/yaml.ts`)
  - Complete rewrite using `yaml` library
  - Removed 100+ lines of hand-written parsing logic
  - Better handling of edge cases and invalid input
- **Generators** (Project-wide)
  - `txt-generator.ts` now uses adapters via `link-generator.ts`
  - `clash/generator/yaml.ts` uses adapters for Clash JSON conversion
  - `singbox/generator.ts` uses adapters for Sing-Box JSON conversion
  - Eliminated duplicate protocol-specific code
- **Protocol Adapters** (`lib/adapters/`)
  - Each protocol has dedicated adapter class
  - Consistent interface for all format conversions
  - Easy to extend with new protocol support

### Technical
- **Dependencies Added**
  - `zod`: Runtime type validation
  - `yaml`: YAML parsing and generation
- **New Files**
  - `lib/errors/index.ts`: Error class hierarchy
  - `lib/types/proxy-nodes.ts`: Discriminated union types
  - `lib/types/validators.ts`: Zod validation schemas
  - `lib/generators/link-generator.ts`: Centralized link generation
- **Updated Files**
  - All generator files to use adapter pattern
  - All parser files to use custom error classes
  - `lib/types.ts` to re-export from new module structure
  - `lib/core/registry.ts` to register protocol adapters

### Developer Experience
- **Type Safety**: Improved IDE autocompletion and error detection
- **Debugging**: Structured error codes make issues easier to diagnose
- **Extensibility**: Clear patterns for adding new protocols/formats
- **Maintainability**: Reduced code duplication through adapter pattern

### Fixed
- Type safety issues with generic `[key: string]: any` signature
- Error message consistency across the codebase
- Code duplication in protocol-specific conversion logic

## [1.1.0] - 2026-02-01

### Added
- **Loon Format Support**: Convert proxy configurations to Loon .conf format
  - Full INI-style configuration with [General], [Proxy], [Proxy Group], [Rule], [Remote Rule] sections
  - Support for SS, SSR, VMess, and Trojan protocols
  - Automatic proxy group generation with optimized routing rules
  - Comprehensive rule set with ACL4SSR rulesets
  - MITM configuration empty by default (can be customized by users)
- **Protocol Filtering Notifications**: Toast notifications when nodes are filtered due to format incompatibility
  - Clash Premium: VLESS, Hysteria, Hysteria2 filtered with warnings
  - Sing-Box: SSR, SOCKS5 filtered with warnings
  - Loon: HTTP, HTTPS, SOCKS5, VLESS, Hysteria, Hysteria2 filtered with warnings

### Enhanced
- **Parser Improvements**
  - HTTP parser now correctly skips Telegram links to prevent conflicts
  - Better handling of edge cases in protocol detection
- **Loon Generator**
  - Extended BaseFormatGenerator with Loon-specific configuration
  - Automatic proxy name deduplication and formatting
  - Optimized rule sets for Chinese and international traffic

### Technical
- Added `lib/loon/` directory with Loon-specific generator and configuration
- Implemented `LoonGenerator` class extending `BaseFormatGenerator`
- Created ACL4SSR-based rule configuration with remote rule support
- Added format registry support for Loon format

### Fixed
- HTTP parser conflict with Telegram SOCKS links (both start with `https://`)
- Toast notification state management for filtered protocol counts

## [1.0.0] - 2026-01-25

### Added
- Footer component with copyright and contact email
- Environment variable support for contact email configuration
- Environment variable control for DNS configuration in Clash YAML output
- About page with project information
- Resources page with proxy client downloads and installation scripts
- Sing-Box format support (input and output)
- MIT License for open-source distribution
- CHANGELOG.md for version tracking

### Enhanced
- **SEO Optimization**
  - Page-specific metadata for About and Resources pages
  - 114+ targeted keywords for better search ranking
  - Structured data: SoftwareApplication, FAQPage, HowTo, AggregateRating, ProfilePage, CollectionPage
  - Enhanced sitemap with all pages and proper locale support
  - Long-tail keyword coverage for better organic traffic
- **Architecture**
  - Core architecture with Factory/Registry patterns
  - Protocol adapter pattern for clean abstraction
  - Comprehensive type definitions and interfaces

### Fixed
- Sitemap format issue (lastModified property name)
- Compatibility issues with Clash Premium (proper protocol filtering)

### Refactored
- Component directory organization with semantic structure
- Library directory organization with clear separation of concerns
- Improved code maintainability and extensibility

### Updated
- Favicon assets with multiple sizes for better browser support
- Translation text refinements for better clarity

## [0.1.0] - 2025-12-XX

### Added
- Initial release of ClashConverter
- Support for 9 proxy protocols: SS, SSR, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, SOCKS5
- Bidirectional conversion between proxy links and Clash YAML
- Clash Meta (Mihomo) and Clash Premium output formats
- CodeMirror integration for syntax-highlighted preview
- Multi-language support (English and Simplified Chinese)
- Dark/Light theme support
- Client-side processing for privacy
- Proxy node configuration dialogs
- Client download and installation script recommendations

### Features
- Real-time preview with syntax highlighting
- Protocol-specific proxy node editing
- Automatic proxy group generation
- DNS configuration with fake-ip mode
- Comprehensive Clash routing rules
- SEO optimization with structured data
- Locale detection and automatic redirection
