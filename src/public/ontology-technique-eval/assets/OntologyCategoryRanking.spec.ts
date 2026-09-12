import { describe, expect, it } from 'vitest';
import { rankingToValue, valueToRanking } from './OntologyCategoryRanking';

const OPTIONS = [
  'Modality',
  'Forensic Goal & Task',
  'Search & Analysis Scope',
  'Evidentiary Features',
];

describe('ontology category ranking', () => {
  it('stores every category with its zero-based rank', () => {
    const order = [
      'Evidentiary Features',
      'Modality',
      'Forensic Goal & Task',
      'Search & Analysis Scope',
    ];

    expect(rankingToValue(order)).toEqual({
      'Evidentiary Features': '0',
      Modality: '1',
      'Forensic Goal & Task': '2',
      'Search & Analysis Scope': '3',
    });
  });

  it('restores a complete ranking in rank order', () => {
    expect(valueToRanking({
      Modality: '2',
      'Forensic Goal & Task': '0',
      'Search & Analysis Scope': '3',
      'Evidentiary Features': '1',
    }, OPTIONS)).toEqual([
      'Forensic Goal & Task',
      'Evidentiary Features',
      'Modality',
      'Search & Analysis Scope',
    ]);
  });

  it('rejects incomplete and duplicate rankings', () => {
    expect(valueToRanking({ Modality: '0' }, OPTIONS)).toBeNull();
    expect(valueToRanking({
      Modality: '0',
      'Forensic Goal & Task': '0',
      'Search & Analysis Scope': '2',
      'Evidentiary Features': '3',
    }, OPTIONS)).toBeNull();
  });
});
