import {
  Group, Paper, Stack, Text, Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export function SectionLabel({ children }: { children: string }) {
  return (
    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={6}>
      {children}
    </Text>
  );
}

export function ScenarioPanel({ title, scenario }: { title: string; scenario: string }) {
  return (
    <div>
      <SectionLabel>Scenario</SectionLabel>
      <Paper withBorder p="md" radius="md" bg="defakeTeal.0">
        <Stack gap="sm">
          <Title order={4}>{title}</Title>
          <Text size="sm">{scenario}</Text>
          <Group
            gap="sm"
            wrap="nowrap"
            align="flex-start"
            px="sm"
            py="xs"
            bg="yellow.1"
            style={{
              border: '1px solid var(--mantine-color-yellow-4)',
              borderRadius: 'var(--mantine-radius-sm)',
              opacity: 1,
            }}
          >
            <IconAlertCircle
              size={16}
              color="var(--mantine-color-yellow-7)"
              style={{ flexShrink: 0, marginTop: 3 }}
            />
            <Text size="sm" lh={1.4}>
              You do not need to open every section. Stop when you are confident enough to answer.
            </Text>
          </Group>
        </Stack>
      </Paper>
    </div>
  );
}
