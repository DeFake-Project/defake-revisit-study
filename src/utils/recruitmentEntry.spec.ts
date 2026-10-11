import { describe, expect, it } from 'vitest';
import { findStudyForRecruitmentArm, resolveRecruitmentEntry } from './recruitmentEntry';
import { RecruitmentEntryConfig } from '../parser/types';

const entry: RecruitmentEntryConfig = {
  prolificParam: 'PROLIFIC_PID',
  armParam: 'arm',
  arms: ['RIT', 'NORTHEASTERN', 'UTEP'],
  prolificArm: 'PROLIFIC',
  incompleteLinkMessage: 'This link looks incomplete.',
};

function params(query: string) {
  return new URLSearchParams(query);
}

describe('resolveRecruitmentEntry', () => {
  it('does nothing when the study has no recruitment entry', () => {
    expect(resolveRecruitmentEntry(undefined, params('arm=RIT'))).toEqual({ status: 'inactive' });
  });

  it('accepts a prolific id alone', () => {
    expect(resolveRecruitmentEntry(entry, params('PROLIFIC_PID=abc&STUDY_ID=1'))).toEqual({
      status: 'ok',
      arm: 'PROLIFIC',
    });
  });

  it('accepts a known campus arm regardless of case', () => {
    expect(resolveRecruitmentEntry(entry, params('arm=northeastern'))).toEqual({
      status: 'ok',
      arm: 'NORTHEASTERN',
    });
  });

  it('refuses a missing link, an unknown arm, and both parameters together', () => {
    expect(resolveRecruitmentEntry(entry, params(''))).toMatchObject({ status: 'incomplete' });
    expect(resolveRecruitmentEntry(entry, params('arm=CMU'))).toMatchObject({ status: 'incomplete' });
    expect(resolveRecruitmentEntry(entry, params('PROLIFIC_PID=abc&arm=RIT'))).toMatchObject({ status: 'incomplete' });
  });
});

describe('findStudyForRecruitmentArm', () => {
  const configs = {
    'agent-addon-decisions': { uiConfig: { recruitmentEntry: entry } },
    tutorial: { uiConfig: {} },
  };

  it('routes a campus arm to the only study that claims it', () => {
    expect(findStudyForRecruitmentArm(configs, params('arm=rit'))).toBe('agent-addon-decisions');
  });

  it('leaves a prolific id on the home page', () => {
    expect(findStudyForRecruitmentArm(configs, params('PROLIFIC_PID=abc'))).toBeNull();
  });

  it('does not pick a study when the arm matches more than one', () => {
    const duplicated = {
      ...configs,
      other: { uiConfig: { recruitmentEntry: entry } },
    };
    expect(findStudyForRecruitmentArm(duplicated, params('arm=RIT'))).toBeNull();
  });
});
