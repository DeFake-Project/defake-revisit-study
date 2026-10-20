import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';
import { validateAgreement } from './agreement';
import { TOOK_PART_YES } from './participation';
import { RATING_ITEMS, ROUND_ONE_THANK_YOU, ROUND_PAGES } from './pages';
import { ORIGINAL_FRAMEWORK_INTRO } from './OriginalFramework';
import { STOPSCAN_OVERVIEW } from '../../stopscan-expert-panel/assets/content';

const consentHtml = readFileSync('public/stopscan-expert-panel-round2/assets/consent.html', 'utf8');
const roundOneConfig = JSON.parse(readFileSync('public/stopscan-expert-panel/config.json', 'utf8'));
const roundTwoConfig = JSON.parse(readFileSync('public/stopscan-expert-panel-round2/config.json', 'utf8'));

describe('STOP&SCAN round 2 questionnaire', () => {
  it('uses seven review pages and the eleven agreement ratings', () => {
    expect(ROUND_PAGES.map((page) => page.id)).toEqual([
      'intro', 'stop', 'source', 'content', 'alignment', 'reflect', 'run',
    ]);
    expect(RATING_ITEMS.map((item) => item.id)).toEqual([
      'stop_entry',
      'stop_questions',
      'source',
      'content',
      'align_indep',
      'align_ai',
      'align_callback',
      'reflect_questions',
      'reflect_table',
      'run_order',
      'run_modes',
    ]);
    expect(ROUND_PAGES.find((page) => page.id === 'intro')?.ratings).toEqual([]);
    expect(ROUND_PAGES.find((page) => page.id === 'run')?.openPrompt).toMatch(/anything else/i);
    expect(ROUND_PAGES.find((page) => page.id === 'run')?.closingParagraphs).toHaveLength(1);
    expect(ROUND_PAGES.find((page) => page.id === 'reflect')?.teaching?.startOpen).toBe(true);
    const configured = ['stop', 'source', 'content', 'alignment', 'reflect', 'run']
      .flatMap((pageId) => roundTwoConfig.components[pageId].response.map((response: { id: string }) => response.id))
      .filter((responseId) => responseId !== 'open_final');
    expect(configured).toEqual(RATING_ITEMS.map((item) => item.id));
    expect(roundTwoConfig.components.run.response.at(-1)).toMatchObject({
      id: 'open_final',
      required: false,
    });
    expect(roundTwoConfig.components.kept).toMatchObject({
      type: 'markdown',
      path: 'stopscan-expert-panel-round2/assets/legacy-kept.md',
      response: [],
    });
    expect(JSON.stringify(roundTwoConfig.sequence)).not.toContain('"kept"');
  });

  it('keeps the Round 1 thank-you out of the shared intro copy', () => {
    const intro = ROUND_PAGES.find((page) => page.id === 'intro');
    expect(ROUND_ONE_THANK_YOU).toBe('Thank you for your Round 1 answers.');
    expect(intro?.paragraphs?.join(' ')).not.toContain(ROUND_ONE_THANK_YOU);
  });

  it('requires a comment only when the rating is below agree', () => {
    expect(validateAgreement(null)).toMatch(/choose a rating/i);
    expect(validateAgreement({ rating: 1, comment: '' })).toMatch(/what you would change/i);
    expect(validateAgreement({ rating: 2, comment: '   ' })).toMatch(/what you would change/i);
    expect(validateAgreement({ rating: 3, comment: '' })).toMatch(/what you would change/i);
    expect(validateAgreement({ rating: 3, comment: 'Name the claim in the entry question.' })).toBeNull();
    expect(validateAgreement({ rating: 4, comment: '' })).toBeNull();
    expect(validateAgreement({ rating: 5, comment: '' })).toBeNull();
  });

  it('skips the background questions and original framework when they completed round 1', () => {
    expect(roundTwoConfig.sequence.components[0]).toMatchObject({
      id: 'opening',
      components: ['consent', 'participation', 'about-you', 'original-framework'],
      skip: [
        {
          name: 'participation',
          check: 'response',
          responseId: 'took_part',
          value: TOOK_PART_YES,
          comparison: 'equal',
          to: 'intro',
        },
      ],
    });
    expect(roundTwoConfig.sequence.components.slice(1)).toEqual([
      'intro',
      'stop',
      'source',
      'content',
      'alignment',
      'reflect',
      'run',
      'acknowledgment',
      'review',
    ]);
  });

  it('reuses the first-round background questions and framework wording', () => {
    const roundOne = roundOneConfig.components['about-you'].response;
    const roundTwo = roundTwoConfig.components['about-you'].response;
    expect(roundTwo.map((response: { id: string }) => response.id)).toEqual(['B1', 'B2', 'B3', 'B4']);
    expect(roundTwo.map((response: { prompt: string }) => response.prompt)).toEqual(
      roundOne.map((response: { prompt: string }) => response.prompt),
    );
    expect(roundTwo.every((response: { required: boolean }) => response.required === false)).toBe(true);
    expect(ORIGINAL_FRAMEWORK_INTRO).toMatch(/did not complete Round 1/i);
    expect(STOPSCAN_OVERVIEW.elements.map((element) => element.title)).toEqual([
      'STOP', 'Source', 'Content', 'Alignment', 'Now Reflect',
    ]);
  });

  it('puts an at-a-glance summary on the round 2 consent', () => {
    expect(consentHtml).toMatch(/aria-label="At a glance"/);
    expect(consentHtml).toMatch(/class="glance"/);
    expect(consentHtml).toMatch(/glance-card/g);
    expect((consentHtml.match(/class="glance-card"/g) || []).length).toBe(5);
    expect(consentHtml).toMatch(/At a glance/);
    expect(consentHtml).toMatch(/10 to 15 minutes/);
    expect(consentHtml).toMatch(/whether or not you took part/);
    expect(consentHtml).toMatch(/Being named in the acknowledgments/);
    expect(consentHtml).toMatch(/Rochester Institute of Technology/);
    expect(consentHtml).toMatch(/University of Bologna is not a controller/);
    expect(consentHtml).toMatch(/john\.sohrawardi@rit\.edu/);
    expect(consentHtml).toMatch(/#004cd7/);
    expect(consentHtml).not.toMatch(/Builder note/);
  });

  it('asks only for Europe transfer consent and one age-and-consent checkbox', () => {
    const responses = roundTwoConfig.components.consent.response;
    expect(responses.map((response: { id: string }) => response.id)).toEqual([
      'consent_eu_transfer',
      'consent_participate',
    ]);
    expect(responses[0]).toMatchObject({ type: 'checkbox', required: false });
    expect(responses[1]).toMatchObject({
      type: 'checkbox',
      required: true,
      options: ['I consent'],
      requiredValue: ['I consent'],
    });
    expect(responses[1].prompt).toMatch(/18 or older/);
    expect(responses[1].prompt).toMatch(/agree to take part/);
    expect(JSON.stringify(responses)).not.toMatch(/I do not consent/);
  });
});
