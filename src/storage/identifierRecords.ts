import { IdentifierCollectionConfig, IdentifierFieldConfig } from '../parser/types';

export type IdentifierFieldKey = IdentifierFieldConfig['key'];

export interface IdentifierRecord {
  participantId: string;
  savedAt: number;
  deleteAfter: number;
  fields: Partial<Record<IdentifierFieldKey, string>>;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isIdentifierRecord(value: unknown): value is IdentifierRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Partial<IdentifierRecord>;
  return typeof record.participantId === 'string'
    && typeof record.savedAt === 'number'
    && typeof record.deleteAfter === 'number'
    && !!record.fields
    && typeof record.fields === 'object';
}

export function mergeIdentifierFields(
  existing: IdentifierRecord | null,
  participantId: string,
  fields: Partial<Record<IdentifierFieldKey, string>>,
  retentionDays: number,
  now: number,
): IdentifierRecord {
  const nextFields: Partial<Record<IdentifierFieldKey, string>> = { ...(existing?.fields ?? {}) };
  (Object.entries(fields) as [IdentifierFieldKey, string | undefined][]).forEach(([key, fieldValue]) => {
    const trimmed = fieldValue?.trim() ?? '';
    if (trimmed) {
      nextFields[key] = trimmed;
    }
  });

  return {
    participantId,
    savedAt: existing?.savedAt ?? now,
    deleteAfter: now + retentionDays * MS_PER_DAY,
    fields: nextFields,
  };
}

export function isIdentifierRecordDue(record: IdentifierRecord, now: number): boolean {
  return record.deleteAfter <= now;
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function identifierRecordsToCsv(
  records: IdentifierRecord[],
  fields: IdentifierFieldConfig[],
): string {
  const headers = ['participantId', 'savedAt', 'deleteAfter', ...fields.map((field) => field.key)];
  const lines = records.map((record) => [
    record.participantId,
    new Date(record.savedAt).toISOString(),
    new Date(record.deleteAfter).toISOString(),
    ...fields.map((field) => record.fields[field.key] ?? ''),
  ].map(csvCell).join(','));

  return [headers.join(','), ...lines].join('\n');
}

export function identifierTabLabel(config: IdentifierCollectionConfig | undefined): string {
  return config?.tabLabel?.trim() || 'Identifier info';
}
