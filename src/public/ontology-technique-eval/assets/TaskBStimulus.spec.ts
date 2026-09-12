import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';

describe('Task B methods layout', () => {
  it('uses a 2x2 methods grid through 1700px and four columns above that', () => {
    const stimulus = readFileSync('src/public/ontology-technique-eval/assets/TaskBStimulus.tsx', 'utf8');
    const css = readFileSync('public/ontology-technique-eval/assets/style.css', 'utf8');

    expect(stimulus).toContain('className="ot-task-b-methods"');
    expect(css).toContain('.ot-task-b-methods');
    expect(css).toMatch(/@media \(min-width: 48em\) and \(max-width: 1700px\)/);
    expect(css).toMatch(/@media \(min-width: 1701px\)[\s\S]*repeat\(4,/);
  });
});
