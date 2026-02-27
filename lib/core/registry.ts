/**
 * Format registry initialization
 * Registers all parsers, generators, and protocol adapters
 */

import { FormatFactory } from './factory';
import { ProtocolAdapterRegistry } from '../adapters/protocol-adapter';

// Import parsers
import { TxtParser } from '../parsers/txt-parser';
import { ClashYamlParser } from '../parsers/clash-yaml-parser';
import { SingBoxJsonParser } from '../parsers/singbox-json-parser';
import { SubscribeUrlParser } from '../parsers/subscribe-url-parser';

// Import generators
import { TxtGenerator } from '../generators/txt-generator';
import { ClashYamlGenerator } from '../generators/clash-yaml-generator';
import { ClashPremiumGenerator } from '../generators/clash-premium-generator';
import { SingBoxJsonGenerator } from '../generators/singbox-json-generator';
import { LoonGenerator } from '../loon/loon-generator';

// Import protocol adapters
import { SSAdapter } from '../adapters/ss-adapter';
import { SSRAdapter } from '../adapters/ssr-adapter';
import { VMessAdapter } from '../adapters/vmess-adapter';
import { VLESSAdapter } from '../adapters/vless-adapter';
import { TrojanAdapter } from '../adapters/trojan-adapter';
import { HysteriaAdapter, Hysteria2Adapter } from '../adapters/hysteria-adapter';
import { HTTPAdapter } from '../adapters/http-adapter';
import { SOCKS5Adapter } from '../adapters/socks5-adapter';

/**
 * Initialize protocol adapters
 * Registers all protocol adapters for link generation and format conversion
 */
export function initializeProtocolAdapters(): void {
  // Register all protocol adapters
  ProtocolAdapterRegistry.register(new SSAdapter());
  ProtocolAdapterRegistry.register(new SSRAdapter());
  ProtocolAdapterRegistry.register(new VMessAdapter());
  ProtocolAdapterRegistry.register(new VLESSAdapter());
  ProtocolAdapterRegistry.register(new TrojanAdapter());
  ProtocolAdapterRegistry.register(new HysteriaAdapter());
  ProtocolAdapterRegistry.register(new Hysteria2Adapter());
  ProtocolAdapterRegistry.register(new HTTPAdapter());
  ProtocolAdapterRegistry.register(new SOCKS5Adapter());
}

/**
 * Initialize the format registry with all parsers and generators
 * This should be called once during application initialization
 */
export function initializeFormatRegistry(): void {
  // Initialize protocol adapters first
  initializeProtocolAdapters();

  // Register all parsers
  FormatFactory.registerParser(new TxtParser());
  FormatFactory.registerParser(new ClashYamlParser());
  FormatFactory.registerParser(new SingBoxJsonParser());
  FormatFactory.registerParser(new SubscribeUrlParser());

  // Register all generators
  FormatFactory.registerGenerator(new TxtGenerator());
  FormatFactory.registerGenerator(new ClashYamlGenerator());
  FormatFactory.registerGenerator(new ClashPremiumGenerator());
  FormatFactory.registerGenerator(new SingBoxJsonGenerator());
  FormatFactory.registerGenerator(new LoonGenerator());
}

/**
 * Auto-initialize the registry on import
 * This ensures all formats are available without manual initialization
 */
initializeFormatRegistry();
