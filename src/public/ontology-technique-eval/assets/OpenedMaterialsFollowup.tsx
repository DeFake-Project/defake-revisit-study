import { List, Stack, Text, Textarea } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import type { JsonObject } from '../../../parser/types';
import { useStoreSelector } from '../../../store/store';
import type {
  CustomResponseParams, CustomResponseValidate,
} from '../../../store/types';
import {
  collectOpenedMaterialScreens,
  formatOpenedScreenLine,
  isOpenedMaterialsAnswer,
  openedMaterialsAnswer,
  openedScreensIntro,
  screensToDisplay,
} from './openedMaterials';

export const validate: CustomResponseValidate = () => null;

export default function OpenedMaterialsFollowup({
  response,
  value,
  error,
  disabled,
  index,
  enumerateQuestions,
  field,
}: CustomResponseParams<Record<string, never>, JsonObject>) {
  const answers = useStoreSelector((state) => state.answers);
  const screens = useMemo(() => collectOpenedMaterialScreens(answers), [answers]);
  const visibleScreens = useMemo(() => screensToDisplay(screens), [screens]);
  const note = isOpenedMaterialsAnswer(value) ? value.note : '';

  useEffect(() => {
    const next = openedMaterialsAnswer(screens, note);
    if (isOpenedMaterialsAnswer(value)
      && value.note === next.note
      && JSON.stringify(value.screens) === JSON.stringify(next.screens)) {
      return;
    }
    field.setValue(next);
  }, [field, note, screens, value]);

  if (screens.length === 0) {
    return null;
  }

  return (
    <Stack gap="sm">
      <div>
        <Text fw={600}>
          {enumerateQuestions && `${index}. `}
          {response.prompt}
          {response.required !== false && <Text span c="red"> *</Text>}
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          {openedScreensIntro(screens.length)}
        </Text>
      </div>

      <List spacing="xs" size="sm" maw={720}>
        {visibleScreens.map((screen) => (
          <List.Item key={screen.componentName}>
            {formatOpenedScreenLine(screen)}
          </List.Item>
        ))}
      </List>

      <Textarea
        placeholder="A sentence or two is enough."
        autosize
        minRows={3}
        maxRows={8}
        value={note}
        disabled={disabled}
        error={error}
        onChange={(event) => field.setValue(openedMaterialsAnswer(screens, event.currentTarget.value))}
        onBlur={() => field.onBlur()}
      />
    </Stack>
  );
}
