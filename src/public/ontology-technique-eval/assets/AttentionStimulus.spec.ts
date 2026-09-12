import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';

describe('attention-check stimuli', () => {
  const attentionA = readFileSync('src/public/ontology-technique-eval/assets/AttentionAStimulus.tsx', 'utf8');
  const attentionB = readFileSync('src/public/ontology-technique-eval/assets/AttentionBStimulus.tsx', 'utf8');

  it('reuses the Task A card layout without follow-up questions in the stimulus', () => {
    expect(attentionA).toContain('getAttentionAVignette');
    expect(attentionA).toContain("parameters?.format ?? 'ontology'");
    expect(attentionA).not.toContain('reliedOn');
    expect(attentionA).not.toContain('decisionNote');
  });

  it('keeps Task B attention cards in the configured order on the 2x2 grid', () => {
    expect(attentionB).toContain('getAttentionBVignette');
    expect(attentionB).toContain("parameters?.format ?? 'keywords'");
    expect(attentionB).toContain('className="ot-task-b-methods"');
    expect(attentionB).not.toContain('resolveTaskBTechniqueOrder');
    expect(attentionB).not.toContain('reliedOn');
  });
});
