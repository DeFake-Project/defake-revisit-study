import { ParticipantData } from '../../../parser/types';

export function findResponseValue(answers: ParticipantData['answers'], responseId: string): string {
  const match = Object.values(answers).find((stored) => {
    const value = stored?.answer?.[responseId];
    return typeof value === 'string' && value.trim().length > 0;
  });
  const value = match?.answer?.[responseId];
  return typeof value === 'string' ? value.trim() : '';
}

export function hasResponse(answers: ParticipantData['answers'], responseId: string): boolean {
  return Object.values(answers).some((stored) => stored?.answer && Object.prototype.hasOwnProperty.call(stored.answer, responseId));
}
