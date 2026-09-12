import { Alert, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect } from 'react';
import type { StimulusParams } from '../../../store/types';
import { ScenarioPanel, SectionLabel } from './ScenarioPanel';
import { getAttentionAVignette, getTechnique } from './studyBank';
import { TechniqueCard } from './TechniqueCard';
import type { DescriptionFormat, ProvenanceState } from './types';
import { useInteractionProvenance } from './useInteractionProvenance';

export default function AttentionAStimulus({
  parameters,
  setAnswer,
  provenanceState,
}: StimulusParams<{ format?: DescriptionFormat }, ProvenanceState>) {
  const { record } = useInteractionProvenance(setAnswer);
  const vignette = getAttentionAVignette();
  const technique = getTechnique(vignette.techniqueId);
  const format = parameters?.format ?? 'ontology';

  useEffect(() => {
    setAnswer({
      status: true,
      answers: {
        clickLog: [],
        elementDwellTimes: {},
        openedElements: [],
      },
    });
  }, [setAnswer]);

  if (!technique) {
    return (
      <Alert color="red" icon={<IconAlertCircle />}>
        Missing technique for the Task A attention check.
      </Alert>
    );
  }

  return (
    <Stack gap="md" p="md" style={{ minWidth: 0, overflow: 'hidden' }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Task A</Text>
      <ScenarioPanel title={vignette.title} scenario={vignette.scenario} />
      <div>
        <SectionLabel>Technique</SectionLabel>
        <TechniqueCard
          technique={technique}
          format={format}
          provenanceState={provenanceState}
          onInteract={record}
        />
      </div>
    </Stack>
  );
}
