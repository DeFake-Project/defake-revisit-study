import { Alert, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect } from 'react';
import type { StimulusParams } from '../../../store/types';
import { ScenarioPanel, SectionLabel } from './ScenarioPanel';
import { getAttentionBVignette, getTechnique } from './studyBank';
import { TechniqueCard } from './TechniqueCard';
import type { DescriptionFormat, ProvenanceState } from './types';
import { useInteractionProvenance } from './useInteractionProvenance';

export default function AttentionBStimulus({
  parameters,
  setAnswer,
  provenanceState,
}: StimulusParams<{ format?: DescriptionFormat }, ProvenanceState>) {
  const { record } = useInteractionProvenance(setAnswer);
  const vignette = getAttentionBVignette();
  const format = parameters?.format ?? 'keywords';
  const techniques = vignette.techniqueIds
    .map((id) => getTechnique(id))
    .filter((technique): technique is NonNullable<typeof technique> => technique != null);

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

  if (techniques.length !== 4) {
    return (
      <Alert color="red" icon={<IconAlertCircle />}>
        Missing techniques for the Task B attention check.
      </Alert>
    );
  }

  return (
    <Stack gap="md" p="md" style={{ minWidth: 0, overflow: 'hidden' }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Task B</Text>
      <ScenarioPanel title={vignette.title} scenario={vignette.scenario} />
      <div>
        <SectionLabel>Methods</SectionLabel>
        <div className="ot-task-b-methods">
          {techniques.map((technique, index) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              format={format}
              compact
              index={index + 1}
              provenanceState={provenanceState}
              onInteract={record}
            />
          ))}
        </div>
      </div>
    </Stack>
  );
}
