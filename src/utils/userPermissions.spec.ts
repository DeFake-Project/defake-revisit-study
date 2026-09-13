import { describe, expect, it } from 'vitest';
import type { StoredUser } from '../storage/engines/types';
import {
  canAccessAnalysisStudy,
  canManageStudy,
  canManageUsers,
  canViewPrivateStudy,
  isLastAdmin,
  isStudyVisibleInAnalysis,
  normalizeStudyIds,
  normalizeUserRole,
  serializeStoredUser,
  studyIdsInclude,
} from './userPermissions';

const legacyAdmin: StoredUser = { email: 'legacy@example.com', uid: 'uid-1' };
const admin: StoredUser = { email: 'admin@example.com', uid: 'uid-2', role: 'admin' };
const manager: StoredUser = {
  email: 'manager@example.com',
  uid: 'uid-3',
  role: 'studyManager',
  studyIds: ['study-a', 'screening-gpt-5.2'],
};
const analyst: StoredUser = {
  email: 'analyst@example.com',
  uid: 'uid-4',
  role: 'analyst',
  studyIds: ['study-b'],
};

describe('normalizeUserRole', () => {
  it('treats legacy users without a role as admins', () => {
    expect(normalizeUserRole(legacyAdmin)).toBe('admin');
    expect(normalizeUserRole({ role: undefined })).toBe('admin');
  });

  it('preserves known roles', () => {
    expect(normalizeUserRole(admin)).toBe('admin');
    expect(normalizeUserRole(manager)).toBe('studyManager');
    expect(normalizeUserRole(analyst)).toBe('analyst');
  });
});

describe('normalizeStudyIds', () => {
  it('ignores study assignments on admins', () => {
    expect(normalizeStudyIds({ ...admin, studyIds: ['study-a'] })).toEqual([]);
    expect(normalizeStudyIds(legacyAdmin)).toEqual([]);
  });

  it('returns assigned studies for scoped roles', () => {
    expect(normalizeStudyIds(manager)).toEqual(['study-a', 'screening-gpt-5.2']);
    expect(normalizeStudyIds({ ...analyst, studyIds: undefined })).toEqual([]);
  });
});

describe('serializeStoredUser', () => {
  it('adds an explicit admin role to legacy records without dropping identity fields', () => {
    expect(serializeStoredUser(legacyAdmin)).toEqual({
      email: 'legacy@example.com',
      uid: 'uid-1',
      role: 'admin',
    });
  });

  it('omits studyIds for admins', () => {
    expect(serializeStoredUser({ ...admin, studyIds: ['study-a'] })).toEqual({
      email: 'admin@example.com',
      uid: 'uid-2',
      role: 'admin',
    });
  });

  it('keeps study assignments for scoped roles', () => {
    expect(serializeStoredUser(manager).studyIds).toEqual(['study-a', 'screening-gpt-5.2']);
  });
});

describe('isLastAdmin', () => {
  it('counts legacy users as admins', () => {
    expect(isLastAdmin([legacyAdmin, manager], 'legacy@example.com')).toBe(true);
    expect(isLastAdmin([legacyAdmin, admin], 'legacy@example.com')).toBe(false);
  });
});

describe('permission checks', () => {
  it('limits user management to admins', () => {
    expect(canManageUsers('admin')).toBe(true);
    expect(canManageUsers('studyManager')).toBe(false);
    expect(canManageUsers('analyst')).toBe(false);
    expect(canManageUsers(null)).toBe(false);
  });

  it('lets study managers edit assigned studies only', () => {
    expect(canManageStudy('admin', [], 'study-b')).toBe(true);
    expect(canManageStudy('studyManager', manager.studyIds || [], 'study-a')).toBe(true);
    expect(canManageStudy('studyManager', manager.studyIds || [], 'study-b')).toBe(false);
    expect(canManageStudy('analyst', analyst.studyIds || [], 'study-b')).toBe(false);
  });

  it('lets analysts view private assigned studies', () => {
    expect(canViewPrivateStudy('analyst', analyst.studyIds || [], 'study-b')).toBe(true);
    expect(canViewPrivateStudy('analyst', analyst.studyIds || [], 'study-a')).toBe(false);
    expect(canViewPrivateStudy('studyManager', manager.studyIds || [], 'study-a')).toBe(true);
  });

  it('matches sanitized study slugs used in analysis URLs', () => {
    expect(studyIdsInclude(['screening-gpt-5.2'], 'screening-gpt-5_2')).toBe(true);
    expect(canManageStudy('studyManager', ['screening-gpt-5.2'], 'screening-gpt-5_2')).toBe(true);
  });

  it('allows public analysis without a role and private analysis only with access', () => {
    expect(canAccessAnalysisStudy({
      shouldProtect: false,
      role: null,
      studyIds: [],
      studyId: 'study-a',
    })).toBe(true);

    expect(canAccessAnalysisStudy({
      shouldProtect: true,
      role: null,
      studyIds: [],
      studyId: 'study-a',
    })).toBe(false);

    expect(canAccessAnalysisStudy({
      shouldProtect: true,
      role: 'analyst',
      studyIds: ['study-a'],
      studyId: 'study-a',
    })).toBe(true);
  });
});

describe('isStudyVisibleInAnalysis', () => {
  it('shows public cloud studies to everyone', () => {
    expect(isStudyVisibleInAnalysis({
      configName: 'public-study',
      isAdmin: false,
      assignedStudyIds: [],
      dataSharingEnabled: true,
      isCloudStorage: true,
    })).toBe(true);
  });

  it('hides private cloud studies unless assigned or admin', () => {
    expect(isStudyVisibleInAnalysis({
      configName: 'private-study',
      isAdmin: false,
      assignedStudyIds: [],
      dataSharingEnabled: false,
      isCloudStorage: true,
    })).toBe(false);

    expect(isStudyVisibleInAnalysis({
      configName: 'private-study',
      isAdmin: false,
      assignedStudyIds: ['private-study'],
      dataSharingEnabled: false,
      isCloudStorage: true,
    })).toBe(true);

    expect(isStudyVisibleInAnalysis({
      configName: 'private-study',
      isAdmin: true,
      assignedStudyIds: [],
      dataSharingEnabled: false,
      isCloudStorage: true,
    })).toBe(true);
  });
});
