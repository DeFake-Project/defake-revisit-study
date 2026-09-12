import { useEffect, useMemo } from 'react';
import {
  Badge, Box, Divider, Group, Stack, Table, Text, Title, ThemeIcon,
} from '@mantine/core';
import {
  IconClipboardList, IconQuote, IconBulb, IconArrowRight, IconCalendar,
} from '@tabler/icons-react';
import { StimulusParams } from '../../../store/types';
import {
  ACTION_CATEGORY_LABEL, CaseStepContent, getCase,
} from './content';
import { ReferenceHelpers } from './ReferenceHelpers';
import { useInteractionLog } from './useInteractionLog';

export type CaseStimulusParams = {
  caseId: string;
  /** When set, shows that step. When omitted, shows the after-case recap. */
  stepKey?: 'source' | 'content' | 'alignment' | 'reflect';
  mode: 'step' | 'after';
};

const SUPPORT_LABEL: Record<string, { text: string; color: string }> = {
  toward: { text: 'Supported the claim', color: 'teal' },
  against: { text: 'Undermined the claim', color: 'orange' },
  neither: { text: 'Neither', color: 'gray' },
};

const STATE_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  contradicted: 'Contradicted',
  unresolved: 'Unresolved',
};

function StepPanel({
  step, current, characterName,
}: { step: CaseStepContent; current: boolean; characterName: string }) {
  return (
    <Box
      p="md"
      style={{
        background: current
          ? 'linear-gradient(160deg, #f3faf7 0%, #f7fbfc 100%)'
          : '#f8fafc',
        border: current ? '1px solid #d5e6df' : '1px solid #e2e8f0',
        borderRadius: 12,
        opacity: current ? 1 : 0.92,
      }}
    >
      <Group gap="xs" mb={10} justify="space-between">
        <Group gap="xs">
          <ThemeIcon size="sm" variant={current ? 'filled' : 'light'} color="teal" radius="xl">
            <IconQuote size={14} />
          </ThemeIcon>
          <Text fw={700}>{`Step ${step.stepIndex} of 4 — ${step.label}`}</Text>
        </Group>
        <Badge size="xs" variant={current ? 'light' : 'outline'} color={current ? 'teal' : 'gray'}>
          {current ? 'Current step' : 'Earlier step'}
        </Badge>
      </Group>

      <Group gap={6} align="flex-start" mb={10} wrap="nowrap">
        <ThemeIcon size="sm" variant="light" color="grape" radius="xl" mt={2}>
          <IconBulb size={13} />
        </ThemeIcon>
        <Text size="sm" fs="italic" c="#4a3a5a">
          {`${characterName}: “${step.thought}”`}
        </Text>
      </Group>

      <Stack gap={8} mb={10}>
        {step.actions.map((action) => (
          <Box
            key={action.did}
            pl={10}
            style={{ borderLeft: '3px solid #cfe0f2' }}
          >
            <Badge size="xs" variant="light" color="blue" mb={4}>
              {ACTION_CATEGORY_LABEL[action.category]}
            </Badge>
            <Text size="sm">{action.did}</Text>
            <Group gap={5} wrap="nowrap" mt={2} align="flex-start">
              <ThemeIcon size={14} variant="transparent" color="gray">
                <IconArrowRight size={12} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">{action.returned}</Text>
            </Group>
          </Box>
        ))}
      </Stack>

      <Divider mb={8} />
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>What this step shows</Text>
      <Text size="sm" c="#4a5a63">{step.narrator}</Text>
    </Box>
  );
}

export default function CaseStimulus({
  parameters, setAnswer,
}: StimulusParams<CaseStimulusParams>) {
  const { caseId, stepKey, mode } = parameters;
  const caseContent = useMemo(() => getCase(caseId), [caseId]);

  const visibleSteps = useMemo(() => {
    if (mode === 'after') {
      return caseContent.steps;
    }
    if (!stepKey) {
      return [];
    }
    const idx = caseContent.steps.findIndex((s) => s.key === stepKey);
    return caseContent.steps.slice(0, idx + 1);
  }, [caseContent, mode, stepKey]);

  const { logEvent, ensureSeeded } = useInteractionLog(setAnswer);
  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const isFirstPageOfCase = mode === 'step' && stepKey === 'source';

  return (
    <Box maw={880} mx="auto" p="md">
      <ReferenceHelpers onLog={logEvent} />

      <Stack gap="md">
        <div>
          <Group gap="xs" mb={4}>
            <Badge color="teal" variant="light">{caseContent.shortLabel}</Badge>
            {mode === 'step' && stepKey && (
              <Badge color="gray" variant="outline">
                Reviewing:
                {' '}
                {caseContent.steps.find((s) => s.key === stepKey)?.label}
              </Badge>
            )}
            {mode === 'after' && <Badge color="gray" variant="outline">After the case</Badge>}
          </Group>
          <Title order={3}>{caseContent.title}</Title>
          <Group gap={5} mt={4}>
            <ThemeIcon size={15} variant="transparent" color="gray"><IconCalendar size={13} /></ThemeIcon>
            <Text size="xs" c="dimmed">
              {`Evidence as it stood on ${caseContent.asOf}. ${caseContent.character.name} ${caseContent.character.blurb}.`}
            </Text>
          </Group>
        </div>

        <Box p="md" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <Group gap="xs" mb={6}>
            <ThemeIcon size="sm" variant="light" color="gray" radius="xl">
              <IconClipboardList size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">What happened</Text>
          </Group>
          <Text size="sm">{caseContent.encounter}</Text>

          {(isFirstPageOfCase || mode === 'after') && (
            <>
              <Divider my={10} />
              <Text fw={600} size="sm" mb={4}>Before checking anything (STOP)</Text>
              <Text size="sm" fs="italic">{caseContent.stopReaction}</Text>
            </>
          )}
        </Box>

        {visibleSteps.map((step) => (
          <StepPanel
            key={step.key}
            step={step}
            current={mode === 'step' && step.key === stepKey}
            characterName={caseContent.character.name}
          />
        ))}

        {mode === 'after' && (
          <Box p="md" style={{ border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
            <Text fw={700} mb={4}>{`Where ${caseContent.character.name} ended up`}</Text>
            <Group gap="xs" mb={8}>
              <Badge color="teal" variant="filled">
                Evidence state:
                {' '}
                {STATE_LABEL[caseContent.outcome.state]}
              </Badge>
              <Badge color="blue" variant="light">
                Action:
                {' '}
                {caseContent.outcome.action}
              </Badge>
            </Group>
            <Text size="sm" mb="md">{caseContent.outcome.rationale}</Text>

            <Text fw={600} size="sm" mb={6}>What each action returned</Text>
            <Box style={{ overflowX: 'auto' }}>
              <Table striped withTableBorder fz="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '18%' }}>Step</Table.Th>
                    <Table.Th style={{ width: '52%' }}>Action</Table.Th>
                    <Table.Th style={{ width: '30%' }}>Effect on the claim</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {caseContent.steps.flatMap((s) => s.actions.map((action) => (
                    <Table.Tr key={`${s.key}-${action.did}`}>
                      <Table.Td>{s.label}</Table.Td>
                      <Table.Td>{action.did}</Table.Td>
                      <Table.Td>
                        <Badge size="xs" variant="light" color={SUPPORT_LABEL[action.support].color}>
                          {SUPPORT_LABEL[action.support].text}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  )))}
                </Table.Tbody>
              </Table>
            </Box>

            <Divider my="md" />
            <Text fw={600} mb={4}>{`What if ${caseContent.character.name} had stopped earlier?`}</Text>
            <Text size="sm" c="dimmed">
              Rank the five elements below, then answer the remaining questions in the sidebar.
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
