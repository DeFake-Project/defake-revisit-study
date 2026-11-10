import { List, Stack, Text } from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import { tookPartInRoundOne } from './answers';
import { StudyHeading } from './chrome';

export default function AboutYou({ answers }: StimulusParams<Record<string, never>>) {
  if (tookPartInRoundOne(answers) === true) {
    return (
      <Stack className="ss-page" gap="md" maw={720} mx="auto" p="md">
        <StudyHeading eyebrow="Background" title="About you" icon="users" />
        <Text>
          You completed the Round 1 questionnaire, so we already have your background answers. Continue to the revised framework.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack className="ss-page" gap="md" maw={720} mx="auto" p="md">
      <StudyHeading eyebrow="Background" title="About you" icon="users" />
      <Text>
        You did not complete Round 1, so we do not have your background answers.
      </Text>
      <Text>Please answer the same four short questions used in Round 1. They ask about:</Text>
      <List>
        <List.Item>your main area of professional work;</List.Item>
        <List.Item>other related areas you work in;</List.Item>
        <List.Item>your approximate years of experience, given as a range; and</List.Item>
        <List.Item>how well you know existing verification methods, including SIFT and lateral reading.</List.Item>
      </List>
      <Text>
        These questions help us understand how professional background may affect answers. We do not ask for your name, institution, or job title. You may skip any question.
      </Text>
      <Text fw={600}>Estimated time: about 2 minutes.</Text>
    </Stack>
  );
}
