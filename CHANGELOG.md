# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Footer component with copyright and contact email
- Environment variable support for contact email configuration
- Environment variable control for DNS configuration in Clash YAML output
- About page with project information
- Resources page with proxy client downloads and installation scripts
- Sing-Box JSON format support (input and output)

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

## [0.1.0] - 2024-12-XX

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
