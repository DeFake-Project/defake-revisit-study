import { ParticipantData } from '../../../parser/types';
import { JumpFunctionParameters, JumpFunctionReturnVal } from '../../../store/types';
import { findResponseValue, hasResponse } from './answerLookup';

const ITEM_11A = new Set([
  'I set it up and used it',
  'I changed the settings on one I already had',
  'Something else',
  // reVISit stores the withOther radio as this value. The typed text is item6-other.
  'other',
]);

const ITEM_11B = new Set([
  'I set it up, used it, and later turned it off or removed it',
  'I set it up, then turned it off or removed it without really using it',
  'I looked at it and decided not to use it',
]);

export function reasonsComponent(answers: ParticipantData['answers']): 'item11a' | 'item11b' {
  const decision = findResponseValue(answers, 'item6');
  if (ITEM_11B.has(decision)) {
    return 'item11b';
  }
  if (ITEM_11A.has(decision)) {
    return 'item11a';
  }
  throw new Error(`Item 6 has no reasons list for "${decision}"`);
}

export default function chooseReasons({ answers }: JumpFunctionParameters<never>): JumpFunctionReturnVal {
  if (hasResponse(answers, 'item11a') || hasResponse(answers, 'item11b')) {
    return { component: null };
  }

  return { component: reasonsComponent(answers) };
}
