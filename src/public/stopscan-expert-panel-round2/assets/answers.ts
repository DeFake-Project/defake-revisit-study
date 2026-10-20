import { JsonValue, ParticipantData } from '../../../parser/types';
import { TOOK_PART_NO, TOOK_PART_YES } from './participation';

export function collectAnswers(
  answers: ParticipantData['answers'] | undefined,
): Record<string, JsonValue> {
  const merged: Record<string, JsonValue> = {};
  if (!answers) {
    return merged;
  }

  Object.values(answers).forEach((stored) => {
    if (!stored?.answer) {
      return;
    }
    Object.entries(stored.answer).forEach(([key, value]) => {
      merged[key] = value;
    });
  });

  return merged;
}

/** True when they completed round 1, false when they did not, null when unanswered. */
export function tookPartInRoundOne(
  answers: ParticipantData['answers'] | undefined,
): boolean | null {
  const value = collectAnswers(answers).took_part;
  if (value === TOOK_PART_YES) {
    return true;
  }
  if (value === TOOK_PART_NO) {
    return false;
  }
  return null;
}
