const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pages/POManager');

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Forgot-password route displays the reset form', async ({ page }) => {
    const poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();

    // 1. Open the forgot-password page from login and verify its stable form controls.
    await loginPage.goTo();
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/#\/auth\/password-new$/);
    await expect(page.getByRole('heading', { name: 'Enter New Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter your email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Passsword' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save New Password' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();

    // 2. Leave the password unchanged and verify the login return route.
    await page.getByRole('link', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/#\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });
});