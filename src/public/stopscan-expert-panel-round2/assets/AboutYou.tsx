import { List, Stack, Text, Title } from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import { tookPartInRoundOne } from './answers';

export default function AboutYou({ answers }: StimulusParams<Record<string, never>>) {
  if (tookPartInRoundOne(answers) === true) {
    return (
      <Stack gap="md" maw={720} mx="auto" p="md">
        <Title order={2}>About you</Title>
        <Text>
          You completed the first-round questionnaire, so we already have these background answers. Continue to return to the revised framework.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md" maw={720} mx="auto" p="md">
      <Title order={2}>About you</Title>
      <Text>
        You did not take part in the first round, so we do not already have these answers.
      </Text>
      <Text>Please answer the same four short questions the first round used. They ask about:</Text>
      <List>
        <List.Item>your main area of professional work;</List.Item>
        <List.Item>other related areas you work in;</List.Item>
        <List.Item>your approximate years of experience, given as a range; and</List.Item>
        <List.Item>your familiarity with existing verification methods, including SIFT or lateral reading.</List.Item>
      </List>
      <Text>
        These questions help us understand how professional background may shape responses. We do not ask for your name, institution, or job title. You may skip any of them.
      </Text>
      <Text fw={600}>Estimated time: about 2 minutes.</Text>
    </Stack>
  );
}
