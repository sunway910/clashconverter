/**
 * Protocol adapter interface and registry
 * Implements the Adapter pattern for converting between different format representations
 */

import type { ProxyNode } from '../types';
import { GenerateError } from '../errors';

/**
 * Interface for protocol adapters
 * Adapters handle conversion between different format representations
 */
export interface IProtocolAdapter {
  /** The protocol type this adapter handles (e.g., 'ss', 'vmess', etc.) */
  readonly type: string;

  /**
   * Convert a ProxyNode to Clash JSON format
   * @param node - The proxy node to convert
   * @returns Clash JSON representation
   */
  toClashJson(node: ProxyNode): Record<string, any>;

  /**
   * Convert a ProxyNode to Sing-Box JSON format
   * @param node - The proxy node to convert
   * @returns Sing-Box JSON representation
   */
  toSingBoxJson(node: ProxyNode): Record<string, any>;

  /**
   * Convert a ProxyNode to a shareable link
   * @param node - The proxy node to convert
   * @returns The shareable link string
   */
  toLink(node: ProxyNode): string;
}

/**
 * Registry for protocol adapters
 * Allows dynamic registration and lookup of protocol adapters
 */
export class ProtocolAdapterRegistry {
  /** Map of registered adapters by protocol type */
  private static adapters = new Map<string, IProtocolAdapter>();

  /**
   * Register a protocol adapter
   * @param adapter - The adapter to register
   * @throws GenerateError if an adapter is already registered for this protocol type
   */
  static register(adapter: IProtocolAdapter): void {
    if (this.adapters.has(adapter.type)) {
      throw GenerateError.invalidConfig(
        `Adapter already registered for protocol: ${adapter.type}`
      );
    }
    this.adapters.set(adapter.type, adapter);
  }

  /**
   * Get an adapter for a specific protocol type
   * @param type - The protocol type
   * @returns The registered adapter or undefined if not found
   */
  static get(type: string): IProtocolAdapter | undefined {
    return this.adapters.get(type);
  }

  /**
   * Check if an adapter is registered for a protocol type
   * @param type - The protocol type
   * @returns True if an adapter is registered
   */
  static has(type: string): boolean {
    return this.adapters.has(type);
  }

  /**
   * Get all registered protocol types
   * @returns Array of registered protocol types
   */
  static getRegisteredProtocols(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Clear all registered adapters
   * Useful for testing
   */
  static clear(): void {
    this.adapters.clear();
  }
}
