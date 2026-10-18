import { List, Stack, Text, Title } from '@mantine/core';

export default function AcknowledgmentPage() {
  return (
    <Stack gap="md" maw={780} mx="auto" p="md">
      <div>
        <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.08em' }}>Optional</Text>
        <Title order={2} mt={4}>Being named in the acknowledgments</Title>
      </div>
      <Text>
        Some experts in the first round asked whether they could be credited for their contribution. You can choose to be listed by name in the acknowledgments of publications from this study, as a member of the expert panel.
      </Text>
      <List spacing="xs">
        <List.Item>Named panelists are listed alphabetically, without field, years of experience, or participant code.</List.Item>
        <List.Item>No publication will attribute a rating, response, or quotation to a named person.</List.Item>
        <List.Item>The name you give is stored with your responses in this round. Members of the research team will be able to see it.</List.Item>
        <List.Item>If you change your mind, email the Principal Investigator at john.sohrawardi@rit.edu.</List.Item>
      </List>
      <Text size="sm" c="dimmed">
        Leaving the question blank, or choosing not to be named, means you will not be named. The choice is below.
      </Text>
    </Stack>
  );
}
