export type DescriptionFormat = 'keywords' | 'ontology';

export interface OntologyTerm {
  slug: string;
  title: string;
  description: string;
  parent_slug: string | null;
}

/** One visible ontology term. `path` retains the config-compatible slug-array shape. */
export interface OntologyTagPath {
  path: string[];
}

export interface Technique {
  id: string;
  title: string;
  keywords: string[];
  ontologyTags: OntologyTagPath[];
  abstract: string;
  /** AI-generated Semantic Scholar TLDR shown with keyword-supported descriptions. */
  baselineSummary: string;
  /** Ontology-assisted AI summary shown with ontology-tag descriptions; tag titles are highlighted. */
  aiSummary: string;
  pdfPath: string;
}

export type TaskATarget = 'ALL_HOLD' | 'FAIL_C1' | 'FAIL_C2' | 'FAIL_C3' | 'FAIL_C4';

export interface TaskAVignette {
  id: string;
  set: 'A';
  title: string;
  scenario: string;
  target: TaskATarget;
  techniqueId: string;
}

export interface TaskBVignette {
  id: string;
  set: 'B';
  title: string;
  scenario: string;
  techniqueIds: string[];
  /** Ground-truth technique for later analysis; not shown to participants. */
  correctTechniqueId: string;
}

export interface AttentionAVignette {
  id: string;
  title: string;
  scenario: string;
  techniqueId: string;
}

export interface AttentionBVignette {
  id: string;
  title: string;
  scenario: string;
  techniqueIds: string[];
}

export interface StudyBank {
  techniques: Technique[];
  taskAVignettes: TaskAVignette[];
  taskBVignettes: TaskBVignette[];
  attentionAVignette: AttentionAVignette;
  attentionBVignette: AttentionBVignette;
}

export interface FormatIntroductionParams {
  variant?: 'intro' | 'recall';
}

export interface TaskAStimulusParams {
  vignetteId: string;
  format: DescriptionFormat;
}

export interface TaskBStimulusParams {
  vignetteId: string;
  format: DescriptionFormat;
}

export type InteractionEventType = 'click' | 'open' | 'close' | 'hover';

export type InteractionRegion =
  | 'card'
  | 'title'
  | 'keyword'
  | 'ontology-tag'
  | 'abstract'
  | 'summary'
  | 'summary-tag'
  | 'full-paper';

export interface InteractionEvent {
  timestamp: number;
  type: InteractionEventType;
  elementId: string;
  label: string;
  techniqueId?: string;
  cardId?: string;
  format?: DescriptionFormat;
  cardIndex?: number;
  region?: InteractionRegion;
}

export interface ProvenanceState {
  events: InteractionEvent[];
  openSince: Record<string, number>;
  dwellMs: Record<string, number>;
}
