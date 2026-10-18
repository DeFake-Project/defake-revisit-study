import {
  Box, Stack, Text, Title,
} from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import { STOPSCAN_OVERVIEW } from '../../stopscan-expert-panel/assets/content';
import {
  StopscanCoverage, StopscanElements, StopscanOutcomeModel,
} from '../../stopscan-expert-panel/assets/StopscanModelSummary';
import { tookPartInRoundOne } from './answers';
import { StudyHeading } from './chrome';
import { SS } from './theme';

export const ORIGINAL_FRAMEWORK_INTRO = 'You did not take part in the first round, so this page shows the STOP&SCAN version those experts reviewed. The pages after this one show the revised framework, one change at a time. You do not need to memorize this version.';

export default function OriginalFramework({ answers }: StimulusParams<Record<string, never>>) {
  if (tookPartInRoundOne(answers) === true) {
    return (
      <Stack className="ss-page" gap="md" maw={720} mx="auto" p="md">
        <StudyHeading eyebrow="First-round version" title="STOP&SCAN, as the first round reviewed it" icon="book" />
        <Text>
          You completed the first-round questionnaire, so you have already seen this version. Continue to the revised framework.
        </Text>
      </Stack>
    );
  }

  return (
    <Box className="ss-page ss-original" maw={820} mx="auto" p="md">
      <Stack gap="lg">
        <div>
          <StudyHeading eyebrow="First-round version" title="STOP&SCAN, as the first round reviewed it" icon="book" />
          <Text mt="sm">{ORIGINAL_FRAMEWORK_INTRO}</Text>
        </div>

        <Box p="md" style={{ background: SS.primaryFixed, border: `1px solid ${SS.hairline}`, borderRadius: 24 }}>
          <Title order={3} mb="sm">What STOP&SCAN does</Title>
          <Text mb="md">{STOPSCAN_OVERVIEW.intro}</Text>
          <StopscanElements />
        </Box>

        <Box
          p="md"
          style={{
            background: SS.white, border: `1px solid ${SS.hairline}`, borderRadius: 24, boxShadow: SS.shadow,
          }}
        >
          <Title order={4} mb="xs">Why this order is used</Title>
          {STOPSCAN_OVERVIEW.orderExplanation.map((paragraph) => (
            <Text key={paragraph.slice(0, 40)} size="sm" mb="sm">{paragraph}</Text>
          ))}
        </Box>

        <Box
          p="md"
          style={{
            background: SS.white, border: `1px solid ${SS.hairline}`, borderRadius: 24, boxShadow: SS.shadow,
          }}
        >
          <Title order={4} mb="xs">Possible outcomes</Title>
          <StopscanOutcomeModel />
        </Box>

        <Box
          p="md"
          style={{
            background: SS.white, border: `1px solid ${SS.hairline}`, borderRadius: 24, boxShadow: SS.shadow,
          }}
        >
          <StopscanCoverage />
        </Box>
      </Stack>
    </Box>
  );
}
