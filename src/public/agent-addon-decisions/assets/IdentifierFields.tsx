import {
  Button, Select, Stack, Text, TextInput, Title,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { IdentifierFieldConfig } from '../../../parser/types';
import { useStorageEngine } from '../../../storage/storageEngineHooks';
import { useStoreSelector } from '../../../store/store';
import { StimulusParams } from '../../../store/types';
import { useStudyConfig } from '../../../store/hooks/useStudyConfig';

type IdentifierParameters = {
  title: string;
  body: string;
  fieldKeys: IdentifierFieldConfig['key'][];
  allowSkip?: boolean;
  skipLabel?: string;
};

export default function IdentifierFields({ parameters, setAnswer }: StimulusParams<IdentifierParameters>) {
  const studyConfig = useStudyConfig();
  const collection = studyConfig.uiConfig.identifierCollection;
  const { storageEngine } = useStorageEngine();
  const participantId = useStoreSelector((state) => state.participantId);
  const fields = useMemo(
    () => (collection?.fields ?? []).filter((field) => parameters.fieldKeys.includes(field.key)),
    [collection?.fields, parameters.fieldKeys],
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<'saved' | 'skipped' | null>(null);

  useEffect(() => {
    if (!done) {
      setAnswer({ status: false, answers: {} });
    }
  }, [done, setAnswer]);

  const finish = (status: 'saved' | 'skipped') => {
    setDone(status);
    setAnswer({
      status: true,
      answers: { identifierSubmitted: status },
    });
  };

  const submit = async () => {
    const missing = fields.filter((field) => field.required && !(values[field.key] || '').trim());
    if (missing.length > 0) {
      setError(`Please fill in ${missing.map((field) => field.label).join(', ')}.`);
      return;
    }
    if (!storageEngine || !collection) {
      setError('This form is not available right now.');
      return;
    }
    const payload = Object.fromEntries(
      fields.map((field) => [field.key, (values[field.key] || '').trim()]),
    );
    await storageEngine.saveIdentifierFields(participantId, payload, collection.retentionDays);
    setError(null);
    finish('saved');
  };

  if (!collection) {
    return <Text>This study is not collecting identifier info.</Text>;
  }

  return (
    <Stack maw={640} p="md" gap="md">
      <Title order={3}>{parameters.title}</Title>
      <Text>{parameters.body}</Text>
      {done === 'saved' && <Text>Saved. This is stored separately from your survey answers. Continue when you are ready.</Text>}
      {done === 'skipped' && <Text>Skipped. Nothing identifying was saved on this page. Continue when you are ready.</Text>}
      {!done && fields.map((field) => (
        field.options ? (
          <Select
            key={field.key}
            label={field.label}
            data={field.options}
            value={values[field.key] || null}
            onChange={(value) => setValues((current) => ({ ...current, [field.key]: value || '' }))}
            required={field.required}
          />
        ) : (
          <TextInput
            key={field.key}
            label={field.label}
            value={values[field.key] || ''}
            onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.currentTarget.value }))}
            required={field.required}
          />
        )
      ))}
      {error && <Text c="red" size="sm">{error}</Text>}
      {!done && (
        <Stack gap="xs">
          <Button onClick={submit} maw={240}>Save and continue</Button>
          {parameters.allowSkip && (
            <Button variant="subtle" onClick={() => finish('skipped')} maw={320}>
              {parameters.skipLabel || 'Skip'}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
