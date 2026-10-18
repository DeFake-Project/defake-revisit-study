import {
  Badge, Box, Stack, Text,
} from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import { agreementLabel, parseAgreement } from './agreement';
import { collectAnswers } from './answers';
import { StudyHeading } from './chrome';
import { parseAcknowledgment } from './AcknowledgmentChoice';
import { RATING_ITEMS, pageById, ROUND_PAGES } from './pages';
import { SS, ratingTone } from './theme';

export default function ReviewAnswers({ answers }: StimulusParams<Record<string, never>>) {
  const saved = collectAnswers(answers);
  const rated = RATING_ITEMS.filter((item) => parseAgreement(saved[item.id]).rating != null).length;
  const openFinal = typeof saved.open_final === 'string' ? saved.open_final.trim() : '';
  const acknowledgment = parseAcknowledgment(saved.acknowledgment);

  return (
    <Stack className="ss-page" gap="md" maw={780} mx="auto" p="md">
      <StudyHeading eyebrow="Before you submit" title="Review your answers" icon="clipboard" />
      <Text>
        <Text span fw={700}>{`${rated}`}</Text>
        {` of ${RATING_ITEMS.length} changes rated. Use Back to change any answer.`}
      </Text>
      <Stack gap="sm">
        {RATING_ITEMS.map((item) => {
          const parsed = parseAgreement(saved[item.id]);
          const page = ROUND_PAGES.find((candidate) => candidate.ratings.some((rating) => rating.id === item.id));
          return (
            <Box key={item.id} pb="xs" style={{ borderBottom: `1px solid ${SS.hairline}` }}>
              <Text size="xs" tt="uppercase" c="dimmed" fw={600}>{page?.big || page?.title || pageById(page?.id || '')?.title}</Text>
              <Box style={{
                display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start',
              }}
              >
                <Text size="sm">{item.prompt}</Text>
                <Badge variant={parsed.rating == null ? 'outline' : 'filled'} style={ratingTone(parsed.rating)}>
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
