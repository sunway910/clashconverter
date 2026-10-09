/**
 * Tests for agent documentation consistency:
 * - every document linked from public/llms.txt must exist in public/
 * - public/llms-full.txt must embed all documentation markdown files
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// vitest runs from the project root - resolve public/ from the cwd
const publicDir = join(process.cwd(), 'public');

const DOC_FILES = [
  'index.md',
  'formats.md',
  'protocols.md',
  'faq.md',
  'privacy.md',
  'about.md',
  'advertise.md',
];

describe('agent documentation (llms.txt)', () => {
  const llmsTxt = readFileSync(join(publicDir, 'llms.txt'), 'utf8');

  it('exists alongside every document it links', () => {
    const links = [...llmsTxt.matchAll(/\((https:\/\/clashconverter\.com\/[^)]+)\)/g)]
      .map((m) => m[1].replace('https://clashconverter.com/', ''))
      .filter((path) => path.endsWith('.md') || path.endsWith('.txt'));

    expect(links.length).toBeGreaterThanOrEqual(8);
    for (const link of links) {
      expect(existsSync(join(publicDir, link)), `missing public/${link}`).toBe(true);
    }
  });

  it('links the full documentation file', () => {
    expect(llmsTxt).toContain('llms-full.txt');
  });
});

describe('agent documentation (llms-full.txt)', () => {
  const fullTxt = readFileSync(join(publicDir, 'llms-full.txt'), 'utf8');

  it('embeds every documentation markdown file', () => {
    for (const file of DOC_FILES) {
      const marker = `<!-- ${file} -->`;
      expect(fullTxt).toContain(marker);

      // The real document content must follow its marker (not an empty stub)
      const content = readFileSync(join(publicDir, file), 'utf8');
      const h1 = content.split('\n').find((line) => line.startsWith('# '));
      expect(h1).toBeDefined();
      expect(fullTxt).toContain(h1!);
    }
  });

  it('points back to the llms.txt index', () => {
    expect(fullTxt).toContain('https://clashconverter.com/llms.txt');
  });
});

describe('agent documentation (markdown files)', () => {
  it('cross-link each other via a Related documents section', () => {
    for (const file of DOC_FILES) {
      const content = readFileSync(join(publicDir, file), 'utf8');
      expect(content, `${file} missing Related documents section`).toMatch(/## Related documents/);
    }
  });
});
