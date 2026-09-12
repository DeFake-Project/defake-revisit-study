import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import {
  CASES_IN_ORDER,
  SIFT_CRITIQUE,
  SOCIAL_MEDIA_LABEL,
  STOPSCAN_OVERVIEW,
  TECH_SAVVINESS_LABEL,
} from './content';

const iframePages = ['consent.html', 'debrief.html'] as const;
const publicDir = new URL('../../../../public/stopscan-expert-panel/', import.meta.url);

function readPublic(name: string) {
  return readFileSync(new URL(name, publicDir), 'utf8');
}

describe('STOP&SCAN participant copy', () => {
  it('presents cases in the participant order with stable ids', () => {
    expect(CASES_IN_ORDER.map(({ id, title, shortLabel }) => ({ id, title, shortLabel }))).toEqual([
      { id: 'case2', title: 'A wind forecast map', shortLabel: 'Case 1' },
      { id: 'case3', title: 'A photograph of a campaign crowd', shortLabel: 'Case 2' },
      { id: 'case4', title: 'A photograph shared by a senator’s office', shortLabel: 'Case 3' },
      { id: 'case1', title: 'An urgent phone call', shortLabel: 'Case 4' },
    ]);
  });

  it('defines the two-level outcome model', () => {
    expect(STOPSCAN_OVERVIEW.evidenceStates.map(({ title }) => title)).toEqual([
      'Confirmed',
      'Contradicted',
      'Unresolved',
    ]);
    expect(STOPSCAN_OVERVIEW.encounterTypes.map(({ id }) => id)).toEqual([
      'information',
      'request',
      'alert',
    ]);
    expect(STOPSCAN_OVERVIEW.actionRule).toContain('does not mean ignore it');
    expect(STOPSCAN_OVERVIEW.encounterTypes[0].body).toContain('Waiting costs little');
  });

  it('gives each observer a compact persona with two traits', () => {
    const personas = CASES_IN_ORDER.map(({ character }) => ({
      name: character.name,
      tech: character.techSavviness,
      social: character.socialMedia,
      avatar: character.avatar,
    }));
    expect(personas).toEqual([
      { name: 'Dana', tech: 2, social: 2, avatar: 'persona-dana.png' },
      { name: 'Marcus', tech: 2, social: 3, avatar: 'persona-marcus.png' },
      { name: 'Ellen', tech: 3, social: 2, avatar: 'persona-ellen.png' },
      { name: 'Rekha', tech: 1, social: 1, avatar: 'persona-rekha.png' },
    ]);
    personas.forEach(({ avatar, tech, social }) => {
      const path = fileURLToPath(new URL(`../../../../public/stopscan-expert-panel/assets/personas/${avatar}`, import.meta.url));
      expect(existsSync(path)).toBe(true);
      expect(TECH_SAVVINESS_LABEL[tech]).toBeTruthy();
      expect(SOCIAL_MEDIA_LABEL[social]).toBeTruthy();
    });
  });

  it('assigns each case an evidence state only after the walkthrough', () => {
    expect(CASES_IN_ORDER.map(({ outcome }) => outcome.state)).toEqual([
      'contradicted',
      'confirmed',
      'unresolved',
      'contradicted',
    ]);
  });

  it('lists five SIFT concerns including the 2025 AI guidance', () => {
    expect(SIFT_CRITIQUE.positions.map(({ id }) => id)).toEqual([
      'stop',
      'investigate',
      'coverage',
      'trace',
      'ai',
    ]);
    expect(SIFT_CRITIQUE.intro).toContain('five concerns');
  });

  it('uses the app fonts on iframe HTML pages', () => {
    iframePages.forEach((name) => {
      const html = readPublic(`assets/${name}`);

      expect(html).toContain('family=Inter');
      expect(html).toContain('family=Space+Grotesk');
      expect(html).toContain('"Inter"');
      expect(html).toContain('"Space Grotesk"');
      expect(html).not.toMatch(/Iowan Old Style|Palatino|Georgia, serif/);
    });
  });

  it('names the full research team on consent and debrief', () => {
    const consent = readPublic('assets/consent.html');
    const debrief = readPublic('assets/debrief.html');
    const emails = [
      'john.sohrawardi@rit.edu',
      'kellywu@mail.rit.edu',
      'fatma.aksu2@unibo.it',
      'alessandra.sala@outlook.ie',
      'luca.pietrantoni@unibo.it',
    ];
    emails.forEach((email) => {
      expect(consent).toContain(email);
      expect(debrief).toContain(email);
    });
    expect(consent).toContain('AI and Multimedia Authenticity Collaboration');
    expect(consent).not.toContain('AI Office of Ireland');
    expect(consent).toContain('Principal Investigators');
    expect(debrief).toContain('AI and Multimedia Authenticity Collaboration');
    expect(debrief).toContain('fatma.aksu2@unibo.it');
    expect(debrief).toContain('email the Principal Investigators');
    expect(debrief).not.toContain('request that in the sidebar');
    expect(consent).toContain('45 to 60 minutes');
  });
});

describe('STOP&SCAN generated config', () => {
  const config = JSON.parse(readPublic('config.json')) as {
    studyMetadata: { authors: string[]; organizations: string[] };
    components: Record<string, { response?: Array<Record<string, unknown>> }>;
  };

  it('lists the research team in study metadata', () => {
    expect(config.studyMetadata.authors).toEqual([
      'Saniat Javid Sohrawardi',
      'Fatma Aksu',
      'Y. Kelly Wu',
      'Alessandra Sala',
      'Luca Pietrantoni',
    ]);
    expect(config.studyMetadata.organizations).toContain('AI and Multimedia Authenticity Collaboration');
  });

  it('numbers STOP&SCAN ratings R1–R8 and lets people comment on any of them', () => {
    const matrix = config.components['ratings-stopscan'].response?.find((item) => item.id === 'R_stopscan') as {
      questionOptions: string[];
    };
    expect(matrix.questionOptions.map((option) => option.slice(0, 3))).toEqual([
      'R1.', 'R2.', 'R3.', 'R4.', 'R5.', 'R6.', 'R7.', 'R8.',
    ]);
    const ids = config.components['ratings-stopscan'].response?.map((item) => item.id);
    expect(ids).toContain('R_stopscan_note');
    expect(ids).not.toContain('R4_why');
  });

  it('puts the 2025 AI guidance on the SIFT critique Likert', () => {
    const q1 = config.components['ratings-critique'].response?.find((item) => item.id === 'Q1') as {
      prompt: string;
      questionOptions: string[];
    };
    expect(q1.prompt).toContain('five concerns');
    expect(q1.questionOptions).toHaveLength(5);
    expect(q1.questionOptions[4]).toContain('2025 AI guidance');
    const ids = config.components['ratings-critique'].response?.map((item) => item.id);
    expect(ids).not.toContain('Q2');
  });

  it('lets each comparison be skipped without a later catch-all', () => {
    const compare = config.components['ratings-compare'].response ?? [];
    const radios = compare.filter((item) => item.type === 'radio');
    expect(radios).toHaveLength(6);
    radios.forEach((item) => {
      expect(item.options).toContain('I cannot make this comparison');
    });
    expect(compare.map((item) => item.id)).not.toContain('compare_flags');
    expect(compare.find((item) => item.id === 'R19')?.prompt).toBe(
      'Which better matches the range of cases you meet in your own work?',
    );
  });

  it('asks about pausing to name a first reaction, not recording it', () => {
    const source = config.components['case2-source'].response?.find((item) => item.id === 'stop_value') as {
      prompt: string;
    };
    expect(source.prompt).toContain('pausing to name Dana');
    expect(source.prompt).not.toMatch(/recording/i);
  });

  it('splits the enough follow-up from the general comment', () => {
    const content = config.components['case2-content'].response ?? [];
    const ids = content.map((item) => item.id);
    expect(ids).toContain('enough');
    expect(ids).toContain('enough_conclude');
    expect(ids).toContain('note');
    const note = content.find((item) => item.id === 'note') as { prompt: string; secondaryText?: string };
    expect(note.prompt).toBe('Anything you disagree with, or that was done badly?');
    expect(note.secondaryText).toBeUndefined();
  });

  it('does not collect an email opt-in on the debrief', () => {
    const ids = config.components.debrief.response?.map((item) => item.id) ?? [];
    expect(ids).not.toContain('summary_optin');
    expect(config.components.debrief.response).toEqual([]);
  });

  it('ships a real ITU SVG logo, not a mislabeled WebP', () => {
    const logo = readPublic('assets/logos/itu-logo.svg');
    expect(logo).toMatch(/<svg\b/i);
    expect(logo.slice(0, 12)).not.toBe('RIFF');
  });

  it('does not use filler optional language on case pages', () => {
    const json = readPublic('config.json');
    expect(json).not.toContain('Everything on this page is optional');
  });
});
