import { GlobalConfig } from '../parser/types';
import { studyIdsInclude } from './userPermissions';

/**
 * When true, studies marked `test: true` remain visible on the landing page.
 * Playwright sets VITE_SHOW_TEST_STUDIES so e2e can open demo/example studies.
 */
export function shouldShowTestStudiesOnLanding(): boolean {
  return import.meta.env.VITE_SHOW_TEST_STUDIES === 'true';
}

/**
 * Determines whether a study should appear on the landing page.
 * Studies marked `test: true` in global.json are admin-only in production,
 * unless showTestStudies is enabled (e.g. Playwright) or the user is assigned
 * to that study.
 * On cloud storage, unassigned non-admins also need dataSharingEnabled.
 */
export function isStudyVisibleOnLanding({
  configName,
  globalConfig,
  isAdmin,
  assignedStudyIds = [],
  dataSharingEnabled,
  isCloudStorage,
  showTestStudies = false,
}: {
  configName: string;
  globalConfig: GlobalConfig;
  isAdmin: boolean;
  assignedStudyIds?: string[];
  dataSharingEnabled?: boolean;
  isCloudStorage: boolean;
  showTestStudies?: boolean;
}): boolean {
  if (isAdmin || showTestStudies || studyIdsInclude(assignedStudyIds, configName)) {
    return true;
  }

  const isTestConfig = !!globalConfig.configs[configName]?.test;
  if (isTestConfig) {
    return false;
  }

  if (isCloudStorage) {
    return !!dataSharingEnabled;
  }

  return true;
}
