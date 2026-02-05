/**
 * Format registry initialization
 * Registers all parsers and generators with the FormatFactory
 */

import { FormatFactory } from './factory';

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

/**
 * Initialize the format registry with all parsers and generators
 * This should be called once during application initialization
 */
export function initializeFormatRegistry(): void {
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
