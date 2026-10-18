import {
  Group, Radio, Stack, Text, Textarea,
} from '@mantine/core';
import { JsonValue } from '../../../parser/types';
import { CustomResponseParams, CustomResponseValidate } from '../../../store/types';
import {
  AGREEMENT_SCALE, commentHint, commentRequired, parseAgreement, validateAgreement,
} from './agreement';
import { SS } from './theme';

export const validate: CustomResponseValidate = (value) => validateAgreement(value);

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
    <Stack gap="xs" className="ss-page ss-rate">
      <Text fw={600} c={SS.ink}>{response.prompt}</Text>
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
              radius="lg"
              p="xs"
              style={{ flex: '1 1 120px' }}
            >
              <Stack gap={2} align="center">
                <Radio.Indicator color="blue" />
                <Text fw={700} size="sm" c={SS.primary}>{option.value}</Text>
                <Text size="xs" ta="center" c={SS.ink}>{option.label}</Text>
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
      {error ? <Text c={SS.error} size="sm">{error === 'Empty input' ? 'Please choose a rating.' : error}</Text> : null}
    </Stack>
  );
}
