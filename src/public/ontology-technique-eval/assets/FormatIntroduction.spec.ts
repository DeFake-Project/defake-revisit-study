import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';

describe('format introduction', () => {
  const source = readFileSync('src/public/ontology-technique-eval/assets/FormatIntroduction.tsx', 'utf8');

  it('keeps the original intro copy and uses a recall variant for Part C', () => {
    expect(source).toContain("parameters?.variant === 'recall'");
    expect(source).toContain('one of two description formats per scenario');
    expect(source).toContain('The two cards below are the same samples you saw at the start');
    expect(source).toContain("isRecall ? 'recall' : 'intro'");
  });
});
