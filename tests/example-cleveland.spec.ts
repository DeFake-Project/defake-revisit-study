/* eslint-disable no-await-in-loop */
import { test, expect, Page } from '@playwright/test';
import { nextClick, openStudyFromLanding, waitForStudyEndMessage } from './utils';

async function expectChartMarks(page: Page, markSelector: string) {
  const vis = page.getByRole('main').locator('svg').first();
  await expect(vis).toBeVisible();
  // Wait for D3/layout to paint marks. A one-shot count() does not retry.
  await expect(vis.locator(markSelector).first()).toBeVisible();
}

test('Test example cleveland', async ({ page }) => {
  await openStudyFromLanding(
    page,
    'Example Studies',
    'Dynamic React.js Stimuli: A Graphical Perception Experiment',
  );

  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible({ timeout: 15000 });

  // Click on the next button
  await nextClick(page);

  // Check the page contains consent form
  const consent = await page.getByRole('heading', { name: 'Consent' });
  await expect(consent).toBeVisible();

  // Fill the consent form
  await page.getByPlaceholder('Please provide your signature').click();
  await page.getByPlaceholder('Please provide your signature').fill('test');
  await page.getByLabel('Accept').check();

  // Click on the next button
  await page.getByRole('button', { name: 'Agree' }).click();

  // Check the page contains the training image
  const trainingImg = await page.getByRole('main').getByRole('img');
  await expect(trainingImg).toBeVisible();

  // Click on the next button
  await nextClick(page);

  // Check for each practice question
  const questionArray = new Array(4).fill(null).map((val, idx) => idx);
  const visSearchArray = ['circle', 'rect', 'rect', 'path'];
  for (const idx of questionArray) {
    // Check the page contains the practice question
    const questionText = await page.getByText('Task:Two values are marked with dots. What percentage do you believe the smaller');
    await expect(questionText).toBeVisible();

    await expectChartMarks(page, visSearchArray[idx]);

    // Fill in answer guess
    await page.getByPlaceholder('0-100').fill('66');

    // Click on the check answer button
    await page.getByRole('button', { name: 'Check Answer' }).click();

    // Check that the correct answer is shown
    const correctAnswer = await page.getByText('You have answered the question correctly.');
    await expect(correctAnswer).toBeVisible();

    // Click on the next button
    await nextClick(page);
  }

  // Check that the next question does not have a check answer button
  await expect(await page.getByRole('button', { name: 'Check Answer' })).toBeHidden();

  // Check for each question
  const questionArray2 = new Array(10).fill(null).map((val, idx) => idx);
  const visSearchArray2 = ['circle', 'rect', 'rect', 'path', 'rect', 'circle', 'rect', 'rect', 'path', 'rect'];
  for (const idx of questionArray2) {
    // Check the page contains the question
    const questionText = await page.getByText('Task:Two values are marked with dots. What percentage do you believe the smaller');
    await expect(questionText).toBeVisible();

    await expectChartMarks(page, visSearchArray2[idx]);

    // Fill in answer
    await page.getByPlaceholder('0-100').fill('66');

    // Click on the next button
    await nextClick(page);
  }

  // Check for the post study survey and fill it out
  await page.getByPlaceholder('Enter your preference').click();
  await page.getByRole('option', { name: 'Bar', exact: true }).click();
  await page.getByPlaceholder('Enter your age here, range from 0 - 100').fill('25');
  await page.getByLabel('5', { exact: true }).check();
  await page.getByPlaceholder('Enter your comments here').fill('Test Test');
  await nextClick(page);

  // Check that the end of study text renders
  await waitForStudyEndMessage(page);
});
