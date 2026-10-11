import { describe, expect, it } from 'vitest';
import {
  identifierRecordsToCsv,
  isIdentifierRecordDue,
  mergeIdentifierFields,
} from './identifierRecords';

describe('identifier records', () => {
  it('merges new fields without erasing ones already stored', () => {
    const existing = mergeIdentifierFields(null, 'p1', { choice: 'ada@example.edu' }, 30, 1_000);
    const updated = mergeIdentifierFields(
      existing,
      'p1',
      { name: 'Ada Lovelace', email: 'ada@rit.edu', choice: '' },
      30,
      2_000,
    );

    expect(updated.fields).toEqual({
      choice: 'ada@example.edu',
      name: 'Ada Lovelace',
      email: 'ada@rit.edu',
    });
    expect(updated.savedAt).toBe(1_000);
    expect(updated.deleteAfter).toBe(2_000 + 30 * 24 * 60 * 60 * 1000);
    expect(updated.participantId).toBe('p1');
  });

  it('treats a record as due only once deleteAfter has passed', () => {
    const record = mergeIdentifierFields(null, 'p1', { email: 'a@b.edu' }, 30, 0);
    expect(isIdentifierRecordDue(record, record.deleteAfter - 1)).toBe(false);
    expect(isIdentifierRecordDue(record, record.deleteAfter)).toBe(true);
  });

  it('exports identifier columns separately from survey answers', () => {
    const record = mergeIdentifierFields(null, 'p1', { name: 'Ada, Lovelace', email: 'a@b.edu' }, 30, 0);
    const csv = identifierRecordsToCsv([record], [
      { key: 'name', label: 'Full name' },
      { key: 'email', label: 'Email' },
    ]);

    expect(csv.split('\n')[0]).toBe('participantId,savedAt,deleteAfter,name,email');
    expect(csv).toContain('"Ada, Lovelace"');
    expect(csv).not.toContain('answers');
  });
});
