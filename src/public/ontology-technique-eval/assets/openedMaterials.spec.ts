import { describe, expect, it } from 'vitest';
import {
  collectOpenedMaterialScreens,
  formatOpenedScreenLine,
  materialSourcesFromReliedOn,
  openedScreensIntro,
  parseTaskComponentName,
  screensToDisplay,
} from './openedMaterials';

describe('opened materials follow-up', () => {
  it('keeps only AI summary, abstract, and full paper, in that option order', () => {
    expect(materialSourcesFromReliedOn([
      'Full paper',
      'Technique title',
      'AI summary',
      'Keywords or ontology tags',
    ])).toEqual(['AI summary', 'Full paper']);
  });

  it('parses Task A and Task B component names and ignores attention checks', () => {
    expect(parseTaskComponentName('task-a-3-ontology')).toEqual({
      task: 'A',
      vignetteId: 'task-a-3',
      format: 'ontology',
    });
    expect(parseTaskComponentName('task-b-2-keywords')).toEqual({
      task: 'B',
      vignetteId: 'task-b-2',
      format: 'keywords',
    });
    expect(parseTaskComponentName('attention-check-a')).toBeNull();
  });

  it('lists matching Task A and Task B screens in the order they were seen', () => {
    const screens = collectOpenedMaterialScreens({
      later: {
        componentName: 'task-b-1-keywords',
        startTime: 200,
        answer: { reliedOn: ['Abstract', 'Technique title'] },
      },
      skipped: {
        componentName: 'task-a-2-ontology',
        startTime: 50,
        answer: { reliedOn: ['Technique title'] },
      },
      earlier: {
        componentName: 'task-a-1-ontology',
        startTime: 100,
        answer: { reliedOn: ['Full paper', 'AI summary'] },
      },
      attention: {
        componentName: 'attention-check-a',
        startTime: 150,
        answer: { reliedOn: ['AI summary'] },
      },
    });

    expect(screens.map((screen) => screen.componentName)).toEqual([
      'task-a-1-ontology',
      'task-b-1-keywords',
    ]);
    expect(screens[0].sources).toEqual(['AI summary', 'Full paper']);
    expect(formatOpenedScreenLine(screens[0])).toMatch(/ontology tags/);
    expect(formatOpenedScreenLine(screens[0])).toMatch(/AI summary, Full paper/);
    expect(formatOpenedScreenLine(screens[1])).toMatch(/keywords/);
    expect(formatOpenedScreenLine(screens[1])).toMatch(/Abstract/);
  });

  it('shows at most three screens and uses example wording when more exist', () => {
    const manyScreens = Array.from({ length: 5 }, (_, index) => ({
      componentName: `task-a-${index + 1}-ontology`,
      vignetteId: `task-a-${index + 1}`,
      task: 'A' as const,
      title: `Scenario ${index + 1}`,
      format: 'ontology' as const,
      sources: ['AI summary' as const],
    }));

    expect(screensToDisplay(manyScreens).map((screen) => screen.vignetteId)).toEqual([
      'task-a-1',
      'task-a-2',
      'task-a-3',
    ]);
    expect(openedScreensIntro(2)).toBe('You used them on:');
    expect(openedScreensIntro(5)).toBe('For example, you used them on:');
  });
});
