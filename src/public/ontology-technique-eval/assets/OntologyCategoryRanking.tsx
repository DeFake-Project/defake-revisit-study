import {
  ActionIcon, Badge, Button, Group, Paper, Stack, Text,
} from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconGripVertical } from '@tabler/icons-react';
import {
  useEffect, useMemo, useState,
} from 'react';
import type { JsonObject, JsonValue } from '../../../parser/types';
import type {
  CustomResponseParams, CustomResponseValidate,
} from '../../../store/types';

interface RankingParameters {
  options?: string[];
}

const FALLBACK_OPTIONS = [
  'Modality',
  'Forensic Goal & Task',
  'Search & Analysis Scope',
  'Evidentiary Features',
];

function getOptions(parameters?: RankingParameters): string[] {
  const options = parameters?.options;
  return Array.isArray(options)
    && options.length > 0
    && options.every((option) => typeof option === 'string')
    ? options
    : FALLBACK_OPTIONS;
}

export function rankingToValue(order: string[]): JsonObject {
  return Object.fromEntries(order.map((option, index) => [option, index.toString()]));
}

export function valueToRanking(value: JsonValue | null, options: string[]): string[] | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const entries = options.map((option) => {
    const position = value[option];
    return typeof position === 'string' && /^\d+$/.test(position)
      ? { option, position: Number(position) }
      : null;
  });

  if (entries.some((entry) => entry === null)) {
    return null;
  }

  const positions = entries.map((entry) => entry!.position).sort((a, b) => a - b);
  if (!positions.every((position, index) => position === index)) {
    return null;
  }

  return entries
    .sort((a, b) => a!.position - b!.position)
    .map((entry) => entry!.option);
}

export const validate: CustomResponseValidate = (value, _values, response) => {
  const options = getOptions(response.parameters as RankingParameters | undefined);
  return valueToRanking(value, options)
    ? null
    : 'Rank all four categories from most useful to least useful.';
};

export default function OntologyCategoryRanking({
  response,
  parameters,
  value,
  error,
  disabled,
  index,
  enumerateQuestions,
  field,
}: CustomResponseParams<RankingParameters, JsonObject>) {
  const options = useMemo(() => getOptions(parameters), [parameters]);
  const storedOrder = useMemo(() => valueToRanking(value, options), [options, value]);
  const [order, setOrder] = useState<string[]>(storedOrder ?? options);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(Boolean(storedOrder));

  useEffect(() => {
    if (storedOrder) {
      setOrder(storedOrder);
      setConfirmed(true);
    }
  }, [storedOrder]);

  const commitOrder = (nextOrder: string[]) => {
    setOrder(nextOrder);
    setConfirmed(true);
    field.setValue(rankingToValue(nextOrder));
    field.onBlur();
  };

  const moveItem = (from: number, to: number) => {
    if (disabled || from === to || to < 0 || to >= order.length) {
      return;
    }
    const nextOrder = [...order];
    const [moved] = nextOrder.splice(from, 1);
    nextOrder.splice(to, 0, moved);
    commitOrder(nextOrder);
  };

  return (
    <Stack gap="sm">
      <div>
        <Text fw={600}>
          {enumerateQuestions && `${index}. `}
          {response.prompt}
          {response.required !== false && <Text span c="red"> *</Text>}
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          Drag the rows into order, or use the arrow buttons. Position 1 is most useful.
        </Text>
      </div>

      <Paper withBorder radius="md" p="md" maw={720}>
        <Group justify="space-between" mb="xs">
          <Badge variant="light" color="defakeTeal">Most useful</Badge>
          <Text size="xs" c="dimmed">Drag to reorder</Text>
        </Group>

        <Stack gap="xs">
          {order.map((option, optionIndex) => (
            <Paper
              key={option}
              withBorder
              radius="sm"
              p="sm"
              draggable={!disabled}
              onDragStart={() => setDraggedIndex(optionIndex)}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedIndex != null) {
                  moveItem(draggedIndex, optionIndex);
                }
                setDraggedIndex(null);
              }}
              style={{
                cursor: disabled ? 'default' : 'grab',
                opacity: draggedIndex === optionIndex ? 0.55 : 1,
              }}
            >
              <Group wrap="nowrap">
                <IconGripVertical size={18} aria-hidden="true" />
                <Badge circle color="defakeTeal" variant="filled" size="lg">
                  {optionIndex + 1}
                </Badge>
                <Text fw={500} style={{ flex: 1 }}>{option}</Text>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={`Move ${option} up`}
                  disabled={disabled || optionIndex === 0}
                  onClick={() => moveItem(optionIndex, optionIndex - 1)}
                >
                  <IconArrowUp size={18} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={`Move ${option} down`}
                  disabled={disabled || optionIndex === order.length - 1}
                  onClick={() => moveItem(optionIndex, optionIndex + 1)}
                >
                  <IconArrowDown size={18} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Group justify="space-between" mt="xs">
          <Badge variant="light" color="gray">Least useful</Badge>
          {!disabled && !confirmed && (
            <Button size="xs" variant="light" onClick={() => commitOrder(order)}>
              Confirm this order
            </Button>
          )}
          {confirmed && <Text size="xs" c="defakeTeal.8">Ranking saved</Text>}
        </Group>
      </Paper>

      {error && <Text size="sm" c="red">{error}</Text>}
    </Stack>
  );
}
