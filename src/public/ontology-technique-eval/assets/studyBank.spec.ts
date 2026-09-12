import { describe, expect, it } from 'vitest';
import mirroredStudyBank from '../../../../public/ontology-technique-eval/assets/data/studyBank.json';
import {
  STUDY_BANK,
  getAttentionAVignette,
  getAttentionBVignette,
  getTaskAVignette,
  getTaskBVignette,
  getTechnique,
  resolvePaperPath,
  summaryForFormat,
} from './studyBank';
import { getOntologyTerm } from './ontology';

describe('study bank', () => {
  it('has the final technique and vignette counts and sets', () => {
    expect(STUDY_BANK.techniques).toHaveLength(24);
    expect(STUDY_BANK.taskAVignettes).toHaveLength(8);
    expect(STUDY_BANK.taskAVignettes.every((vignette) => vignette.set === 'A')).toBe(true);
    expect(STUDY_BANK.taskBVignettes).toHaveLength(4);
    expect(STUDY_BANK.taskBVignettes.every((vignette) => vignette.set === 'B')).toBe(true);
  });

  it('has 4 Task B vignettes each paired with 4 techniques', () => {
    STUDY_BANK.taskBVignettes.forEach((vignette) => {
      expect(vignette.techniqueIds).toHaveLength(4);
      expect(vignette.techniqueIds).toContain(vignette.correctTechniqueId);
      vignette.techniqueIds.forEach((id) => {
        expect(getTechnique(id)).toBeDefined();
      });
    });
  });

  it('gives every Task A vignette its supplied analysis target', () => {
    STUDY_BANK.taskAVignettes.forEach((vignette) => {
      expect(vignette.target).toMatch(/^(ALL_HOLD|FAIL_C[1-4])$/);
    });
  });

  it('gives every technique complete final content and a CDN paper URL', () => {
    expect(JSON.stringify(STUDY_BANK)).not.toContain('PLACEHOLDER');
    STUDY_BANK.techniques.forEach((technique) => {
      expect(technique.title.length).toBeGreaterThan(0);
      expect(technique.keywords.length).toBeGreaterThan(0);
      expect(technique.ontologyTags.length).toBeGreaterThan(0);
      expect(technique.abstract.length).toBeGreaterThan(0);
      expect(technique.baselineSummary.length).toBeGreaterThan(0);
      expect(technique.aiSummary.length).toBeGreaterThan(0);
      expect(technique.baselineSummary).not.toBe(technique.aiSummary);
      expect(technique.pdfPath).toMatch(
        /^https:\/\/cdn\.defake\.app\/user-study-assets\/ontology-technique-eval\/.+\.pdf$/,
      );
    });
  });

  it('stores each ontology term independently and resolves every slug', () => {
    STUDY_BANK.techniques.forEach((technique) => {
      technique.ontologyTags.forEach(({ path }) => {
        expect(path).toHaveLength(1);
        expect(getOntologyTerm(path[0])).toBeDefined();
      });
    });
  });

  it('keeps the runtime and browser-public bank mirrors identical', () => {
    expect(STUDY_BANK).toEqual(mirroredStudyBank);
  });

  it('uses the updated t-a1 and t-a6 ontology tag sets', () => {
    expect(getTechnique('t-a1')?.ontologyTags.map((tag) => tag.path[0])).toEqual([
      'video',
      'audio',
      'face-swap',
      'face',
      'segment',
      'acoustic-features',
      'spatial-features',
      'movement',
      'audio-visual',
    ]);
    expect(getTechnique('t-a6')?.ontologyTags.map((tag) => tag.path[0])).toEqual([
      'video',
      'audio',
      'face-swap',
      'lip-sync-reenactment',
      'face',
      'segment',
      'movement',
      'spatial-features',
      'audio-visual',
    ]);
  });

  it('resolves Task A and Task B vignettes by id', () => {
    expect(getTaskAVignette('task-a-1')?.techniqueId).toBe('t-a1');
    expect(getTaskBVignette('task-b-1')?.techniqueIds).toHaveLength(4);
    expect(getTaskBVignette('task-b-4')?.scenario).toMatch(/in-cab camera mounted near the windshield/);
    expect(getTaskBVignette('task-b-3')?.scenario).toMatch(/records video but not sound/);
    expect(getTaskBVignette('task-b-3')?.scenario).toMatch(/automated CCTV software moderately compresses footage/);
    expect(getTaskBVignette('task-b-3')?.scenario).not.toMatch(/HQ video/);
    expect(getTaskBVignette('task-b-3')?.scenario).not.toMatch(/underlying frequency structures/);
    expect(getTechnique('t-b1-d1')?.ontologyTags.map((tag) => tag.path[0])).not.toContain('metadata-file-structure');
    expect(getTaskAVignette('task-a-2')?.scenario).toMatch(/never set foot in such a place and that the whole picture was made up/);
    expect(getTaskAVignette('task-a-2')?.scenario).not.toMatch(/either the whole picture/);
    expect(getTaskAVignette('task-a-7')?.scenario).toMatch(/With the scan copy in hand, the panel must decide whether the figure used in the dissertation is unaltered/);
    expect(getTaskAVignette('task-a-7')?.scenario).not.toMatch(/whether the figure is an unaltered photograph/);
  });

  it('stores attention-check vignettes that reuse existing techniques', () => {
    const attentionA = getAttentionAVignette();
    const attentionB = getAttentionBVignette();

    expect(STUDY_BANK.taskAVignettes.map((vignette) => vignette.id)).not.toContain(attentionA.id);
    expect(STUDY_BANK.taskBVignettes.map((vignette) => vignette.id)).not.toContain(attentionB.id);
    expect(attentionA.techniqueId).toBe('t-a1');
    expect(getTechnique(attentionA.techniqueId)).toBeDefined();
    expect(attentionA.scenario).toMatch(/Not determinable/);
    expect(attentionB.techniqueIds).toEqual(['t-b1-target', 't-b1-d1', 't-b1-d2', 't-b1-d3']);
    attentionB.techniqueIds.forEach((id) => {
      expect(getTechnique(id)).toBeDefined();
    });
    expect(attentionB.scenario).toMatch(/Technique 2/);
  });

  it('selects the baseline summary for keywords and the AI summary for ontology tags', () => {
    const technique = getTechnique('t-a1');
    expect(technique).toBeDefined();
    if (!technique) {
      return;
    }
    expect(summaryForFormat(technique, 'keywords')).toBe(technique.baselineSummary);
    expect(summaryForFormat(technique, 'ontology')).toBe(technique.aiSummary);
  });

  it('does not prepend the app path to CDN paper URLs', () => {
    const cdnUrl = STUDY_BANK.techniques[0].pdfPath;
    expect(resolvePaperPath(cdnUrl, '/app/')).toBe(cdnUrl);
    expect(resolvePaperPath('study/paper.pdf', '/app/')).toBe('/app/study/paper.pdf');
  });
});
