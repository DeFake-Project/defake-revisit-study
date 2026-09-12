import studyBankJson from './data/studyBank.json';
import type {
  AttentionAVignette,
  AttentionBVignette,
  DescriptionFormat,
  StudyBank,
  TaskAVignette,
  TaskBVignette,
  Technique,
} from './types';

const STUDY_BANK = studyBankJson as StudyBank;

const TECHNIQUES_BY_ID: Record<string, Technique> = STUDY_BANK.techniques.reduce((acc, technique) => {
  acc[technique.id] = technique;
  return acc;
}, {} as Record<string, Technique>);

export function getTechnique(id: string): Technique | undefined {
  return TECHNIQUES_BY_ID[id];
}

export function getTaskAVignette(id: string): TaskAVignette | undefined {
  return STUDY_BANK.taskAVignettes.find((vignette) => vignette.id === id);
}

export function getTaskBVignette(id: string): TaskBVignette | undefined {
  return STUDY_BANK.taskBVignettes.find((vignette) => vignette.id === id);
}

export function getDemoTechnique(): Technique {
  return STUDY_BANK.techniques[0];
}

export function getAttentionAVignette(): AttentionAVignette {
  return STUDY_BANK.attentionAVignette;
}

export function getAttentionBVignette(): AttentionBVignette {
  return STUDY_BANK.attentionBVignette;
}

/** Keyword cards use the baseline summary; ontology cards use the AI summary. */
export function summaryForFormat(technique: Technique, format: DescriptionFormat): string {
  return format === 'ontology' ? technique.aiSummary : technique.baselineSummary;
}

export function resolvePaperPath(pdfPath: string, prefix: string): string {
  return /^https?:\/\//i.test(pdfPath) ? pdfPath : `${prefix}${pdfPath}`;
}

export { STUDY_BANK };
