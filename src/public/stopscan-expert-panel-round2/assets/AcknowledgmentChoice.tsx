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
        description="Optional. If you leave this blank, or choose not to be named, you will not be named."
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
            label="Name as you would like it to appear"
            description="If you leave this blank, you will not be named."
            value={current.name}
            onChange={(event) => update({ name: event.currentTarget.value })}
            onBlur={() => field.onBlur()}
            disabled={disabled}
          />
          <TextInput
            label="Affiliation, if you want it listed"
            description="Optional."
            value={current.affiliation}
            onChange={(event) => update({ affiliation: event.currentTarget.value })}
            onBlur={() => field.onBlur()}
            disabled={disabled}
          />
          <Text size="sm" c="dimmed">
            Named panelists are listed alphabetically, without field, years of experience, or participant code. No rating, response, or quotation is attributed to a named person. The research team will be able to see the name you give alongside your responses in this round.
          </Text>
        </Stack>
      ) : null}
    </Stack>
  );
}
