/**
 * Factory for creating parser and generator instances
 * Implements the Factory pattern for object creation
 */

import type { IFormatParser, IFormatGenerator, FormatType } from './interfaces';
import { GenerateError, ErrorCode } from '../errors';

/**
 * Error thrown when a parser or generator is not found for a format
 */
export class FormatNotRegisteredError extends GenerateError {
  constructor(format: FormatType, type: 'parser' | 'generator') {
    const detail = `No ${type} registered for format: ${format}`;
    super(
      ErrorCode.UNSUPPORTED_FORMAT,
      detail,
      format
    );
    this.name = 'FormatNotRegisteredError';
  }
}

/**
 * Factory class for creating format parsers and generators
 * Uses registration pattern to allow dynamic format registration
 */
export class FormatFactory {
  /** Map of registered parsers by format type */
  private static parsers = new Map<FormatType, IFormatParser>();

  /** Map of registered generators by format type */
  private static generators = new Map<FormatType, IFormatGenerator>();

  /**
   * Register a parser for a specific format
   * @param parser - The parser instance to register
   * @throws GenerateError if a parser is already registered for this format
   */
  static registerParser(parser: IFormatParser): void {
    if (this.parsers.has(parser.format)) {
      throw GenerateError.invalidConfig(
        `Parser already registered for format: ${parser.format}`,
        parser.format
      );
    }
    this.parsers.set(parser.format, parser);
  }

  /**
   * Register a generator for a specific format
   * @param generator - The generator instance to register
   * @throws GenerateError if a generator is already registered for this format
   */
  static registerGenerator(generator: IFormatGenerator): void {
    if (this.generators.has(generator.format)) {
      throw GenerateError.invalidConfig(
        `Generator already registered for format: ${generator.format}`,
        generator.format
      );
    }
    this.generators.set(generator.format, generator);
  }

  /**
   * Create a parser for the specified format
   * @param format - The format type
   * @returns The registered parser instance
   * @throws FormatNotRegisteredError if no parser is registered for this format
   */
  static createParser(format: FormatType): IFormatParser {
    const parser = this.parsers.get(format);
    if (!parser) {
      throw new FormatNotRegisteredError(format, 'parser');
    }
    return parser;
  }

  /**
   * Create a generator for the specified format
   * @param format - The format type
   * @returns The registered generator instance
   * @throws FormatNotRegisteredError if no generator is registered for this format
   */
  static createGenerator(format: FormatType): IFormatGenerator {
    const generator = this.generators.get(format);
    if (!generator) {
      throw new FormatNotRegisteredError(format, 'generator');
    }
    return generator;
  }

  /**
   * Get all registered format types
   * @returns Array of registered format types
   */
  static getRegisteredFormats(): FormatType[] {
    const formats = new Set<FormatType>();
    for (const format of this.parsers.keys()) {
      formats.add(format);
    }
    for (const format of this.generators.keys()) {
      formats.add(format);
    }
    return Array.from(formats);
  }

  /**
   * Check if a parser is registered for a format
   * @param format - The format type
   * @returns True if a parser is registered
   */
  static hasParser(format: FormatType): boolean {
    return this.parsers.has(format);
  }

  /**
   * Check if a generator is registered for a format
   * @param format - The format type
   * @returns True if a generator is registered
   */
  static hasGenerator(format: FormatType): boolean {
    return this.generators.has(format);
  }

  /**
   * Clear all registered parsers and generators
   * Useful for testing
   */
  static clear(): void {
    this.parsers.clear();
    this.generators.clear();
  }
}
