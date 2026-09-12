import { describe, expect, it } from 'vitest';
import { STUDY_BANK } from './studyBank';
import {
  getTaskBTechniqueChoices,
  isTaskBTechniqueId,
  resolveTaskBTechniqueOrder,
  seededShuffle,
  vignetteIdFromParameters,
} from './taskBChoices';

describe('task B technique choices', () => {
  it('labels cards 1-4 from the displayed technique order', () => {
    const shuffled = ['t-b2-d1', 't-b2-target', 't-b2-d3', 't-b2-d2'];
    const choices = getTaskBTechniqueChoices(shuffled);
    expect(choices.map((choice) => choice.label)).toEqual([
      'Technique 1',
      'Technique 2',
      'Technique 3',
      'Technique 4',
    ]);
    expect(choices.map((choice) => choice.value)).toEqual(shuffled);
    expect(choices[0]).toEqual({
      label: 'Technique 1',
      value: 't-b2-d1',
      position: 1,
    });
  });

  it('shuffles with a stable seed and keeps all techniques', () => {
    const original = STUDY_BANK.taskBVignettes[1].techniqueIds;
    const first = resolveTaskBTechniqueOrder('task-b-2', 'participant-a');
    const second = resolveTaskBTechniqueOrder('task-b-2', 'participant-a');

    expect(first).toEqual(second);
    expect([...first].sort()).toEqual([...original].sort());

    const uniqueOrders = new Set(
      ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].map(
        (seed) => resolveTaskBTechniqueOrder('task-b-2', seed).join('|'),
      ),
    );
    expect(uniqueOrders.size).toBeGreaterThan(1);
  });

  it('reuses a stored permutation instead of reshuffling', () => {
    const stored = ['t-b1-d3', 't-b1-d1', 't-b1-target', 't-b1-d2'];
    expect(resolveTaskBTechniqueOrder('task-b-1', 'participant-a', stored)).toEqual(stored);
    expect(resolveTaskBTechniqueOrder('task-b-1', 'participant-a', ['t-b1-target'])).toEqual(
      resolveTaskBTechniqueOrder('task-b-1', 'participant-a'),
    );
  });

  it('uses the same seeded shuffle for cards and sidebar labels', () => {
    const order = seededShuffle(
      STUDY_BANK.taskBVignettes[0].techniqueIds,
      'participant-a:task-b-1',
    );
    expect(resolveTaskBTechniqueOrder('task-b-1', 'participant-a')).toEqual(order);
    expect(getTaskBTechniqueChoices(order).map((choice) => choice.value)).toEqual(order);
  });

  it('accepts known technique ids and rejects position numbers', () => {
    expect(isTaskBTechniqueId('t-b2-d1')).toBe(true);
    expect(isTaskBTechniqueId('t-b1-target')).toBe(true);
    expect(isTaskBTechniqueId('2')).toBe(false);
    expect(isTaskBTechniqueId('Technique 2')).toBe(false);
    expect(isTaskBTechniqueId(null)).toBe(false);
  });

  it('reads the vignette id from component parameters', () => {
    expect(vignetteIdFromParameters({ vignetteId: 'task-b-3', format: 'ontology' })).toBe('task-b-3');
    expect(vignetteIdFromParameters({ format: 'keywords' })).toBeUndefined();
  });
});
