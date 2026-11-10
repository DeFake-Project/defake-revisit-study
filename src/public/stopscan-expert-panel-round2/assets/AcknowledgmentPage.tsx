import { List, Stack, Text } from '@mantine/core';
import { StudyHeading } from './chrome';

export default function AcknowledgmentPage() {
  return (
    <Stack className="ss-page" gap="md" maw={780} mx="auto" p="md">
      <StudyHeading eyebrow="Optional" title="Being named in the acknowledgments" icon="badge" />
      <Text>
        Some Round 1 experts asked to receive credit for their work. You may choose to be named as a member of the expert panel in study publications.
      </Text>
      <List spacing="xs">
        <List.Item>We list named panel members in alphabetical order.</List.Item>
        <List.Item>We do not list their field, years of experience, or participant code.</List.Item>
        <List.Item>We do not connect any rating, answer, or quotation to a named person.</List.Item>
        <List.Item>We store the name you give with your answers from this round. The research team can see it.</List.Item>
        <List.Item>If you change your mind, email the Principal Investigator at john.sohrawardi@rit.edu.</List.Item>
      </List>
      <Text size="sm" c="dimmed">
        If you leave the question blank or choose no, we will not name you.
      </Text>
    </Stack>
  );
}
