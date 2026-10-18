import {
  Badge, Box, Stack, Text, Title,
} from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import { agreementLabel, parseAgreement } from './agreement';
import { collectAnswers } from './answers';
import { parseAcknowledgment } from './AcknowledgmentChoice';
import { RATING_ITEMS, pageById, ROUND_PAGES } from './pages';

function pillColor(rating: number | null): string {
  if (rating == null) {
    return 'gray';
  }
  if (rating <= 2) {
    return 'red';
  }
  if (rating === 3) {
    return 'yellow';
  }
  return 'green';
}

export default function ReviewAnswers({ answers }: StimulusParams<Record<string, never>>) {
  const saved = collectAnswers(answers);
  const rated = RATING_ITEMS.filter((item) => parseAgreement(saved[item.id]).rating != null).length;
  const openFinal = typeof saved.open_final === 'string' ? saved.open_final.trim() : '';
  const acknowledgment = parseAcknowledgment(saved.acknowledgment);

  return (
    <Stack gap="md" maw={780} mx="auto" p="md">
      <div>
        <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.08em' }}>Before you submit</Text>
        <Title order={2} mt={4}>Review your answers</Title>
      </div>
      <Text>
        <Text span fw={700}>{`${rated}`}</Text>
        {` of ${RATING_ITEMS.length} changes rated. Use Back to change any answer.`}
      </Text>
      <Stack gap="sm">
        {RATING_ITEMS.map((item) => {
          const parsed = parseAgreement(saved[item.id]);
          const page = ROUND_PAGES.find((candidate) => candidate.ratings.some((rating) => rating.id === item.id));
          return (
            <Box key={item.id} pb="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
              <Text size="xs" tt="uppercase" c="dimmed" fw={600}>{page?.big || page?.title || pageById(page?.id || '')?.title}</Text>
              <Box style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <Text size="sm">{item.prompt}</Text>
                <Badge color={pillColor(parsed.rating)} variant={parsed.rating == null ? 'outline' : 'filled'}>
                  {agreementLabel(parsed.rating)}
                </Badge>
              </Box>
              {parsed.comment.trim() ? <Text size="sm" c="dimmed" mt={4}>{parsed.comment.trim()}</Text> : null}
            </Box>
          );
        })}
      </Stack>
      {openFinal ? (
        <Text size="sm">
          <Text span fw={600}>Your final comment. </Text>
          {openFinal}
        </Text>
      ) : null}
      <Text size="sm">
        <Text span fw={600}>Acknowledgments. </Text>
        {acknowledgment.named === 'yes'
          ? `You asked to be named${acknowledgment.name.trim() ? ` as ${acknowledgment.name.trim()}` : ''}${acknowledgment.affiliation.trim() ? `, ${acknowledgment.affiliation.trim()}` : ''}.`
          : 'You will not be named.'}
      </Text>
    </Stack>
  );
}
