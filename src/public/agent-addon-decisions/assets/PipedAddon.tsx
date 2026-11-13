import { Box, Text, Title } from '@mantine/core';
import { ParticipantData } from '../../../parser/types';
import { StimulusParams } from '../../../store/types';
import { findResponseValue } from './answerLookup';

export default function PipedAddon({ answers }: StimulusParams<Record<string, never>>) {
  const description = findResponseValue(answers as ParticipantData['answers'], 'e6');

  return (
    <Box maw={720} p="md">
      <Title order={3}>Earlier you described the most recent add-on you set up</Title>
      <Text mt="md" p="md" bg="gray.0" style={{ borderLeft: '4px solid var(--mantine-color-blue-6)' }}>
        {description || 'You did not enter a description.'}
      </Text>
    </Box>
  );
}
