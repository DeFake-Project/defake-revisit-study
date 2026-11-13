import { Anchor, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { StimulusParams } from '../../../store/types';
import { PROLIFIC_REDIRECT_DELAY_MS } from './prolificUrls';

type RedirectParameters = {
  title: string;
  body: string;
  url: string;
  buttonLabel: string;
};

export default function ExternalRedirect({ parameters }: StimulusParams<RedirectParameters>) {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(PROLIFIC_REDIRECT_DELAY_MS / 1000));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.location.replace(parameters.url);
    }, PROLIFIC_REDIRECT_DELAY_MS);
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(countdown);
    };
  }, [parameters.url]);

  return (
    <Stack maw={640} p="md" gap="md">
      <Title order={2}>{parameters.title}</Title>
      <Text>{parameters.body}</Text>
      <Text>
        You will be redirected in
        {' '}
        {secondsLeft}
        {' '}
        {secondsLeft === 1 ? 'second' : 'seconds'}
        .
      </Text>
      <Anchor href={parameters.url}>{parameters.buttonLabel}</Anchor>
    </Stack>
  );
}
