import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';
import {
  PROLIFIC_COMPLETION_URL,
  PROLIFIC_DECLINED_URL,
  PROLIFIC_REDIRECT_DELAY_MS,
} from './prolificUrls';

describe('Prolific redirects', () => {
  const config = readFileSync('public/ontology-technique-eval/config.json', 'utf8');
  const parsed = JSON.parse(config) as {
    sequence: {
      components: Array<string | { skip?: Array<{ value: string; to: string }> }>;
    };
  };
  const declined = readFileSync('src/public/ontology-technique-eval/assets/ProlificDeclinedRedirect.tsx', 'utf8');
  const thankYou = readFileSync('public/ontology-technique-eval/assets/thank-you.md', 'utf8');

  it('sends finishers and declined participants to different Prolific completion codes', () => {
    expect(PROLIFIC_COMPLETION_URL).toContain('cc=C25X6SWF');
    expect(PROLIFIC_DECLINED_URL).toContain('cc=C1CR6OHI');
    expect(PROLIFIC_COMPLETION_URL).not.toBe(PROLIFIC_DECLINED_URL);
    expect(config).toContain(PROLIFIC_COMPLETION_URL);
    expect(config).toContain('Submit and return to Prolific');
    expect(config).not.toContain(PROLIFIC_DECLINED_URL);
  });

  it('routes declined participants through the declined page and completers through study end', () => {
    expect(parsed.sequence.components[1]).toBe('consent-declined');
    expect(parsed.sequence.components.at(-1)).toBe('thank-you');
    const consentBlock = parsed.sequence.components[0];
    expect(consentBlock).toEqual(expect.objectContaining({
      skip: expect.arrayContaining([
        expect.objectContaining({
          value: 'I do not agree to participate.',
          to: 'consent-declined',
        }),
        expect.objectContaining({
          value: 'I have read this information and I agree to participate.',
          to: 'intro-formats',
        }),
      ]),
    }));
    expect(declined).toContain('PROLIFIC_DECLINED_URL');
    expect(declined).toContain('Return to Prolific');
    expect(declined).toContain('location.replace');
    expect(declined).toContain('PROLIFIC_REDIRECT_DELAY_MS');
    expect(declined).not.toContain('C25X6SWF');
    expect(PROLIFIC_REDIRECT_DELAY_MS).toBe(8000);
    expect(thankYou).toContain('Submit and return to Prolific');
    expect(thankYou).toMatch(/approve payment/);
  });
});
