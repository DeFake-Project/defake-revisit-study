import { useCallback, useMemo } from 'react';
import { initializeTrrack, Registry } from '@trrack/core';
import type { JsonValue } from '../../../parser/types';
import type { StimulusParams } from '../../../store/types';
import {
  applyInteraction,
  createInitialProvenanceState,
  currentDwellMs,
  openedElementIds,
} from './provenance';
import type { InteractionEvent, ProvenanceState } from './types';

type SetAnswer = StimulusParams<unknown, ProvenanceState>['setAnswer'];

export function useInteractionProvenance(setAnswer: SetAnswer) {
  const { actions, trrack } = useMemo(() => {
    const registry = Registry.create();
    const interactAction = registry.register('interact', (state, event: InteractionEvent) => {
      applyInteraction(state, event);
      return state;
    });

    const trrackInst = initializeTrrack({
      registry,
      initialState: createInitialProvenanceState(),
    });

    return {
      actions: { interactAction },
      trrack: trrackInst,
    };
  }, []);

  const publish = useCallback((label: string) => {
    const state = trrack.getState();
    const now = Date.now();
    setAnswer({
      status: true,
      provenanceGraph: trrack.graph.backend,
      answers: {
        clickLog: JSON.parse(JSON.stringify(state.events)) as JsonValue,
        elementDwellTimes: currentDwellMs(state, now),
        openedElements: openedElementIds(state),
        lastInteraction: label,
      },
    });
  }, [setAnswer, trrack]);

  const record = useCallback((event: Omit<InteractionEvent, 'timestamp'> & { timestamp?: number }) => {
    const fullEvent: InteractionEvent = {
      ...event,
      timestamp: event.timestamp ?? Date.now(),
    };
    trrack.apply(`${fullEvent.type}:${fullEvent.elementId}`, actions.interactAction(fullEvent));
    publish(fullEvent.label);
  }, [actions, publish, trrack]);

  return { record, trrack };
}
