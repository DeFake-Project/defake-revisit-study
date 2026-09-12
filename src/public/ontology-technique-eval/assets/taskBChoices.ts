import { STUDY_BANK, getTaskBVignette } from './studyBank';

export interface TaskBTechniqueChoice {
  label: string;
  value: string;
  position: number;
}

const TASK_B_TECHNIQUE_IDS = new Set(
  STUDY_BANK.taskBVignettes.flatMap((vignette) => vignette.techniqueIds),
);

function hashString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  return hash === 0 ? 1 : hash;
}

function lcg(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  const random = lcg(hashString(seed));
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function isTechniqueOrderForVignette(order: unknown, vignetteId: string): order is string[] {
  const expected = getTaskBVignette(vignetteId)?.techniqueIds ?? [];
  if (!Array.isArray(order) || order.length !== expected.length || expected.length === 0) {
    return false;
  }
  if (order.some((id) => typeof id !== 'string')) {
    return false;
  }
  const uniqueOrder = new Set(order);
  const expectedSet = new Set(expected);
  return uniqueOrder.size === expected.length
    && expected.every((id) => uniqueOrder.has(id))
    && order.every((id) => expectedSet.has(id));
}

export function resolveTaskBTechniqueOrder(
  vignetteId: string | undefined,
  seed: string,
  storedOrder?: unknown,
): string[] {
  if (!vignetteId) {
    return [];
  }
  if (isTechniqueOrderForVignette(storedOrder, vignetteId)) {
    return storedOrder;
  }
  const techniqueIds = getTaskBVignette(vignetteId)?.techniqueIds ?? [];
  return seededShuffle(techniqueIds, `${seed}:${vignetteId}`);
}

export function getTaskBTechniqueChoices(techniqueOrder: string[]): TaskBTechniqueChoice[] {
  return techniqueOrder.map((techniqueId, index) => ({
    label: `Technique ${index + 1}`,
    value: techniqueId,
    position: index + 1,
  }));
}

export function isTaskBTechniqueId(value: unknown): value is string {
  return typeof value === 'string' && TASK_B_TECHNIQUE_IDS.has(value);
}

export function vignetteIdFromParameters(parameters: Record<string, unknown> | undefined): string | undefined {
  const vignetteId = parameters?.vignetteId;
  return typeof vignetteId === 'string' ? vignetteId : undefined;
}
