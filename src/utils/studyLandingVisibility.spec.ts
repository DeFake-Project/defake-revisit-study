import { describe, expect, it } from 'vitest';
import { GlobalConfig } from '../parser/types';
import { isStudyVisibleOnLanding } from './studyLandingVisibility';

const globalConfig = {
  $schema: '',
  configsList: ['varuna-sme-eval-ontology', 'tutorial', 'demo-html'],
  configs: {
    'varuna-sme-eval-ontology': { path: 'varuna-sme-eval-ontology/config.json' },
    tutorial: { path: 'tutorial/config.json' },
    'demo-html': { path: 'demo-html/config.json', test: true },
  },
} as GlobalConfig;

describe('isStudyVisibleOnLanding', () => {
  it('hides test studies from non-admins', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'demo-html',
      globalConfig,
      isAdmin: false,
      assignedStudyIds: [],
      dataSharingEnabled: true,
      isCloudStorage: true,
    })).toBe(false);
  });

  it('shows assigned test studies to study managers and analysts', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'demo-html',
      globalConfig,
      isAdmin: false,
      assignedStudyIds: ['demo-html'],
      dataSharingEnabled: false,
      isCloudStorage: true,
    })).toBe(true);
  });

  it('shows test studies to non-admins when showTestStudies is enabled', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'demo-html',
      globalConfig,
      isAdmin: false,
      dataSharingEnabled: false,
      isCloudStorage: true,
      showTestStudies: true,
    })).toBe(true);
  });

  it('shows test studies to admins', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'demo-html',
      globalConfig,
      isAdmin: true,
      dataSharingEnabled: false,
      isCloudStorage: true,
    })).toBe(true);
  });

  it('shows non-test studies to non-admins when data sharing is enabled', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'varuna-sme-eval-ontology',
      globalConfig,
      isAdmin: false,
      dataSharingEnabled: true,
      isCloudStorage: true,
    })).toBe(true);

    expect(isStudyVisibleOnLanding({
      configName: 'tutorial',
      globalConfig,
      isAdmin: false,
      dataSharingEnabled: true,
      isCloudStorage: true,
    })).toBe(true);
  });

  it('shows assigned private studies on the landing page', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'varuna-sme-eval-ontology',
      globalConfig,
      isAdmin: false,
      assignedStudyIds: ['varuna-sme-eval-ontology'],
      dataSharingEnabled: false,
      isCloudStorage: true,
    })).toBe(true);
  });

  it('hides non-test studies from non-admins when data sharing and development mode are disabled on cloud', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'varuna-sme-eval-ontology',
      globalConfig,
      isAdmin: false,
      dataSharingEnabled: false,
      developmentModeEnabled: false,
      isCloudStorage: true,
    })).toBe(false);
  });

  it('shows non-test studies to non-admins when development mode is enabled on cloud', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'varuna-sme-eval-ontology',
      globalConfig,
      isAdmin: false,
      assignedStudyIds: [],
      dataSharingEnabled: false,
      developmentModeEnabled: true,
      isCloudStorage: true,
    })).toBe(true);
  });

  it('does not list test studies publicly just because development mode is on', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'demo-html',
      globalConfig,
      isAdmin: false,
      assignedStudyIds: [],
      dataSharingEnabled: false,
      developmentModeEnabled: true,
      isCloudStorage: true,
    })).toBe(false);
  });

  it('shows non-test studies on local storage to non-admins', () => {
    expect(isStudyVisibleOnLanding({
      configName: 'tutorial',
      globalConfig,
      isAdmin: false,
      isCloudStorage: false,
    })).toBe(true);
  });
});
