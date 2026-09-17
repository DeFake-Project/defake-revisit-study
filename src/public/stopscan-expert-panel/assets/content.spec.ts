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
    expect(STOPSCAN_OVERVIEW.taskNote).toContain('You do not need to already use this method');
    expect(STOPSCAN_OVERVIEW.taskNote).toContain('not the fictional person');
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
    expect(consent).toContain('computer science');
    expect(consent).not.toContain('other forensic fields');
    expect(consent).toContain('describe participants only by a broad professional field');
    expect(consent).not.toContain('one of four broad fields');
  });
});

describe('STOP&SCAN generated config', () => {
  const config = JSON.parse(readPublic('config.json')) as {
    studyMetadata: { authors: string[]; organizations: string[] };
    components: Record<string, { instruction?: string; response?: Array<Record<string, unknown>> }>;
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

  it('asks STOP about pausing before a case-specific act, on every scenario', () => {
    const expected: Record<string, string> = {
      'case2-source': 'resharing this or treating it as a real forecast',
      'case3-source': 'repeating or sharing the claim that the crowd was fake',
      'case4-source': 'treating this photograph as settling the rumours',
      'case1-source': 'sending the money',
    };
    Object.entries(expected).forEach(([id, act]) => {
      const stop = config.components[id].response?.find((item) => item.id === 'stop_value') as {
        prompt: string;
        secondaryText?: string;
        options?: string[];
      };
      expect(stop.prompt).toBe(`Before ${act}, was there a good reason to pause?`);
      expect(stop.prompt).not.toMatch(/going further/i);
      expect(stop.prompt).not.toMatch(/worth pausing/i);
      expect(stop.prompt).not.toMatch(/first reaction/i);
      expect(stop.secondaryText).toContain('not the source check');
      expect(stop.options).toContain('Yes — there was a good reason to pause here');
    });
  });

  it('tells people to judge the step, not the fictional person', () => {
    const source = config.components['case2-source'];
    expect(source.instruction).toContain('Judge this STOP&SCAN step, not Dana');
    const useful = source.response?.find((item) => item.id === 'useful') as { secondaryText?: string };
    const fidelity = source.response?.find((item) => item.id === 'fidelity') as { secondaryText?: string };
    expect(useful.secondaryText).toContain('not Dana');
    expect(fidelity.secondaryText).toContain('not a score of Dana');
  });

  it('splits the enough follow-up from the general comment', () => {
    const content = config.components['case2-content'].response ?? [];
    const ids = content.map((item) => item.id);
    expect(ids).toContain('enough');
    expect(ids).toContain('enough_conclude');
    expect(ids).toContain('note');
    const note = content.find((item) => item.id === 'note') as { prompt: string; secondaryText?: string };
    expect(note.prompt).toBe('Anything wrong in how we applied this step?');
    expect(note.secondaryText).toContain('Mistakes in this step');
    const enough = content.find((item) => item.id === 'enough') as { prompt: string; secondaryText?: string };
    const enoughConclude = content.find((item) => item.id === 'enough_conclude') as {
      prompt: string;
      secondaryText?: string;
    };
    expect(enough.prompt).toBe(
      'Given what has been shown so far, is there already enough to stop and decide?',
    );
    expect(enough.secondaryText).toContain('not whether Dana personally should have');
    expect(enoughConclude.prompt).toBe('If yes, what should the conclusion have been?');
    expect(enoughConclude.secondaryText).toContain('Only if you answered yes above');
  });

  it('asks after-case questions about the evidence, without repeating encounter type', () => {
    const after = config.components['case2-after'].response ?? [];
    const rekha = config.components['case1-after'].response ?? [];
    expect(after.find((item) => item.id === 'direction')?.prompt).toBe(
      'What did the evidence support at the end of this case?',
    );
    expect(after.find((item) => item.id === 'encounter')).toBeUndefined();
    expect(rekha.find((item) => item.id === 'encounter')).toBeUndefined();
    expect(after.find((item) => item.id === 'narrow')?.prompt).toBe(
      'If this case had used only a source check, or only a detection or provenance tool, what would the conclusion have been?',
    );
    expect(after.find((item) => item.id === 'other_checks')?.prompt).toBe(
      'Would any other check have changed the conclusion?',
    );
    expect(after.find((item) => item.id === 'direction')?.secondaryText).toContain(
      'evidence state shown in the recap',
    );
    expect(after.find((item) => item.id === 'narrow')?.secondaryText).toContain(
      'narrower check',
    );
    expect(after.find((item) => item.id === 'other_checks')?.secondaryText).toContain(
      'check the example missed',
    );
  });

  it('gives a why-we-are-asking line on visible questions that did not already have one', () => {
    const skip = new Set(['consent', 'about-you', 'orientation', 'debrief']);
    Object.entries(config.components).forEach(([id, component]) => {
      if (skip.has(id)) return;
      (component.response ?? []).forEach((item) => {
        if (item.type === 'reactive' || item.hidden === true) return;
        expect(item.secondaryText, `${id}.${String(item.id)}`).toEqual(expect.any(String));
        expect(String(item.secondaryText).length, `${id}.${String(item.id)}`).toBeGreaterThan(10);
      });
    });
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

  it('adds computer science and an Other write-in on the main-area question', () => {
    const about = config.components['about-you'].response ?? [];
    const expected = [
      'Digital media forensics',
      'Computer science',
      'Misinformation or disinformation research',
      'Media literacy education',
      'Fact-checking or verification journalism',
    ];
    const b1 = about.find((item) => item.id === 'B1') as {
      options: string[];
      withOther?: boolean;
    };
    const b2 = about.find((item) => item.id === 'B2') as {
      options: string[];
      withOther?: boolean;
    };
    expect(b1.options).toEqual(expected);
    expect(b1.withOther).toBe(true);
    expect(b2.options).toEqual(expected);
    expect(b2.withOther).toBeUndefined();
    expect(JSON.stringify(about)).not.toContain('Other forensic fields');
  });
});
