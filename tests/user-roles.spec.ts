import { expect, test } from '@playwright/test';

test.describe('user roles with local storage admin', () => {
  test('settings page remains available to the local admin', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByText('Authentication is currently disabled.')).toBeVisible({ timeout: 15000 });
  });

  test('analysis manage tab is enabled for the local admin', async ({ page }) => {
    await page.goto('/analysis/stats/demo-html/summary');
    const manageTab = page.getByRole('tab', { name: 'Manage' });
    await expect(manageTab).toBeVisible({ timeout: 15000 });
    await expect(manageTab).toBeEnabled();
    await manageTab.click();
    await expect(page.getByRole('heading', { name: 'Data Collection' })).toBeVisible();
  });
});
