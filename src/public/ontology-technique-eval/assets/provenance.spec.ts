import { describe, expect, it } from 'vitest';
import {
  applyInteraction,
  createInitialProvenanceState,
  currentDwellMs,
  getCardDisclosureState,
  openedElementIds,
} from './provenance';

describe('interaction provenance', () => {
  it('records clicks without changing dwell', () => {
    const state = createInitialProvenanceState();
    applyInteraction(state, {
      timestamp: 1000,
      type: 'click',
      elementId: 'tag-click:t1:video',
      label: 'Click tag: Video',
      techniqueId: 't1',
      cardId: 't1-2',
      format: 'ontology',
      cardIndex: 2,
      region: 'ontology-tag',
    });
    expect(state.events).toHaveLength(1);
    expect(state.events[0]).toMatchObject({
      techniqueId: 't1',
      cardId: 't1-2',
      format: 'ontology',
      cardIndex: 2,
      region: 'ontology-tag',
    });
    expect(currentDwellMs(state, 1500)).toEqual({});
  });

  it('accumulates dwell while a section stays open and after it closes', () => {
    const state = createInitialProvenanceState();
    applyInteraction(state, {
      timestamp: 1000,
      type: 'open',
      elementId: 't1:abstract',
      label: 'Open abstract',
    });
    expect(currentDwellMs(state, 1300)['t1:abstract']).toBe(300);

    applyInteraction(state, {
      timestamp: 1800,
      type: 'close',
      elementId: 't1:abstract',
      label: 'Close abstract',
    });
    expect(state.dwellMs['t1:abstract']).toBe(800);
    expect(currentDwellMs(state, 2000)['t1:abstract']).toBe(800);
  });

  it('adds dwell across reopen cycles', () => {
    const state = createInitialProvenanceState();
    applyInteraction(state, {
      timestamp: 0, type: 'open', elementId: 'paper', label: 'open',
    });
    applyInteraction(state, {
      timestamp: 100, type: 'close', elementId: 'paper', label: 'close',
    });
    applyInteraction(state, {
      timestamp: 200, type: 'open', elementId: 'paper', label: 'open',
    });
    applyInteraction(state, {
      timestamp: 350, type: 'close', elementId: 'paper', label: 'close',
    });
    expect(state.dwellMs.paper).toBe(250);
    expect(openedElementIds(state)).toEqual(['paper']);
  });

  it('derives each card disclosure state for analysis replay', () => {
    const state = createInitialProvenanceState();
    applyInteraction(state, {
      timestamp: 100,
      type: 'open',
      elementId: 't1-2:abstract',
      label: 'Open abstract',
    });
    applyInteraction(state, {
      timestamp: 200,
      type: 'open',
      elementId: 't1-2:full-paper',
      label: 'Open paper',
    });
    applyInteraction(state, {
      timestamp: 300,
      type: 'open',
      elementId: 't2-3:summary',
      label: 'Open summary',
    });

    expect(getCardDisclosureState(state, 't1-2')).toEqual({
      openPanels: ['abstract'],
      pdfOpen: true,
    });
    expect(getCardDisclosureState(state, 't2-3')).toEqual({
      openPanels: ['summary'],
      pdfOpen: false,
    });
  });
});
