import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';
import { getSequenceFlatMap } from '../utils/getSequenceFlatMap';
import { generateSequenceArray } from '../utils/handleRandomSequences';
import { parseGlobalConfig, parseStudyConfig } from './parser';
import { ComponentBlock } from './types';
import { isDynamicBlock } from './utils';

function findNamedBlock(sequence: ComponentBlock, id: string): ComponentBlock | undefined {
  return sequence.components.find((component): component is ComponentBlock => (
    typeof component !== 'string' && !isDynamicBlock(component) && component.id === id
  ));
}

describe('user studies from production fork', () => {
  it('registers the user studies as non-test in global.json', () => {
    const globalConfig = parseGlobalConfig(readFileSync('public/global.json', 'utf8'));
    expect(globalConfig.configsList).toContain('ontology-technique-eval');
    expect(globalConfig.configsList).toContain('varuna-sme-eval-ontology');
    expect(globalConfig.configsList).toContain('dndf-scenario-evaluation');
    expect(globalConfig.configsList).toContain('stopscan-expert-panel');
    expect(globalConfig.configs['ontology-technique-eval']?.test).toBeUndefined();
    expect(globalConfig.configs['varuna-sme-eval-ontology']?.test).toBeUndefined();
    expect(globalConfig.configs['dndf-scenario-evaluation']?.test).toBeUndefined();
    expect(globalConfig.configs['stopscan-expert-panel']?.test).toBeUndefined();
    expect(globalConfig.configs.tutorial?.test).toBeUndefined();
    expect(globalConfig.configs['demo-html']?.test).toBe(true);
  });

  it.each([
    'ontology-technique-eval',
    'varuna-sme-eval-ontology',
    'dndf-scenario-evaluation',
    'stopscan-expert-panel',
  ])('parses %s without errors', async (studyId) => {
    const text = readFileSync(`public/${studyId}/config.json`, 'utf8');
    const parsed = await parseStudyConfig(text);
    expect(parsed.errors, JSON.stringify(parsed.errors, null, 2)).toEqual([]);
  });

  it('accepts the ontology-technique-eval Part C questionnaire', async () => {
    const text = readFileSync('public/ontology-technique-eval/config.json', 'utf8');
    const parsed = await parseStudyConfig(text);
    const partC = parsed.components['part-c'];

    expect(parsed.errors).toEqual([]);
    expect(partC).toMatchObject({
      type: 'react-component',
      path: 'ontology-technique-eval/assets/FormatIntroduction.tsx',
      parameters: { variant: 'recall' },
    });
    expect(partC?.response?.find((response) => response.id === 'ontologyCategoryRank')).toMatchObject({
      type: 'custom',
      path: 'ontology-technique-eval/assets/OntologyCategoryRanking.tsx',
      required: false,
    });
    expect(partC?.response?.find((response) => response.id === 'ontologyTagGaps')).toMatchObject({
      type: 'custom',
      path: 'ontology-technique-eval/assets/OpenedMaterialsFollowup.tsx',
      required: false,
      prompt: 'On the screens below you said you used the AI summary, abstract, or full paper. What were you hoping to find there that the title, keywords, or ontology tags had not already given you?',
    });
    const partCIds = partC?.response?.map((response) => response.id) ?? [];
    expect(partCIds.indexOf('ontologyTagGaps')).toBeGreaterThan(partCIds.indexOf('ontologyReflections'));
    expect(partC?.response?.some((response) => (
      response.type === 'longText'
      && response.prompt.includes('On screens that had ontology tags')
    ))).toBe(false);
    expect(partC?.response?.find((response) => response.id === 'formatPreference')).toMatchObject({
      type: 'radio',
      required: false,
    });
    expect(partC?.response?.find((response) => response.id === 'hoverDefinitionUsefulness')).toMatchObject({
      type: 'radio',
      required: false,
      options: expect.arrayContaining([
        { label: 'I did not hover any tags or info icons', value: 'didNotHover' },
      ]),
    });
    expect(partC?.response?.find((response) => response.id === 'ontologyReflections')).toMatchObject({
      type: 'longText',
      required: false,
    });
    expect(partC?.response?.some((response) => response.id === 'noticedFormatDifference')).toBe(false);
    expect(partC?.response?.some((response) => response.id === 'ontologyApplications')).toBe(false);
  });

  it('places Task A sidebar guidance before optional radio answers', async () => {
    const text = readFileSync('public/ontology-technique-eval/config.json', 'utf8');
    const parsed = await parseStudyConfig(text);
    const taskA = parsed.baseComponents?.taskATrial;

    expect(parsed.errors).toEqual([]);
    expect(taskA?.response?.[0]).toMatchObject({ id: 'sidebarGuidance', type: 'textOnly' });
    expect(taskA?.response?.find((response) => response.id === 'confidence')).toMatchObject({
      id: 'confidence',
      type: 'radio',
      required: false,
    });
    expect(taskA?.response?.find((response) => response.id === 'reliedOn')).toMatchObject({
      id: 'reliedOn',
      type: 'checkbox',
      required: false,
    });
    expect(taskA?.response?.find((response) => response.id === 'decisionNote')).toMatchObject({
      id: 'decisionNote',
      type: 'longText',
      prompt: 'In one or two sentences, briefly explain the reasoning behind your judgment.',
      secondaryText: 'If you selected ‘Not enough information to decide,’ what is the main blocker?',
      required: false,
    });
  });

  it('records Task B choices as technique ids while keeping numbered labels', async () => {
    const text = readFileSync('public/ontology-technique-eval/config.json', 'utf8');
    const parsed = await parseStudyConfig(text);
    const taskB = parsed.baseComponents?.taskBTrial;

    expect(parsed.errors).toEqual([]);
    expect(taskB?.response?.some((response) => response.id === 'sidebarGuidance')).toBe(true);
    expect(taskB?.response?.find((response) => response.id === 'chosenTechnique')).toMatchObject({
      id: 'chosenTechnique',
      type: 'custom',
      path: 'ontology-technique-eval/assets/TaskBTechniqueChoice.tsx',
      required: false,
    });
    expect(taskB?.response?.find((response) => response.id === 'reliedOn')).toMatchObject({
      id: 'reliedOn',
      type: 'checkbox',
      required: false,
      options: [
        'Technique title',
        'Keywords or ontology tags',
        'Ontology tag definitions',
        'AI summary',
        'Abstract',
        'Full paper',
      ],
    });
    expect(taskB?.response?.find((response) => response.id === 'decisionNote')).toMatchObject({
      id: 'decisionNote',
      type: 'longText',
      prompt: 'In one or two sentences, briefly explain the reasoning behind your judgment.',
      secondaryText: 'If you selected ‘Not enough information to decide,’ what is the main blocker?',
      required: false,
    });
    expect(taskB?.response?.some((response) => response.id === 'techniqueOrder')).toBe(true);
  });

  it('keeps Task A, B, and C participant questions optional', async () => {
    const text = readFileSync('public/ontology-technique-eval/config.json', 'utf8');
    const parsed = await parseStudyConfig(text);
    const visibleRequired = (responses: { id: string; type: string; hidden?: boolean; required?: boolean }[] | undefined) => (
      responses?.filter((response) => (
        response.type !== 'textOnly'
        && response.hidden !== true
        && response.required !== false
      )).map((response) => response.id) ?? []
    );

    expect(visibleRequired(parsed.baseComponents?.taskATrial?.response)).toEqual([]);
    expect(visibleRequired(parsed.baseComponents?.taskBTrial?.response)).toEqual([]);
    expect(visibleRequired(parsed.components['part-c']?.response)).toEqual([]);
    expect(parsed.components.consent.response?.find((response) => response.id === 'consentAgree')?.required).not.toBe(false);
  });

  it('uses contextual attention checks with instructed answers', async () => {
    const text = readFileSync('public/ontology-technique-eval/config.json', 'utf8');
    const parsed = await parseStudyConfig(text);
    const attentionA = parsed.components['attention-check-a'];
    const attentionB = parsed.components['attention-check-b'];

    expect(parsed.errors).toEqual([]);
    expect(attentionA).toMatchObject({
      type: 'react-component',
      path: 'ontology-technique-eval/assets/AttentionAStimulus.tsx',
    });
    expect(attentionA?.response?.find((response) => response.id === 'attentionCheckNotice')).toMatchObject({
      type: 'textOnly',
      location: 'sidebar',
      prompt: '[This is an attention check]',
    });
    expect(attentionA?.response?.find((response) => response.id === 'applies')).toMatchObject({
      id: 'applies',
      type: 'radio',
      options: ['Yes', 'No', 'Not determinable'],
    });
    expect(attentionA?.response?.find((response) => response.id === 'applies')?.required).not.toBe(false);
    expect(attentionA?.response?.find((response) => response.id === 'confidence')).toMatchObject({
      type: 'radio',
    });
    expect(attentionA?.response?.find((response) => response.id === 'confidence')?.required).not.toBe(false);
    expect(attentionA?.response?.some((response) => response.id === 'reliedOn')).toBe(false);
    expect(attentionA?.response?.some((response) => response.id === 'decisionNote')).toBe(false);
    expect(attentionB).toMatchObject({
      type: 'react-component',
      path: 'ontology-technique-eval/assets/AttentionBStimulus.tsx',
    });
    expect(attentionB?.response?.find((response) => response.id === 'attentionCheckNotice')).toMatchObject({
      type: 'textOnly',
      location: 'sidebar',
      prompt: '[This is an attention check]',
    });
    expect(attentionB?.response?.find((response) => response.id === 'chosenTechnique')).toMatchObject({
      type: 'radio',
      options: [
        { label: 'Technique 1', value: '1' },
        { label: 'Technique 2', value: '2' },
        { label: 'Technique 3', value: '3' },
        { label: 'Technique 4', value: '4' },
      ],
    });
    expect(attentionB?.response?.find((response) => response.id === 'chosenTechnique')?.required).not.toBe(false);
    expect(attentionB?.response?.some((response) => response.id === 'reliedOn')).toBe(false);
    expect(attentionB?.response?.some((response) => response.id === 'decisionNote')).toBe(false);
    expect(attentionB?.correctAnswer).toEqual(expect.arrayContaining([
      { id: 'chosenTechnique', answer: '2' },
      { id: 'confidence', answer: '1' },
    ]));
    expect(attentionA?.correctAnswer).toEqual(expect.arrayContaining([
      { id: 'applies', answer: 'Not determinable' },
      { id: 'confidence', answer: '1' },
    ]));
  });

  it('interleaves complementary keyword/ontology groups without repeating scenarios', async () => {
    const text = readFileSync('public/ontology-technique-eval/config.json', 'utf8');
    const parsed = await parseStudyConfig(text);
    expect(parsed.errors).toEqual([]);

    const sequences = generateSequenceArray(parsed);
    expect(sequences).toHaveLength(200);

    const sampleFlat = getSequenceFlatMap(sequences[0]);
    expect(sampleFlat[0]).toBe('consent');
    expect(sampleFlat[1]).toBe('consent-declined');
    expect(sampleFlat[2]).toBe('intro-formats');
    expect(sampleFlat.at(-2)).toBe('thank-you');
    expect(sampleFlat.at(-1)).toBe('end');

    const taskAGroup1 = [1, 2, 3, 5];
    const taskAGroup2 = [4, 6, 7, 8];
    const taskBGroup1 = [1, 3];
    const taskBGroup2 = [2, 4];
    const armCounts = {
      1: 0, 2: 0, 3: 0, 4: 0,
    };

    sequences.forEach((sequence) => {
      const flat = getSequenceFlatMap(sequence);
      const taskA = flat.filter((id) => /^task-a-\d+-(keywords|ontology)$/.test(id));
      const taskB = flat.filter((id) => /^task-b-\d+-(keywords|ontology)$/.test(id));

      expect(taskA).toHaveLength(8);
      expect(taskB).toHaveLength(4);

      const parsedA = taskA.map((id) => {
        const match = id.match(/^task-a-(\d+)-(keywords|ontology)$/);
        return { vignette: Number(match?.[1]), format: match?.[2] };
      });
      const parsedB = taskB.map((id) => {
        const match = id.match(/^task-b-(\d+)-(keywords|ontology)$/);
        return { vignette: Number(match?.[1]), format: match?.[2] };
      });

      expect(new Set(parsedA.map((trial) => trial.vignette))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
      expect(new Set(parsedB.map((trial) => trial.vignette))).toEqual(new Set([1, 2, 3, 4]));
      expect(parsedA.filter((trial) => trial.format === 'keywords')).toHaveLength(4);
      expect(parsedA.filter((trial) => trial.format === 'ontology')).toHaveLength(4);
      expect(parsedB.filter((trial) => trial.format === 'keywords')).toHaveLength(2);
      expect(parsedB.filter((trial) => trial.format === 'ontology')).toHaveLength(2);

      const a1IsKeywords = taskAGroup1.every((vignette) => (
        parsedA.find((trial) => trial.vignette === vignette)?.format === 'keywords'
      ));
      const a1IsOntology = taskAGroup1.every((vignette) => (
        parsedA.find((trial) => trial.vignette === vignette)?.format === 'ontology'
      ));
      const b1IsKeywords = taskBGroup1.every((vignette) => (
        parsedB.find((trial) => trial.vignette === vignette)?.format === 'keywords'
      ));
      const b1IsOntology = taskBGroup1.every((vignette) => (
        parsedB.find((trial) => trial.vignette === vignette)?.format === 'ontology'
      ));

      expect(a1IsKeywords || a1IsOntology).toBe(true);
      expect(b1IsKeywords || b1IsOntology).toBe(true);

      const aKeywords = parsedA.filter((trial) => trial.format === 'keywords').map((trial) => trial.vignette).sort((left, right) => left - right);
      const aOntology = parsedA.filter((trial) => trial.format === 'ontology').map((trial) => trial.vignette).sort((left, right) => left - right);
      const bKeywords = parsedB.filter((trial) => trial.format === 'keywords').map((trial) => trial.vignette).sort((left, right) => left - right);
      const bOntology = parsedB.filter((trial) => trial.format === 'ontology').map((trial) => trial.vignette).sort((left, right) => left - right);

      if (a1IsKeywords) {
        expect(aKeywords).toEqual([...taskAGroup1].sort((left, right) => left - right));
        expect(aOntology).toEqual([...taskAGroup2].sort((left, right) => left - right));
      } else {
        expect(aOntology).toEqual([...taskAGroup1].sort((left, right) => left - right));
        expect(aKeywords).toEqual([...taskAGroup2].sort((left, right) => left - right));
      }

      if (b1IsKeywords) {
        expect(bKeywords).toEqual([...taskBGroup1].sort((left, right) => left - right));
        expect(bOntology).toEqual([...taskBGroup2].sort((left, right) => left - right));
      } else {
        expect(bOntology).toEqual([...taskBGroup1].sort((left, right) => left - right));
        expect(bKeywords).toEqual([...taskBGroup2].sort((left, right) => left - right));
      }

      expect(flat[flat.indexOf(taskA[0]) + 4]).toBe('attention-check-a');
      expect(flat[flat.indexOf(taskB[0]) + 2]).toBe('attention-check-b');

      let arm: 1 | 2 | 3 | 4 = 4;
      if (a1IsKeywords && b1IsKeywords) {
        arm = 1;
      } else if (a1IsOntology && b1IsOntology) {
        arm = 2;
      } else if (a1IsKeywords && b1IsOntology) {
        arm = 3;
      }
      armCounts[arm] += 1;
    });

    expect(armCounts).toEqual({
      1: 50, 2: 50, 3: 50, 4: 50,
    });
  });

  it('captures Prolific IDs and keeps explicit test sessions available', async () => {
    const text = readFileSync('public/ontology-technique-eval/config.json', 'utf8');
    const parsed = await parseStudyConfig(text);
    const { consent } = parsed.components;

    expect(parsed.uiConfig.urlParticipantIdParam).toBe('PROLIFIC_PID');
    expect(parsed.uiConfig.studyEndAutoRedirectURL).toBe('https://app.prolific.com/submissions/complete?cc=C25X6SWF');
    expect(parsed.uiConfig.studyEndMsg).toMatch(/C25X6SWF/);
    expect(consent.response?.[0]).toMatchObject({
      id: 'prolificId',
      type: 'custom',
      path: 'ontology-technique-eval/assets/ParticipantIdCollector.tsx',
      paramCapture: 'PROLIFIC_PID',
    });
    expect(isDynamicBlock(parsed.sequence)).toBe(false);
    if (isDynamicBlock(parsed.sequence)) {
      return;
    }

    expect(parsed.components.consent).toBeDefined();
    expect(findNamedBlock(parsed.sequence, 'consent-block')).toMatchObject({
      skip: [
        {
          name: 'consent',
          check: 'response',
          responseId: 'consentAgree',
          value: 'I do not agree to participate.',
          to: 'consent-declined',
        },
        {
          name: 'consent',
          check: 'response',
          responseId: 'consentAgree',
          value: 'I have read this information and I agree to participate.',
          to: 'intro-formats',
        },
      ],
    });
    expect(parsed.components['consent-declined']).toMatchObject({
      type: 'react-component',
      path: 'ontology-technique-eval/assets/ProlificDeclinedRedirect.tsx',
      nextButtonText: 'Return to Prolific',
    });
    expect(parsed.components['thank-you']).toMatchObject({
      nextButtonText: 'Submit and return to Prolific',
    });
    expect(findNamedBlock(parsed.sequence, 'closing')).toBeUndefined();
    expect(parsed.sequence.components[1]).toBe('consent-declined');
    expect(parsed.sequence.components.at(-1)).toBe('thank-you');
    expect(parsed.uiConfig.studyEndMsg).toMatch(/approve payment/);
    expect(parsed.uiConfig.studyEndMsg).not.toMatch(/C1CR6OHI/);
  });
});
