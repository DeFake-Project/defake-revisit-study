import type { AppRole, StoredUser } from '../storage/engines/types';
import { sanitizeStringForUrl } from './sanitizeStringForUrl';

export const APP_ROLES: AppRole[] = ['admin', 'studyManager', 'analyst'];

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Admin',
  studyManager: 'Study manager',
  analyst: 'Analyst',
};

export const APP_ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: 'Full access to every study, plus user and permission management.',
  studyManager: 'Can manage participant data and study settings for assigned studies only. Cannot manage users.',
  analyst: 'Can view assigned study data even when analysis is private, but cannot change data or study settings.',
};

export function isAppRole(value: unknown): value is AppRole {
  return value === 'admin' || value === 'studyManager' || value === 'analyst';
}

/**
 * Existing user-management records only have { email, uid }. Treat those as
 * global admins so enabling this feature does not lock out current operators.
 */
export function normalizeUserRole(user: Pick<StoredUser, 'role'> | null | undefined): AppRole {
  return isAppRole(user?.role) ? user.role : 'admin';
}

export function normalizeStudyIds(user: Pick<StoredUser, 'role' | 'studyIds'> | null | undefined): string[] {
  const role = normalizeUserRole(user);
  if (role === 'admin') {
    return [];
  }
  return Array.isArray(user?.studyIds) ? user.studyIds.filter((studyId): studyId is string => typeof studyId === 'string' && studyId.length > 0) : [];
}

export function studyIdsInclude(studyIds: string[], studyId: string | undefined): boolean {
  if (!studyId) {
    return false;
  }

  const sanitizedTarget = sanitizeStringForUrl(studyId);
  return studyIds.some((assignedId) => (
    assignedId === studyId
    || sanitizeStringForUrl(assignedId) === studyId
    || sanitizeStringForUrl(assignedId) === sanitizedTarget
  ));
}

export function serializeStoredUser(user: StoredUser): StoredUser {
  const role = normalizeUserRole(user);
  const serialized: StoredUser = {
    email: user.email,
    uid: user.uid,
    role,
  };

  if (role !== 'admin') {
    serialized.studyIds = normalizeStudyIds({ ...user, role });
  }

  return serialized;
}

export function getAdminUsers(users: StoredUser[]): StoredUser[] {
  return users.filter((user) => normalizeUserRole(user) === 'admin');
}

export function isLastAdmin(users: StoredUser[], email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const admins = getAdminUsers(users);
  return admins.length === 1 && admins[0].email === email;
}

export function canManageUsers(role: AppRole | null | undefined): boolean {
  return role === 'admin';
}

export function canManageStudy(role: AppRole | null | undefined, studyIds: string[], studyId: string | undefined): boolean {
  if (!role || !studyId) {
    return false;
  }
  if (role === 'admin') {
    return true;
  }
  return role === 'studyManager' && studyIdsInclude(studyIds, studyId);
}

export function canViewPrivateStudy(role: AppRole | null | undefined, studyIds: string[], studyId: string | undefined): boolean {
  if (!role || !studyId) {
    return false;
  }
  if (role === 'admin') {
    return true;
  }
  return (role === 'studyManager' || role === 'analyst') && studyIdsInclude(studyIds, studyId);
}

export function canAccessAnalysisStudy({
  shouldProtect,
  role,
  studyIds,
  studyId,
}: {
  shouldProtect: boolean;
  role: AppRole | null | undefined;
  studyIds: string[];
  studyId: string | undefined;
}): boolean {
  if (!shouldProtect) {
    return true;
  }
  return canViewPrivateStudy(role, studyIds, studyId);
}

export function isStudyVisibleInAnalysis({
  configName,
  isAdmin,
  assignedStudyIds,
  dataSharingEnabled,
  isCloudStorage,
}: {
  configName: string;
  isAdmin: boolean;
  assignedStudyIds: string[];
  dataSharingEnabled?: boolean;
  isCloudStorage: boolean;
}): boolean {
  if (isAdmin || studyIdsInclude(assignedStudyIds, configName)) {
    return true;
  }

  if (!isCloudStorage) {
    return true;
  }

  return !!dataSharingEnabled;
}
