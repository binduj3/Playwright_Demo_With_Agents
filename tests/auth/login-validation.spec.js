const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pages/POManager');

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Login field validation and password masking', async ({ page }) => {
    const poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();
    const emailInput = page.getByPlaceholder('email@example.com');
    const passwordInput = page.getByPlaceholder('enter your passsword');

    // 1. Submit with both fields empty and verify their required messages.
    await loginPage.goTo();
    await expect(page).toHaveURL(/#\/auth\/login$/);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Email is required', { exact: false })).toBeVisible();
    await expect(page.getByText('Password is required', { exact: false })).toBeVisible();

    // 2. Enter an invalid email and verify the format message.
    await emailInput.fill('not-an-email');
    await passwordInput.fill('some-password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Enter Valid Email', { exact: false })).toBeVisible();

    // 3. Confirm the password input masks the entered value.
    await passwordInput.fill('masked-test-value');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});