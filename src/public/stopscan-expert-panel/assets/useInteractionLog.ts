import { useCallback, useRef } from 'react';
import { StimulusParams } from '../../../store/types';

export type InteractionEvent = {
  type: 'accordion_open' | 'accordion_close' | 'modal_open' | 'modal_close';
  id: string;
  ts: number;
};

export type InteractionLog = {
  events: InteractionEvent[];
};

const EMPTY_LOG: InteractionLog = { events: [] };

/** Posts an append-only interaction log via the reactive response id `interactionLog`. */
export function useInteractionLog(
  setAnswer: StimulusParams<unknown>['setAnswer'],
  responseId = 'interactionLog',
) {
  const logRef = useRef<InteractionLog>(EMPTY_LOG);

  const publish = useCallback((next: InteractionLog) => {
    logRef.current = next;
    setAnswer({
      status: true,
      answers: {
        [responseId]: next,
      },
    });
  }, [responseId, setAnswer]);

  const ensureSeeded = useCallback(() => {
    if (logRef.current.events.length === 0) {
      publish(EMPTY_LOG);
    }
  }, [publish]);

  const logEvent = useCallback((type: InteractionEvent['type'], id: string) => {
    const next: InteractionLog = {
      events: [
        ...logRef.current.events,
        { type, id, ts: Date.now() },
      ],
    };
    publish(next);
  }, [publish]);

  return { logEvent, ensureSeeded, logRef };
}
