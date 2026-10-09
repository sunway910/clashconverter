const fs = require('fs');
const path = require('path');

// Generate public/llms-full.txt by concatenating all agent documentation
// markdown files from public/. Re-run after editing any public/*.md:
//   pnpm build:llms

const publicDir = path.join(__dirname, '../public');

// Fixed order mirrors the "Documentation for AI agents" list in public/llms.txt
const DOCS = [
  'index.md',
  'formats.md',
  'protocols.md',
  'faq.md',
  'privacy.md',
  'about.md',
  'advertise.md',
];

const sections = [];
for (const file of DOCS) {
  const filePath = path.join(publicDir, file);
  const content = fs.readFileSync(filePath, 'utf8').trimEnd();
  if (sections.length > 0) {
    sections.push('\n\n---\n\n');
  }
  sections.push(`<!-- ${file} -->\n\n${content}`);
}

const header = [
  '# ClashConverter — Full Documentation (llms-full.txt)',
  '',
  'All agent documentation for https://clashconverter.com in one file.',
  'Individual documents and the index live at:',
  'https://clashconverter.com/llms.txt',
  '',
  '========================================================',
  '',
].join('\n');

fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), header + sections.join('') + '\n');
console.log(`Generated llms-full.txt from ${DOCS.length} documents.`);
