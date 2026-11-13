import { readFileSync } from 'fs';

const files = [
  'public/agent-addon-decisions/config.json',
  'src/public/agent-addon-decisions/assets/prolificUrls.ts',
];

const pattern = /REPLACE_[A-Z]+/g;
const hits = files.flatMap((file) => {
  const found = readFileSync(file, 'utf8').match(pattern) ?? [];
  return found.length === 0 ? [] : [`${file}: ${[...new Set(found)].join(', ')}`];
});

if (hits.length > 0) {
  console.error('Prolific completion codes are still placeholders.');
  hits.forEach((hit) => console.error(`  ${hit}`));
  console.error('Paste the live study codes before building. A participant who finishes would not be marked complete, and would not be paid.');
  process.exit(1);
}
