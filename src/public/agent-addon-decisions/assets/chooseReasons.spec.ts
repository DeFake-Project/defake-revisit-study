import { describe, expect, it } from 'vitest';
import { ParticipantData } from '../../../parser/types';
import { reasonsComponent } from './chooseReasons';

function answersWith(item6: string): ParticipantData['answers'] {
  return {
    item6_0: {
      answer: { item6 },
    },
  } as unknown as ParticipantData['answers'];
}

describe('reasonsComponent', () => {
  it.each([
    ['I set it up and used it', 'item11a'],
    ['I changed the settings on one I already had', 'item11a'],
    ['Something else', 'item11a'],
    ['other', 'item11a'],
    ['I set it up, used it, and later turned it off or removed it', 'item11b'],
    ['I set it up, then turned it off or removed it without really using it', 'item11b'],
    ['I looked at it and decided not to use it', 'item11b'],
  ] as const)('maps %j to %s', (answer, component) => {
    expect(reasonsComponent(answersWith(answer))).toBe(component);
  });

  it('does not match a shared substring of the removal answers', () => {
    expect(() => reasonsComponent(answersWith('I set it up'))).toThrow(/no reasons list/);
    expect(() => reasonsComponent(answersWith('turned it off or removed it'))).toThrow(/no reasons list/);
    expect(() => reasonsComponent(answersWith(''))).toThrow(/no reasons list/);
  });
});
