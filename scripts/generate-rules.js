const fs = require('fs');
const path = require('path');

// Read rules.yaml
const rulesPath = path.join(__dirname, '../lib/rules.yaml');
const content = fs.readFileSync(rulesPath, 'utf8');

// Escape backslashes and dollar signs for template literal
const escaped = content
  .replace(/\\/g, '\\\\')
  .replace(/\$/g, '\\$')
  .replace(/`/g, '\\`');

// Create the TypeScript file
const output = `// Auto-generated from rules.yaml
export const CLASH_RULES = \`${escaped}\`;
`;

const outputPath = path.join(__dirname, '../lib/rules-content.ts');
fs.writeFileSync(outputPath, output);

console.log('Generated rules-content.ts successfully');
