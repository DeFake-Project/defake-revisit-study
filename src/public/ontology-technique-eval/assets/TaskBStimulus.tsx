import {
  Alert, Stack, Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useStoredAnswer } from '../../../store/hooks/useStoredAnswer';
import { useStoreSelector } from '../../../store/store';
import type { StimulusParams } from '../../../store/types';
import { ScenarioPanel, SectionLabel } from './ScenarioPanel';
import { getTaskBVignette, getTechnique } from './studyBank';
import { resolveTaskBTechniqueOrder } from './taskBChoices';
import { TechniqueCard } from './TechniqueCard';
import type { ProvenanceState, TaskBStimulusParams } from './types';
import { useInteractionProvenance } from './useInteractionProvenance';

export default function TaskBStimulus({
  parameters,
  setAnswer,
  provenanceState,
}: StimulusParams<TaskBStimulusParams, ProvenanceState>) {
  const participantId = useStoreSelector((state) => state.participantId);
  const storedAnswer = useStoredAnswer();
  const vignette = getTaskBVignette(parameters.vignetteId);
  const techniqueOrder = useMemo(
    () => resolveTaskBTechniqueOrder(
      parameters.vignetteId,
      participantId,
      storedAnswer?.answer?.techniqueOrder,
    ),
    [parameters.vignetteId, participantId, storedAnswer?.answer?.techniqueOrder],
  );
  const techniques = techniqueOrder
    .map((id) => getTechnique(id))
    .filter((technique): technique is NonNullable<typeof technique> => technique != null);
  const orderKey = techniqueOrder.join('|');

  const persistAnswers = useCallback((payload: Parameters<typeof setAnswer>[0]) => {
    setAnswer({
      ...payload,
      answers: {
        ...payload.answers,
        techniqueOrder: orderKey.length > 0 ? orderKey.split('|') : [],
      },
    });
  }, [orderKey, setAnswer]);

  const { record } = useInteractionProvenance(persistAnswers);

  useEffect(() => {
    persistAnswers({
      status: true,
      answers: {
        clickLog: [],
        elementDwellTimes: {},
        openedElements: [],
      },
    });
  }, [orderKey, persistAnswers]);

  if (!vignette || techniques.length !== 4) {
    return (
      <Alert color="red" icon={<IconAlertCircle />}>
        Missing placeholder vignette or techniques for
        {' '}
        {parameters.vignetteId}
        .
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
              format={parameters.format}
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
