const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pages/POManager');

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Unique valid registration succeeds', async ({ page }) => {
    const poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();
    const uniqueEmail = `qa.registration.${Date.now()}@example.test`;

    // 1. Fill and submit a complete registration using unique synthetic data.
    await loginPage.goTo();
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/#\/auth\/register$/);
    await page.getByRole('textbox', { name: 'First Name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('TestAccount');
    await page.getByPlaceholder('email@example.com').fill(uniqueEmail);
    await page.getByPlaceholder('enter your number').fill('5551234567');
    await page.getByRole('combobox').selectOption({ label: 'Student' });
    await page.getByRole('radio', { name: 'Male', exact: true }).check();
    await page.getByRole('textbox', { name: 'Passsword' }).fill('ValidPass1!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('ValidPass1!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('heading', { name: 'Account Created Successfully' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // 2. Follow the confirmation action back to login.
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/#\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });
});