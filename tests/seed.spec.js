import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // generate code here.

 await page.goto('#/auth/login');
    await page.getByPlaceholder('email@example.com').fill(process.env.TEST_USER_EMAIL);
    await page.getByPlaceholder('enter your passsword').fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('#/dashboard/dash');
  });
});
