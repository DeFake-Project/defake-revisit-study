import { ParticipantData } from '../../../parser/types';
import { JumpFunctionParameters, JumpFunctionReturnVal } from '../../../store/types';
import { findResponseValue, hasResponse } from './answerLookup';

const DECLINE = new Set([
  'I set it up, then turned it off or removed it',
  'I looked at it and decided not to use it',
]);

export function reasonsComponent(answers: ParticipantData['answers']): 'item11a' | 'item11b' {
  const decision = findResponseValue(answers, 'item6');
  return DECLINE.has(decision) ? 'item11b' : 'item11a';
}

export default function chooseReasons({ answers }: JumpFunctionParameters<never>): JumpFunctionReturnVal {
  if (hasResponse(answers, 'item11a') || hasResponse(answers, 'item11b')) {
    return { component: null };
  }

  return { component: reasonsComponent(answers) };
}
