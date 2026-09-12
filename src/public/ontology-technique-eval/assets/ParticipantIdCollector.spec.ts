import { describe, expect, it } from 'vitest';
import { validateParticipantId } from './ParticipantIdCollector';

describe('participant ID collector', () => {
  it('accepts a Prolific ID captured from the URL', () => {
    expect(validateParticipantId('participant-123', 'participant-123')).toBeNull();
  });

  it('rejects a captured ID that does not match the URL', () => {
    expect(validateParticipantId('different-id', 'participant-123')).toMatch(/does not match/i);
  });

  it('accepts explicitly marked non-Prolific test IDs', () => {
    expect(validateParticipantId('TEST-pilot_01')).toBeNull();
  });

  it('rejects blank or unmarked test IDs', () => {
    expect(validateParticipantId('')).toMatch(/test identifier/i);
    expect(validateParticipantId('pilot-01')).toMatch(/must begin with TEST-/i);
  });
});
