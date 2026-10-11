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
  it('shows the decline list when the add-on was removed or refused', () => {
    expect(reasonsComponent(answersWith('I looked at it and decided not to use it'))).toBe('item11b');
    expect(reasonsComponent(answersWith('I set it up, then turned it off or removed it'))).toBe('item11b');
  });

  it('shows the keep list otherwise', () => {
    expect(reasonsComponent(answersWith('I set it up and used it'))).toBe('item11a');
    expect(reasonsComponent(answersWith('Something else'))).toBe('item11a');
  });
});
