import { Anchor, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { PROLIFIC_DECLINED_URL, PROLIFIC_REDIRECT_DELAY_MS } from './prolificUrls';

export const RETURN_TO_PROLIFIC_LABEL = 'Return to Prolific';

export function isReturnToProlificButton(target: EventTarget | null): HTMLButtonElement | null {
  const element = target instanceof Element ? target : null;
  const button = element?.closest('button');
  if (!button || button.disabled) {
    return null;
  }

  const label = button.textContent?.replace(/\s+/g, ' ').trim();
  return label === RETURN_TO_PROLIFIC_LABEL ? button : null;
}

export function redirectToDeclinedProlific() {
  window.location.replace(PROLIFIC_DECLINED_URL);
}

export default function ProlificDeclinedRedirect() {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(PROLIFIC_REDIRECT_DELAY_MS / 1000));

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isReturnToProlificButton(event.target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      redirectToDeclinedProlific();
    };

    document.addEventListener('click', onClick, true);
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    const timeoutId = window.setTimeout(redirectToDeclinedProlific, PROLIFIC_REDIRECT_DELAY_MS);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.clearInterval(countdown);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Stack gap="md" p="md" maw={640}>
      <Title order={2}>You chose not to participate</Title>
      <Text>
        Because you did not agree to the consent form, this study will not continue and you will
        not be asked any further questions.
      </Text>
      <Text>
        Click
        {' '}
        <strong>{RETURN_TO_PROLIFIC_LABEL}</strong>
        {' '}
        below to go back to Prolific. If you do not click, you will be redirected automatically in
        {' '}
        {secondsLeft}
        {' '}
        {secondsLeft === 1 ? 'second' : 'seconds'}
        . This only records that you declined; it is not payment for completing the study.
      </Text>
      <Text size="sm" c="dimmed">
        If nothing happens,
        {' '}
        <Anchor href={PROLIFIC_DECLINED_URL}>open this Prolific link</Anchor>
        .
      </Text>
    </Stack>
  );
}
