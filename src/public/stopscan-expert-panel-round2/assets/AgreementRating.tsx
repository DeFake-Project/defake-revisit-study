import {
  Group, Radio, Stack, Text, Textarea,
} from '@mantine/core';
import { JsonValue } from '../../../parser/types';
import { CustomResponseParams, CustomResponseValidate } from '../../../store/types';
import {
  AGREEMENT_SCALE, commentHint, commentRequired, parseAgreement, validateAgreement,
} from './agreement';

export const validate: CustomResponseValidate = (value) => validateAgreement(value);

function scaleColor(value: number): string {
  if (value <= 2) {
    return 'red';
  }
  if (value === 3) {
    return 'yellow';
  }
  return 'green';
}

export default function AgreementRating({
  response,
  value,
  error,
  disabled,
  field,
}: CustomResponseParams) {
  const current = parseAgreement(value);
  const hint = commentHint(current.rating);

  const update = (partial: { rating?: number; comment?: string }) => {
    const next = {
      rating: partial.rating ?? current.rating,
      comment: partial.comment ?? current.comment,
    };
    field.setValue(next as unknown as JsonValue);
    field.onBlur();
  };

  return (
    <Stack gap="xs">
      <Text fw={600}>{response.prompt}</Text>
      <Radio.Group
        value={current.rating == null ? '' : String(current.rating)}
        onChange={(next) => update({ rating: Number(next) })}
        aria-label={response.prompt}
      >
        <Group grow align="stretch" gap="xs" preventGrowOverflow={false} wrap="wrap">
          {AGREEMENT_SCALE.map((option) => (
            <Radio.Card
              key={option.value}
              value={String(option.value)}
              disabled={disabled}
              radius="md"
              p="xs"
              style={{ flex: '1 1 120px' }}
            >
              <Stack gap={2} align="center">
                <Radio.Indicator color={scaleColor(option.value)} />
                <Text fw={600} size="sm">{option.value}</Text>
                <Text size="xs" ta="center">{option.label}</Text>
              </Stack>
            </Radio.Card>
          ))}
        </Group>
      </Radio.Group>
      <Textarea
        label={hint}
        description={commentRequired(current.rating) ? 'Required for this rating.' : undefined}
        value={current.comment}
        onChange={(event) => update({ comment: event.currentTarget.value })}
        onBlur={() => field.onBlur()}
        disabled={disabled}
        minRows={2}
        autosize
        required={commentRequired(current.rating)}
      />
      {error ? <Text c="red" size="sm">{error === 'Empty input' ? 'Please choose a rating.' : error}</Text> : null}
    </Stack>
  );
}
