import { Alert, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect } from 'react';
import type { StimulusParams } from '../../../store/types';
import { ScenarioPanel, SectionLabel } from './ScenarioPanel';
import { getTaskAVignette, getTechnique } from './studyBank';
import { TechniqueCard } from './TechniqueCard';
import type { ProvenanceState, TaskAStimulusParams } from './types';
import { useInteractionProvenance } from './useInteractionProvenance';

export default function TaskAStimulus({
  parameters,
  setAnswer,
  provenanceState,
}: StimulusParams<TaskAStimulusParams, ProvenanceState>) {
  const { record } = useInteractionProvenance(setAnswer);
  const vignette = getTaskAVignette(parameters.vignetteId);
  const technique = vignette ? getTechnique(vignette.techniqueId) : undefined;

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

  if (!vignette || !technique) {
    return (
      <Alert color="red" icon={<IconAlertCircle />}>
        Missing placeholder vignette or technique for
        {' '}
        {parameters.vignetteId}
        .
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
          format={parameters.format}
          provenanceState={provenanceState}
          onInteract={record}
        />
      </div>
    </Stack>
  );
}
