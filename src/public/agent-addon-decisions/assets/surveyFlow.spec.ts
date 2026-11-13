import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { describe, expect, it } from 'vitest';
import { parseStudyConfig } from '../../../parser/parser';
import { Response, StudyConfig } from '../../../parser/types';
import { Sequence } from '../../../store/types';
import { getSequenceFlatMap } from '../../../utils/getSequenceFlatMap';
import { filterSequenceByCondition } from '../../../utils/handleConditionLogic';
import { generateSequenceArray } from '../../../utils/handleRandomSequences';

const configText = readFileSync('public/agent-addon-decisions/config.json', 'utf8');
const configJson = JSON.parse(configText) as StudyConfig;

function walk(node: Sequence | StudyConfig['sequence'] | string, ids: string[] = []): string[] {
  if (typeof node === 'string') {
    ids.push(node);
    return ids;
  }
  if (node.id) ids.push(node.id);
  (node.components ?? []).forEach((child) => {
    if (typeof child === 'string') ids.push(child);
    else walk(child, ids);
  });
  return ids;
}

function expectBefore(ids: string[], earlier: string, later: string) {
  const earlierAt = ids.indexOf(earlier);
  const laterAt = ids.indexOf(later);
  expect(earlierAt, earlier).toBeGreaterThanOrEqual(0);
  expect(laterAt, `${later} after ${earlier}`).toBeGreaterThan(earlierAt);
}

function optionLabels(item: Response): string[] {
  if (!('options' in item) || !Array.isArray(item.options)) return [];
  return item.options.map((option) => (typeof option === 'string' ? option : String(option.value)));
}

function response(componentId: string, responseId: string): Response {
  const component = configJson.components[componentId];
  const inherited = component && 'baseComponent' in component
    ? configJson.baseComponents?.[component.baseComponent]
    : undefined;
  const responses = ('response' in component && component.response)
    || inherited?.response
    || [];
  const found = responses.find((item) => item.id === responseId);
  if (!found) throw new Error(`Missing ${componentId}.${responseId}`);
  return found;
}

function blocksNamed(node: Sequence | string, id: string, found: Sequence[] = []): Sequence[] {
  if (typeof node === 'string') return found;
  if (node.id === id) found.push(node);
  node.components.forEach((child) => {
    if (typeof child !== 'string') blocksNamed(child, id, found);
  });
  return found;
}

describe('agent add-on survey gates', () => {
  it('keeps the comparison order fixed', () => {
    expect(configJson.sequence.order).toBe('fixed');
    const ids = walk(configJson.sequence);
    expectBefore(ids, 'item1', 'item10gate');
    expectBefore(ids, 'item10gate', 'reasons');
    expectBefore(ids, 'item15', 'gate-item17');
    expectBefore(ids, 'gate-item17', 'listing1');
    expectBefore(ids, 'listing1', 'listing2');
    expectBefore(ids, 'listing2', 'item27');
    expectBefore(ids, 'item27', 'gate-item28');
    const top = configJson.sequence.components ?? [];
    expect(top.filter((component) => typeof component !== 'string' && component.id === 'PROLIFIC')).toHaveLength(2);
    expect(top.filter((component) => typeof component !== 'string' && component.id === 'RIT')).toHaveLength(2);
    expect(top.filter((component) => typeof component !== 'string' && component.id === 'NORTHEASTERN')).toHaveLength(2);
    expect(top.filter((component) => typeof component !== 'string' && component.id === 'UTEP')).toHaveLength(2);
  });

  it('requires the gate answers and the closed measurement items', () => {
    ['item3', 'item6', 'item10gate', 'item12', 'item17gate', 'item18', 'item19', 'item28'].forEach((id) => {
      expect(response(id, id).required, id).toBe(true);
    });
    expect(response('listing1-bounded', 'item22').required).toBe(true);
    expect(response('listing1-bounded', 'item23').required).toBe(true);
    expect(response('listing2-original-first', 'item25').required).toBe(true);
    expect(response('item27', 'item27').required).toBe(true);
    expect(optionLabels(response('listing1-bounded', 'item22'))).toContain('Prefer not to say');
    expect(optionLabels(response('listing1-bounded', 'item23'))).toContain('Prefer not to say');
    expect(optionLabels(response('item27', 'item27'))).toContain('Prefer not to say');
    const optionalComponent: Record<string, string> = {
      item24: 'listing1-bounded',
      item26: 'listing2-original-first',
    };
    ['item10list', 'item11a', 'item11b', 'item12text', 'item17list', 'item18text', 'item19text', 'item24', 'item26', 'item29', 'item30'].forEach((id) => {
      expect(response(optionalComponent[id] ?? id, id).required, id).not.toBe(true);
    });
  });

  it('shows e4 through e9 on each campus arm, with no second eligibility skip', async () => {
    const parsed = await parseStudyConfig(configText);
    expect(parsed.errors).toEqual([]);
    const [sequence] = generateSequenceArray({ ...parsed, uiConfig: { ...parsed.uiConfig, numSequences: 1 } });
    const prefix: Record<string, string> = { RIT: 'rit', NORTHEASTERN: 'neu', UTEP: 'utep' };
    ['RIT', 'NORTHEASTERN', 'UTEP'].forEach((arm) => {
      const filtered = filterSequenceByCondition(sequence, arm);
      const blockId = `${prefix[arm]}-e4`;
      const [block] = blocksNamed(filtered, blockId);
      expect(block.components).toEqual(['e4']);
      expect(block.skip ?? []).toEqual([]);
      const flat = getSequenceFlatMap(filtered);
      expect(flat).toContain('e4');
      expect(flat).not.toContain('p-screener-consent');
      expect(flat).toContain('debrief-u');
      expect(flat).toContain('gift');
      expect(flat).not.toContain('debrief-p');
      expect(flat).not.toContain('p-complete');
    });
    const background = configJson.components.e4.response?.map((item) => item.id);
    expect(background).toEqual(['e4', 'e5', 'e6', 'e7', 'e8', 'e9']);
  });

  it('keeps both the entry and the exit block when an arm id is repeated', async () => {
    const parsed = await parseStudyConfig(configText);
    const [sequence] = generateSequenceArray({ ...parsed, uiConfig: { ...parsed.uiConfig, numSequences: 1 } });
    const prolific = filterSequenceByCondition(sequence, 'PROLIFIC');
    const prolificBlocks = blocksNamed(prolific, 'PROLIFIC');
    expect(prolificBlocks).toHaveLength(2);
    expect(getSequenceFlatMap(prolificBlocks[0])).toEqual([
      'p-screener-consent', 'e1', 'e3', 'e4', 'p-main-consent',
    ]);
    expect(getSequenceFlatMap(prolificBlocks[1])).toEqual(['debrief-p', 'p-complete']);
    const flat = getSequenceFlatMap(prolific);
    expectBefore(flat, 'p-screener-consent', 'e1');
    expectBefore(flat, 'e4', 'p-main-consent');
    expectBefore(flat, 'p-main-consent', 'intro');
    expectBefore(flat, 'item30', 'debrief-p');
    expectBefore(flat, 'debrief-p', 'p-complete');
    expect(flat).not.toContain('u-consent');
    expect(flat).not.toContain('gift');

    expect(blocksNamed(filterSequenceByCondition(sequence, 'RIT'), 'thanks-rit')).toHaveLength(1);
    expect(blocksNamed(filterSequenceByCondition(sequence, 'NORTHEASTERN'), 'thanks-neu')).toHaveLength(1);
    expect(blocksNamed(filterSequenceByCondition(sequence, 'UTEP'), 'thanks-utep')).toHaveLength(1);
    expect(blocksNamed(filterSequenceByCondition(sequence, 'RIT'), 'thanks-neu')).toHaveLength(0);
  });

  it('assigns one listing variant per person, balanced across passes', async () => {
    const parsed = await parseStudyConfig(configText);
    const sequences = generateSequenceArray({ ...parsed, uiConfig: { ...parsed.uiConfig, numSequences: 20 } });
    const counts = {
      'listing1-bounded': 0,
      'listing1-broad': 0,
      'listing2-original-first': 0,
      'listing2-plus-first': 0,
    };
    sequences.forEach((sequence) => {
      const flat = getSequenceFlatMap(sequence);
      const listing1 = flat.filter((id) => id === 'listing1-bounded' || id === 'listing1-broad');
      const listing2 = flat.filter((id) => id === 'listing2-original-first' || id === 'listing2-plus-first');
      expect(listing1).toHaveLength(1);
      expect(listing2).toHaveLength(1);
      counts[listing1[0] as keyof typeof counts] += 1;
      counts[listing2[0] as keyof typeof counts] += 1;
    });
    expect(counts['listing1-bounded']).toBe(10);
    expect(counts['listing1-broad']).toBe(10);
    expect(counts['listing2-original-first']).toBe(10);
    expect(counts['listing2-plus-first']).toBe(10);
  });

  it('fails the build while Prolific codes are placeholders, and passes once they are gone', () => {
    const result = spawnSync('node', ['scripts/assert-no-prolific-placeholders.mjs'], { encoding: 'utf8' });
    const placeholder = /REPLACE_[A-Z]+/;
    const stillPlaceholder = placeholder.test(configText);
    expect(result.status).toBe(stillPlaceholder ? 1 : 0);
  });
});
