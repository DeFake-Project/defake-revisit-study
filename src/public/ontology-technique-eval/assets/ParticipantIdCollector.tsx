import {
  Alert, Stack, Text, TextInput,
} from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import type { CustomResponseParams, CustomResponseValidate } from '../../../store/types';

const PROLIFIC_PARAM = 'PROLIFIC_PID';
const TEST_ID_PATTERN = /^TEST-[A-Za-z0-9_-]+$/;

export function validateParticipantId(
  value: unknown,
  capturedProlificId?: string | null,
): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return capturedProlificId
      ? 'The Prolific ID could not be captured. Please reload using the link from Prolific.'
      : 'Enter a test identifier to continue.';
  }

  const participantId = value.trim();
  if (capturedProlificId) {
    return participantId === capturedProlificId
      ? null
      : 'The captured Prolific ID does not match the study link.';
  }

  return TEST_ID_PATTERN.test(participantId)
    ? null
    : 'Testing identifiers must begin with TEST- and contain only letters, numbers, hyphens, or underscores.';
}

export const validate: CustomResponseValidate = (value) => {
  const capturedProlificId = typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get(PROLIFIC_PARAM)?.trim();
  return validateParticipantId(value, capturedProlificId);
};

export default function ParticipantIdCollector({
  response,
  value,
  error,
  disabled,
  isAnalysis,
  index,
  enumerateQuestions,
  field,
}: CustomResponseParams<Record<string, never>, string>) {
  const [searchParams] = useSearchParams();
  const capturedProlificId = searchParams.get(PROLIFIC_PARAM)?.trim() || null;
  const participantId = typeof value === 'string' ? value : '';
  const isTestSession = !capturedProlificId && !isAnalysis;

  useEffect(() => {
    if (capturedProlificId && participantId !== capturedProlificId) {
      field.setValue(capturedProlificId);
    }
  }, [capturedProlificId, field, participantId]);

  return (
    <Stack gap="xs">
      <Text fw={600}>
        {enumerateQuestions && `${index}. `}
        {response.prompt}
        <Text span c="red"> *</Text>
      </Text>

      {isTestSession ? (
        <Alert
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title="Testing mode"
        >
          No Prolific ID was found in this link. Enter a test identifier beginning with
          {' '}
          <strong>TEST-</strong>
          . This marks the response as a non-Prolific test session.
        </Alert>
      ) : (
        <Alert
          color="green"
          variant="light"
          icon={<IconCircleCheck size={18} />}
          title={isAnalysis ? 'Stored participant identifier' : 'Prolific ID detected'}
        >
          {isAnalysis
            ? 'This is the participant identifier saved with the response.'
            : 'Your Prolific ID was captured automatically from the study link.'}
        </Alert>
      )}

      <TextInput
        aria-label="Participant identifier"
        placeholder={isTestSession ? 'TEST-your-name-or-run' : 'Prolific ID'}
        value={participantId}
        disabled={disabled || Boolean(capturedProlificId)}
        onChange={(event) => field.setValue(event.currentTarget.value)}
        onBlur={field.onBlur}
        error={error}
      />
    </Stack>
  );
}
