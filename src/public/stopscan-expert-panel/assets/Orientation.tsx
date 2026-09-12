import { useEffect, useRef } from 'react';
import {
  Accordion, Box, Group, Stack, Text, ThemeIcon, Title,
} from '@mantine/core';
import {
  IconBook2,
  IconSearch,
  IconShieldExclamation,
} from '@tabler/icons-react';
import { StimulusParams } from '../../../store/types';
import { REFERENCE_CARDS, STOPSCAN_OVERVIEW } from './content';
import { StopscanCoverage, StopscanElements, StopscanOutcomeModel } from './StopscanModelSummary';
import { useInteractionLog } from './useInteractionLog';

export default function Orientation({ setAnswer }: StimulusParams<Record<string, never>>) {
  const { logEvent, ensureSeeded } = useInteractionLog(setAnswer);
  const openRef = useRef<string[]>([]);

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  return (
    <Box maw={820} mx="auto" p="md">
      <Stack gap="lg">
        <div>
          <Group gap="xs" mb={6}>
            <ThemeIcon color="teal" variant="light" radius="xl">
              <IconBook2 size={18} />
            </ThemeIcon>
            <Title order={2}>Before you begin</Title>
          </Group>
          <Text c="dimmed" size="sm">
            First, we will explain STOP&SCAN. Then you will review four case studies of how it might be used.
          </Text>
        </div>

        <Box
          p="md"
          style={{
            background: 'linear-gradient(160deg, #f4fbf8 0%, #eef6f9 100%)',
            border: '1px solid #d5e6df',
            borderRadius: 12,
          }}
        >
          <Title order={3} mb="sm">What STOP&SCAN does</Title>
          <Text mb="md">{STOPSCAN_OVERVIEW.intro}</Text>
          <StopscanElements />
        </Box>

        <Box
          p="md"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            background: '#fff',
          }}
        >
          <Title order={4} mb="xs">Why this order is used</Title>
          {STOPSCAN_OVERVIEW.orderExplanation.map((paragraph) => (
            <Text key={paragraph.slice(0, 32)} size="sm" mb="sm">{paragraph}</Text>
          ))}
        </Box>

        <Box
          p="md"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            background: '#fff',
          }}
        >
          <Title order={4} mb="xs">Possible outcomes</Title>
          <StopscanOutcomeModel />
        </Box>

        <Box
          p="md"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            background: '#fff',
          }}
        >
          <StopscanCoverage />
        </Box>

        <Box
          p="md"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            background: '#fff',
          }}
        >
          <Title order={4} mb="sm">How this study works</Title>
          <Text size="sm" mb="sm">{STOPSCAN_OVERVIEW.progressive}</Text>
          <Text size="sm" mb="sm">{STOPSCAN_OVERVIEW.freezeNote}</Text>
          <Text size="sm">{STOPSCAN_OVERVIEW.roleplayNote}</Text>
        </Box>

        <div>
          <Title order={4} mb="xs">For your reference</Title>
          <Text size="sm" c="dimmed" mb="sm">
            These summaries stay available throughout. Open them if you would like a reminder.
          </Text>
          <Accordion
            multiple
            variant="separated"
            radius="md"
            defaultValue={[]}
            onChange={(values) => {
              const opened = Array.isArray(values) ? values : [];
              opened.forEach((value) => {
                if (!openRef.current.includes(value)) {
                  logEvent('accordion_open', value === 'sift' ? 'card_sift' : 'card_detector');
                }
              });
              openRef.current = opened;
            }}
          >
            <Accordion.Item value="sift">
              <Accordion.Control icon={<IconSearch size={16} />}>
                {REFERENCE_CARDS.sift.title}
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">{REFERENCE_CARDS.sift.body}</Text>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="detector">
              <Accordion.Control icon={<IconShieldExclamation size={16} />}>
                {REFERENCE_CARDS.detector.title}
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">{REFERENCE_CARDS.detector.body}</Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      </Stack>
    </Box>
  );
}
