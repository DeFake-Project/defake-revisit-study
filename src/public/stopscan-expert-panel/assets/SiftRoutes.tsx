import { useEffect, useMemo, useRef } from 'react';
import {
  Accordion, Badge, Box, Group, Stack, Text, Title, ThemeIcon,
} from '@mantine/core';
import { IconRoute, IconClipboardList } from '@tabler/icons-react';
import { StimulusParams } from '../../../store/types';
import { SIFT_INTRO, getCase, getSiftBlock } from './content';
import { PersonaCard } from './PersonaCard';
import { ReferenceHelpers } from './ReferenceHelpers';
import { useInteractionLog } from './useInteractionLog';

export type SiftRoutesParams = {
  caseId: 'case2' | 'case4';
};

export default function SiftRoutes({
  parameters,
  setAnswer,
}: StimulusParams<SiftRoutesParams>) {
  const block = useMemo(
    () => getSiftBlock(parameters.caseId),
    [parameters.caseId],
  );
  const character = useMemo(
    () => getCase(parameters.caseId).character,
    [parameters.caseId],
  );
  const { logEvent, ensureSeeded } = useInteractionLog(setAnswer);
  const openRef = useRef<string[]>([]);

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  return (
    <Box maw={860} mx="auto" p="md">
      <ReferenceHelpers onLog={logEvent} />

      <Stack gap="md">
        <div>
          <Badge color="blue" variant="light" mb={6}>How else this could have gone</Badge>
          <Title order={3}>{block.title}</Title>
          <Box mt="sm">
            <PersonaCard character={character} />
          </Box>
          <Text size="sm" mt="sm">{SIFT_INTRO}</Text>
        </div>

        <Box
          p="md"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
          }}
        >
          <Group gap="xs" mb={6}>
            <ThemeIcon size="sm" variant="light" color="gray" radius="xl">
              <IconClipboardList size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">What happened</Text>
          </Group>
          <Text size="sm">{block.encounter}</Text>
        </Box>

        <Accordion
          multiple
          variant="separated"
          radius="md"
          defaultValue={[]}
          onChange={(values) => {
            const opened = Array.isArray(values) ? values : [];
            opened.forEach((value) => {
              if (!openRef.current.includes(value)) {
                logEvent('accordion_open', `${block.caseId}_${value}`);
              }
            });
            openRef.current = opened;
          }}
        >
          {block.routes.map((route) => (
            <Accordion.Item key={route.id} value={route.id}>
              <Accordion.Control icon={<IconRoute size={16} />}>
                <Text fw={600}>{route.label}</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">{route.body}</Text>
                <Text size="xs" c="dimmed" mt="sm">
                  {`SIFT move used: ${route.moves.join('; ')}`}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>

        <Text size="sm" c="dimmed">
          Answer the route questions in the sidebar. Open each route above if you need to re-read it.
        </Text>
      </Stack>
    </Box>
  );
}
