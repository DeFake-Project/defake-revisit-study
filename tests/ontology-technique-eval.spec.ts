import { expect, test, type Page } from '@playwright/test';
import {
  nextClick,
  openStudyFromLanding,
  resetClientStudyState,
} from './utils';

async function advanceStudyComponent(page: Page) {
  const stimulus = page.locator('.react-component, .markdown, .website').first();
  const previousId = await stimulus.getAttribute('id');
  await nextClick(page);
  await expect.poll(async () => (
    page.locator('.react-component, .markdown, .website').first().getAttribute('id')
  ), { timeout: 20000 }).not.toBe(previousId);
}

async function answerFirstTaskA(page: Page) {
  const applies = page.getByRole('radio', { name: 'Yes, it applies' });
  await expect(applies).toBeVisible({ timeout: 20000 });
  await applies.click({ force: true });
  await page.getByRole('radio', { name: '3 — Moderately confident' }).click();
  await page.getByRole('checkbox', { name: 'Technique title' }).click();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
}

test('ontology technique evaluation study loads consent, intro, and a Task A trial', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1400, height: 900 });
  await resetClientStudyState(page);
  await openStudyFromLanding(
    page,
    'Your Studies',
    'Ontology-supported descriptions of digital media forensic techniques',
  );

  const consentFrame = page.frameLocator('iframe');
  await expect(consentFrame.getByRole('heading', { name: /Ontology-based Framework/i })).toBeVisible();
  await expect(consentFrame.locator('.glance').getByText('About 45 minutes', { exact: true })).toBeVisible();
  const researchTeam = consentFrame.locator('.people').first();
  await expect(researchTeam.locator('strong')).toHaveText([
    'Y. Kelly Wu',
    'Saniat J. Sohrawardi',
    'Dr. Ersin Uzun',
    'Dr. Matthew Wright',
  ]);
  await expect(researchTeam.locator('.meta')).toHaveText([
    /ESL Global Cybersecurity Institute, RIT/,
    /ESL Global Cybersecurity Institute, RIT/,
    /ESL Global Cybersecurity Institute, RIT/,
    /ESL Global Cybersecurity Institute, RIT/,
  ]);
  await expect(consentFrame.locator('.people').nth(1).locator('strong')).toHaveText([
    'Y. Kelly Wu',
    'Saniat J. Sohrawardi',
    'Dr. Ersin Uzun',
    'Dr. Matthew Wright',
  ]);
  await expect(consentFrame.getByRole('link', { name: 'john.sohrawardi@rit.edu' }).first()).toBeVisible();
  await expect(consentFrame.locator('body')).toContainText('read a short introduction of the technique description formats');
  await expect(consentFrame.locator('body')).not.toContainText('Qualtrics');
  await expect(consentFrame.locator('body')).not.toContainText('watch a short video');

  await expect(page.getByText('Testing mode', { exact: true })).toBeVisible();
  await page.getByPlaceholder('TEST-your-name-or-run').fill('TEST-e2e');
  await page.getByRole('radio', { name: /I agree to participate/i }).click();
  await nextClick(page);

  await expect(page.getByText('Keyword supported')).toBeVisible();
  await expect(page.getByText('Ontology supported')).toBeVisible();
  await expect(page.getByText(/one of two description formats per scenario/)).toBeVisible();
  await expect(page.getByText('Media Modality', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'About Media Modality' })).toBeVisible();
  await expect(page.getByText('Forensic Goal & Task', { exact: true })).toBeVisible();
  await expect(page.getByText('Search & Analysis Scope', { exact: true })).toBeVisible();
  await expect(page.getByText('Evidentiary Features', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'About Media Modality' }).hover();
  await expect(page.getByText(/type of media that is being used/i)).toBeVisible();
  await page.getByText('Face Swap', { exact: true }).first().hover();
  await expect(page.getByText(/Forensic Goal & Task → Forgery & Manipulation Detection/)).toBeVisible();
  await nextClick(page);

  await expect(page.getByRole('heading', { name: 'Task A' })).toBeVisible();
  await nextClick(page);

  await expect(page.getByText('Read the scenario and technique materials on the right first')).toBeVisible();
  await expect(page.getByText('You do not need to open every section')).toBeVisible();
  await expect(page.getByText('In one or two sentences, briefly explain the reasoning behind your judgment.')).toBeVisible();
  await expect(page.getByText('If you selected ‘Not enough information to decide,’ what is the main blocker?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  await expect(page.getByText('1 — Not at all confident')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Scenario description' })).toHaveCount(0);
  const summary = page.getByRole('button', { name: 'AI summary' }).first();
  await summary.click();
  await expect(summary).toHaveAttribute('aria-expanded', 'true');
  const summaryText = page.locator('[data-interaction-region="summary"] p').first();
  await expect(summaryText).toBeVisible();
  await expect(summaryText).toHaveText(/.{20,}/);
  await expect(summaryText).not.toContainText('PLACEHOLDER');
  await summary.click();
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await answerFirstTaskA(page);
});

test('ontology technique evaluation inserts a required Task A attention check after four trials', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1400, height: 900 });
  await resetClientStudyState(page);
  await openStudyFromLanding(
    page,
    'Your Studies',
    'Ontology-supported descriptions of digital media forensic techniques',
  );

  await page.getByPlaceholder('TEST-your-name-or-run').fill('TEST-e2e-attention');
  await page.getByRole('radio', { name: /I agree to participate/i }).click();
  await nextClick(page);
  await expect(page.getByText('Keyword supported')).toBeVisible();
  await nextClick(page);
  await expect(page.getByRole('heading', { name: 'Task A' })).toBeVisible();
  await advanceStudyComponent(page);
  await expect(page.getByRole('radio', { name: 'Yes, it applies' })).toBeVisible({ timeout: 20000 });

  await advanceStudyComponent(page);
  await expect(page.getByRole('radio', { name: 'Yes, it applies' })).toBeVisible({ timeout: 20000 });
  await advanceStudyComponent(page);
  await expect(page.getByRole('radio', { name: 'Yes, it applies' })).toBeVisible({ timeout: 20000 });
  await advanceStudyComponent(page);
  await expect(page.getByRole('radio', { name: 'Yes, it applies' })).toBeVisible({ timeout: 20000 });
  await advanceStudyComponent(page);

  await expect(page.locator('#attention-check-a')).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('[This is an attention check]')).toBeVisible();
  await expect(page.getByText('Public figure clip on a messaging app')).toBeVisible();
  await expect(page.getByText(/set confidence to 1 for this item only/i)).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Yes, it applies' })).toHaveCount(0);
  await expect(page.getByRole('radio', { name: 'Not determinable', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByRole('radio', { name: 'Not determinable', exact: true }).click();
  await page.getByRole('radio', { name: '1 — Not at all confident' }).click();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
});

test('ontology technique evaluation captures and locks a Prolific ID', async ({ page }) => {
  await resetClientStudyState(page);
  await openStudyFromLanding(
    page,
    'Your Studies',
    'Ontology-supported descriptions of digital media forensic techniques',
  );

  const studyUrl = new URL(page.url());
  studyUrl.searchParams.set('PROLIFIC_PID', 'prolific-e2e-123');
  await page.goto(studyUrl.toString());

  await expect(page.getByText('Prolific ID detected', { exact: true })).toBeVisible();
  const participantId = page.getByLabel('Participant identifier');
  await expect(participantId).toHaveValue('prolific-e2e-123');
  await expect(participantId).toBeDisabled();
  await expect(page.getByText('Testing mode', { exact: true })).toHaveCount(0);
});

test('declining consent sends participants to the Prolific screen-out URL, not the completion URL', async ({ page }) => {
  await resetClientStudyState(page);
  await openStudyFromLanding(
    page,
    'Your Studies',
    'Ontology-supported descriptions of digital media forensic techniques',
  );

  await page.getByPlaceholder('TEST-your-name-or-run').fill('TEST-e2e-decline');
  await page.getByRole('radio', { name: /I do not agree to participate/i }).click();
  await nextClick(page);

  await expect(page.getByRole('heading', { name: /chose not to participate/i })).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/Because you did not agree to the consent form/)).toBeVisible();
  await expect(page.getByText(/This only records that you declined/)).toBeVisible();
  await expect(page.getByText(/not payment for completing the study/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Return to Prolific', exact: true })).toBeEnabled();
  await expect(page.getByRole('link', { name: 'open this Prolific link' })).toHaveAttribute(
    'href',
    'https://app.prolific.com/submissions/complete?cc=C1CR6OHI',
  );
  await expect(page.getByText('C25X6SWF')).toHaveCount(0);
  await expect(page.getByText('Keyword supported')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Submit and return to Prolific', exact: true })).toHaveCount(0);
});
