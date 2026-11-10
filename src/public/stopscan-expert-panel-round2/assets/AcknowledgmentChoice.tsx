import {
  Radio, Stack, Text, TextInput,
} from '@mantine/core';
import { JsonValue } from '../../../parser/types';
import { CustomResponseParams } from '../../../store/types';

export type AcknowledgmentAnswer = {
  named: '' | 'yes' | 'no';
  name: string;
  affiliation: string;
};

export const ACK_YES = 'yes';
export const ACK_NO = 'no';

export function parseAcknowledgment(value: JsonValue | null | undefined): AcknowledgmentAnswer {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { named: '', name: '', affiliation: '' };
  }
  const named = value.named === ACK_YES || value.named === ACK_NO ? value.named : '';
  return {
    named,
    name: typeof value.name === 'string' ? value.name : '',
    affiliation: typeof value.affiliation === 'string' ? value.affiliation : '',
  };
}

export default function AcknowledgmentChoice({
  value,
  disabled,
  field,
}: CustomResponseParams) {
  const current = parseAcknowledgment(value);

  const update = (partial: Partial<AcknowledgmentAnswer>) => {
    field.setValue({ ...current, ...partial } as unknown as JsonValue);
    field.onBlur();
  };

  return (
    <Stack gap="sm">
      <Radio.Group
        label="Would you like to be named in the acknowledgments?"
        description="This is optional. If you leave it blank or choose no, we will not name you."
        value={current.named}
        onChange={(next) => update({ named: next === ACK_YES ? ACK_YES : ACK_NO })}
      >
        <Stack gap="xs" mt="xs">
          <Radio value={ACK_YES} label="Yes, list me as a member of the expert panel" disabled={disabled} />
          <Radio value={ACK_NO} label="No, do not name me" disabled={disabled} />
        </Stack>
      </Radio.Group>
      {current.named === ACK_YES ? (
        <Stack gap="sm">
          <TextInput
            label="How should your name appear?"
            description="We will not name you if you leave this blank."
            value={current.name}
            onChange={(event) => update({ name: event.currentTarget.value })}
            onBlur={() => field.onBlur()}
            disabled={disabled}
          />
          <TextInput
            label="Affiliation to list"
            description="Optional."
            value={current.affiliation}
            onChange={(event) => update({ affiliation: event.currentTarget.value })}
            onBlur={() => field.onBlur()}
            disabled={disabled}
          />
          <Text size="sm" c="dimmed">
            We list names in alphabetical order. We do not list your field, years of experience, or participant code. We do not connect any rating, answer, or quotation to your name. The research team can see your name with your answers from this round.
          </Text>
        </Stack>
      ) : null}
    </Stack>
  );
}
