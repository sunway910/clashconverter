/**
 * Abstract base class for format generators
 * Implements the Template Method pattern for generating output
 */

import type { ProxyNode } from '../types';
import type { IFormatGenerator, FormatType } from './interfaces';

/**
 * Abstract base class for format generators
 * Implements the Template Method pattern with default generate() method
 * and abstract methods for subclasses to implement
 */
export abstract class BaseFormatGenerator implements IFormatGenerator {
  /**
   * The format type this generator produces
   */
  abstract readonly format: FormatType;

  /**
   * Generate output from proxy nodes using the template method pattern
   * @param proxies - Array of proxy nodes to convert
   * @returns The assembled output string
   */
  generate(proxies: ProxyNode[]): string {
    // Filter proxies to only supported protocols
    const filtered = this.filterProxies(proxies);

    // Generate the three parts of the output
    const header = this.generateHeader(filtered);
    const body = this.generateBody(filtered);
    const footer = this.generateFooter();

    // Assemble the final output
    return this.assemble(header, body, footer);
  }

  /**
   * Generate the header section of the output
   * @param proxies - Filtered proxy nodes
   * @returns Header string
   */
  protected abstract generateHeader(proxies: ProxyNode[]): string;

  /**
   * Generate the body section of the output (main content)
   * @param proxies - Filtered proxy nodes
   * @returns Body string
   */
  protected abstract generateBody(proxies: ProxyNode[]): string;

  /**
   * Generate the footer section of the output
   * @returns Footer string
   */
  protected abstract generateFooter(): string;

  /**
   * Filter proxies to only include supported protocols
   * Subclasses can override this method to provide custom filtering logic
   * @param proxies - All proxy nodes
   * @returns Filtered proxy nodes
   */
  public filterProxies(proxies: ProxyNode[]): ProxyNode[] {
    return proxies;
  }

  /**
   * Assemble the final output from header, body, and footer
   * @param header - Header section
   * @param body - Body section
   * @param footer - Footer section
   * @returns Assembled output string
   */
  protected assemble(header: string, body: string, footer: string): string {
    return [header, body, footer].filter(Boolean).join('\n');
  }

  /**
   * Get the set of protocols supported by this generator
   * Must be implemented by subclasses
   */
  abstract getSupportedProtocols(): Set<string>;
}
