import type { JsonObject } from '../../../parser/types';
import { getTaskAVignette, getTaskBVignette } from './studyBank';
import type { DescriptionFormat } from './types';

export const MATERIAL_SOURCES = ['AI summary', 'Abstract', 'Full paper'] as const;
export type MaterialSource = typeof MATERIAL_SOURCES[number];

export interface OpenedMaterialScreen {
  componentName: string;
  vignetteId: string;
  task: 'A' | 'B';
  title: string;
  format: DescriptionFormat;
  sources: MaterialSource[];
}

export interface OpenedMaterialsAnswer {
  screens: OpenedMaterialScreen[];
  note: string;
}

interface AnswerLike {
  componentName: string;
  startTime: number;
  answer: Record<string, unknown>;
}

export function isMaterialSource(value: string): value is MaterialSource {
  return (MATERIAL_SOURCES as readonly string[]).includes(value);
}

export function materialSourcesFromReliedOn(reliedOn: unknown): MaterialSource[] {
  if (!Array.isArray(reliedOn)) {
    return [];
  }
  const selected = reliedOn.filter((entry): entry is string => typeof entry === 'string');
  return MATERIAL_SOURCES.filter((source) => selected.includes(source));
}

export function parseTaskComponentName(componentName: string): {
  task: 'A' | 'B';
  vignetteId: string;
  format: DescriptionFormat;
} | null {
  const match = componentName.match(/^task-([ab])-(\d+)-(keywords|ontology)$/);
  if (!match) {
    return null;
  }
  const task = match[1] === 'a' ? 'A' : 'B';
  return {
    task,
    vignetteId: `task-${match[1]}-${match[2]}`,
    format: match[3] as DescriptionFormat,
  };
}

export function formatLabel(format: DescriptionFormat): string {
  return format === 'ontology' ? 'ontology tags' : 'keywords';
}

export function formatOpenedScreenLine(screen: OpenedMaterialScreen): string {
  return `${screen.title} (${formatLabel(screen.format)}) — ${screen.sources.join(', ')}`;
}

export const MAX_DISPLAYED_OPENED_SCREENS = 3;

export function screensToDisplay(screens: OpenedMaterialScreen[]): OpenedMaterialScreen[] {
  return screens.slice(0, MAX_DISPLAYED_OPENED_SCREENS);
}

export function openedScreensIntro(totalCount: number): string {
  return totalCount > MAX_DISPLAYED_OPENED_SCREENS
    ? 'For example, you used them on:'
    : 'You used them on:';
}

function titleForVignette(task: 'A' | 'B', vignetteId: string): string | undefined {
  return task === 'A'
    ? getTaskAVignette(vignetteId)?.title
    : getTaskBVignette(vignetteId)?.title;
}

export function collectOpenedMaterialScreens(
  answers: Record<string, AnswerLike>,
): OpenedMaterialScreen[] {
  return Object.values(answers)
    .map((stored) => {
      const parsed = parseTaskComponentName(stored.componentName);
      if (!parsed) {
        return null;
      }
      const sources = materialSourcesFromReliedOn(stored.answer.reliedOn);
      if (sources.length === 0) {
        return null;
      }
      return {
        screen: {
          componentName: stored.componentName,
          vignetteId: parsed.vignetteId,
          task: parsed.task,
          title: titleForVignette(parsed.task, parsed.vignetteId) ?? parsed.vignetteId,
          format: parsed.format,
          sources,
        },
        startTime: stored.startTime,
      };
    })
    .filter((entry): entry is { screen: OpenedMaterialScreen; startTime: number } => entry !== null)
    .sort((left, right) => left.startTime - right.startTime)
    .map((entry) => entry.screen);
}

export function isOpenedMaterialsAnswer(value: unknown): value is OpenedMaterialsAnswer {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return Array.isArray(record.screens) && typeof record.note === 'string';
}

export function openedMaterialsAnswer(
  screens: OpenedMaterialScreen[],
  note = '',
): JsonObject {
  return {
    screens: screens.map((screen) => ({
      componentName: screen.componentName,
      vignetteId: screen.vignetteId,
      task: screen.task,
      title: screen.title,
      format: screen.format,
      sources: [...screen.sources],
    })),
    note,
  };
}
