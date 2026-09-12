import {
  Box, Group, List, Stack, Text, ThemeIcon, Title,
} from '@mantine/core';
import {
  IconFileSearch,
  IconLink,
  IconPlayerPause,
  IconRefresh,
  IconScale,
} from '@tabler/icons-react';
import { STOPSCAN_OVERVIEW } from './content';

const ELEMENT_ICONS = {
  stop: IconPlayerPause,
  source: IconLink,
  content: IconFileSearch,
  alignment: IconScale,
  reflect: IconRefresh,
} as const;

export function StopscanElements({ compact = false }: { compact?: boolean }) {
  return (
    <Stack gap="sm">
      {STOPSCAN_OVERVIEW.elements.map((el) => {
        const Icon = ELEMENT_ICONS[el.id as keyof typeof ELEMENT_ICONS];
        return (
          <Group key={el.id} align="flex-start" wrap="nowrap" gap="sm">
            <ThemeIcon variant={compact ? 'light' : 'filled'} color="teal" radius="xl">
              <Icon size={16} />
            </ThemeIcon>
            <Box>
              <Text fw={compact ? 600 : 700} size={compact ? 'sm' : undefined}>{el.title}</Text>
              <Text size="sm">{el.body}</Text>
              {el.examples ? <Text size="xs" c="dimmed" mt={2}>{el.examples}</Text> : null}
            </Box>
          </Group>
        );
      })}
    </Stack>
  );
}

export function StopscanOutcomeModel() {
  return (
    <Stack gap="sm">
      <Text size="sm">{STOPSCAN_OVERVIEW.outcomeIntro}</Text>
      <div>
        <Text fw={600} size="sm" mb={4}>What the checks returned</Text>
        <List spacing="xs" size="sm">
          {STOPSCAN_OVERVIEW.evidenceStates.map((state) => (
            <List.Item key={state.id}>
              <Text span fw={700}>{state.title}.</Text>
              {' '}
              {state.body}
            </List.Item>
          ))}
        </List>
      </div>
      <div>
        <Text fw={600} size="sm" mb={4}>What to do about it</Text>
        {STOPSCAN_OVERVIEW.encounterTypes.map((encounter) => (
          <Box key={encounter.id} mb="sm">
            <Text size="sm">
              <Text span fw={700}>{encounter.title}.</Text>
              {' '}
              {encounter.body}
            </Text>
            <List size="sm" withPadding>
              <List.Item>{`Confirmed → ${encounter.actions.confirmed}`}</List.Item>
              <List.Item>{`Unresolved → ${encounter.actions.unresolved}`}</List.Item>
              <List.Item>{`Contradicted → ${encounter.actions.contradicted}`}</List.Item>
            </List>
          </Box>
        ))}
      </div>
      <Text size="sm" fw={500}>{STOPSCAN_OVERVIEW.actionRule}</Text>
      <Text size="sm">{STOPSCAN_OVERVIEW.reporting}</Text>
    </Stack>
  );
}

export function StopscanCoverage() {
  return (
    <div>
      <Title order={5}>{STOPSCAN_OVERVIEW.coverageRule.title}</Title>
      {STOPSCAN_OVERVIEW.coverageRule.paragraphs.map((paragraph) => (
        <Text key={paragraph.slice(0, 32)} size="sm" mt="xs">{paragraph}</Text>
      ))}
    </div>
  );
}
