import { RecruitmentEntryConfig } from '../parser/types';

export type RecruitmentResolution =
  | { status: 'inactive' }
  | { status: 'ok'; arm: string }
  | { status: 'incomplete'; message: string };

type ParamSource = { get(name: string): string | null };

function readParam(params: ParamSource, name: string): string {
  return params.get(name)?.trim() ?? '';
}

/**
 * Resolves a study entry link. Studies that omit recruitmentEntry are inactive:
 * callers must leave startup unchanged.
 * A prolific id and an arm together, a missing link, or an unrecognized arm
 * are incomplete and must not create a participant record.
 */
export function resolveRecruitmentEntry(
  config: RecruitmentEntryConfig | undefined,
  params: ParamSource,
): RecruitmentResolution {
  if (!config) {
    return { status: 'inactive' };
  }

  const prolificId = readParam(params, config.prolificParam);
  const armRaw = readParam(params, config.armParam);
  const matchedArm = config.arms.find((arm) => arm.toLowerCase() === armRaw.toLowerCase());

  if ((prolificId && armRaw) || (!prolificId && !matchedArm)) {
    return { status: 'incomplete', message: config.incompleteLinkMessage };
  }

  if (prolificId) {
    return { status: 'ok', arm: config.prolificArm };
  }

  return { status: 'ok', arm: matchedArm as string };
}

type StudyWithEntry = {
  uiConfig?: {
    recruitmentEntry?: RecruitmentEntryConfig;
  };
} | null | undefined;

/**
 * Finds the single study whose recruitmentEntry accepts the current arm query.
 * Returns null when no study opts in, the arm is absent, or more than one study matches.
 */
export function findStudyForRecruitmentArm(
  configs: Record<string, StudyWithEntry>,
  params: ParamSource,
): string | null {
  const matches = Object.entries(configs).flatMap(([studyId, config]) => {
    const entry = config?.uiConfig?.recruitmentEntry;
    if (!entry) {
      return [];
    }
    const armRaw = readParam(params, entry.armParam);
    if (!armRaw) {
      return [];
    }
    const matched = entry.arms.some((arm) => arm.toLowerCase() === armRaw.toLowerCase());
    return matched ? [studyId] : [];
  });

  return matches.length === 1 ? matches[0] : null;
}
