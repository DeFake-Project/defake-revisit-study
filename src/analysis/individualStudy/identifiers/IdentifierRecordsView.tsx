import {
  Button, Group, Stack, Table, Text, Title,
} from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { IdentifierCollectionConfig } from '../../../parser/types';
import { StorageEngine } from '../../../storage/engines/types';
import {
  IdentifierRecord,
  identifierRecordsToCsv,
  isIdentifierRecordDue,
} from '../../../storage/identifierRecords';

function formatWhen(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function downloadText(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function IdentifierRecordsView({
  studyId,
  storageEngine,
  collection,
}: {
  studyId: string;
  storageEngine: StorageEngine | undefined;
  collection: IdentifierCollectionConfig;
}) {
  const [records, setRecords] = useState<IdentifierRecord[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    if (!storageEngine) {
      return;
    }
    await storageEngine.initializeStudyDb(studyId);
    const nextRecords = await storageEngine.getAllIdentifierRecords(studyId);
    nextRecords.sort((a, b) => a.deleteAfter - b.deleteAfter);
    setRecords(nextRecords);
  }, [storageEngine, studyId]);

  useEffect(() => {
    loadRecords().catch((error: unknown) => {
      setStatus(error instanceof Error ? error.message : 'Could not load identifier records.');
    });
  }, [loadRecords]);

  const dueRecords = records.filter((record) => isIdentifierRecordDue(record, Date.now()));

  const deleteDue = async () => {
    if (!storageEngine || dueRecords.length === 0) {
      return;
    }
    const removed = await storageEngine.deleteDueIdentifierRecords(studyId);
    setStatus(`Deleted ${removed} record${removed === 1 ? '' : 's'} that had reached their deletion date.`);
    await loadRecords();
  };

  return (
    <Stack p="md" gap="md">
      <Title order={3}>{collection.tabLabel?.trim() || 'Identifier info'}</Title>
      <Text size="sm" maw={720}>
        These records are stored separately from survey answers and are not included in the survey export.
        Each row lists the date it should be deleted. The button removes only records whose date has passed.
      </Text>
      <Group>
        <Button
          variant="default"
          disabled={records.length === 0}
          onClick={() => downloadText(
            `${studyId}_identifiers.json`,
            JSON.stringify(records, null, 2),
            'application/json',
          )}
        >
          Export JSON
        </Button>
        <Button
          variant="default"
          disabled={records.length === 0}
          onClick={() => downloadText(
            `${studyId}_identifiers.csv`,
            identifierRecordsToCsv(records, collection.fields),
            'text/csv',
          )}
        >
          Export CSV
        </Button>
        <Button color="red" variant="light" disabled={dueRecords.length === 0} onClick={deleteDue}>
          {`Delete ${dueRecords.length} due record${dueRecords.length === 1 ? '' : 's'}`}
        </Button>
      </Group>
      {status && <Text size="sm">{status}</Text>}
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Participant</Table.Th>
            {collection.fields.map((field) => (
              <Table.Th key={field.key}>{field.label}</Table.Th>
            ))}
            <Table.Th>Saved</Table.Th>
            <Table.Th>Delete after</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {records.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={collection.fields.length + 3}>No identifier records yet.</Table.Td>
            </Table.Tr>
          )}
          {records.map((record) => {
            const due = isIdentifierRecordDue(record, Date.now());
            return (
              <Table.Tr key={record.participantId}>
                <Table.Td>{record.participantId}</Table.Td>
                {collection.fields.map((field) => (
                  <Table.Td key={field.key}>{record.fields[field.key] || ''}</Table.Td>
                ))}
                <Table.Td>{formatWhen(record.savedAt)}</Table.Td>
                <Table.Td>
                  {formatWhen(record.deleteAfter)}
                  {due ? ' (due)' : ''}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
