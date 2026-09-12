import type { InteractionEvent, ProvenanceState } from './types';

export function createInitialProvenanceState(): ProvenanceState {
  return {
    events: [],
    openSince: {},
    dwellMs: {},
  };
}

export function applyInteraction(state: ProvenanceState, event: InteractionEvent): void {
  state.events.push(event);

  if (event.type === 'open') {
    if (state.openSince[event.elementId] == null) {
      state.openSince[event.elementId] = event.timestamp;
    }
    return;
  }

  if (event.type === 'close') {
    const openedAt = state.openSince[event.elementId];
    if (openedAt != null) {
      const previous = state.dwellMs[event.elementId] ?? 0;
      state.dwellMs[event.elementId] = previous + Math.max(0, event.timestamp - openedAt);
      delete state.openSince[event.elementId];
    }
  }
}

/** Closed dwell plus time still accumulated on currently open elements. */
export function currentDwellMs(state: ProvenanceState, now: number): Record<string, number> {
  const dwell: Record<string, number> = { ...state.dwellMs };

  Object.entries(state.openSince).forEach(([elementId, openedAt]) => {
    const previous = dwell[elementId] ?? 0;
    dwell[elementId] = previous + Math.max(0, now - openedAt);
  });

  return dwell;
}

export function openedElementIds(state: ProvenanceState): string[] {
  const ids = new Set<string>(Object.keys(state.dwellMs));
  Object.keys(state.openSince).forEach((id) => ids.add(id));
  state.events.forEach((event) => {
    if (event.type === 'open' || event.type === 'close') {
      ids.add(event.elementId);
    }
  });
  return Array.from(ids);
}

export interface CardDisclosureState {
  openPanels: string[];
  pdfOpen: boolean;
}

/** Derive the visible disclosure state for one card during provenance replay. */
export function getCardDisclosureState(
  state: ProvenanceState,
  cardId: string,
): CardDisclosureState {
  const openPanels = ['abstract', 'summary'].filter(
    (panel) => state.openSince[`${cardId}:${panel}`] != null,
  );

  return {
    openPanels,
    pdfOpen: state.openSince[`${cardId}:full-paper`] != null,
  };
}
