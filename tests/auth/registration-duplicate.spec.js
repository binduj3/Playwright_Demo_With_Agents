const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pages/POManager');

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Existing email registration is rejected', async ({ page }) => {
    const registeredEmail = process.env.TEST_USER_EMAIL;
    expect(registeredEmail, 'TEST_USER_EMAIL must be configured').toBeTruthy();

    const poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();

    // 1. Submit otherwise valid registration data with the existing test account email.
    await loginPage.goTo();
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/#\/auth\/register$/);
    await page.getByRole('textbox', { name: 'First Name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('DuplicateCheck');
    await page.getByPlaceholder('email@example.com').fill(registeredEmail);
    await page.getByPlaceholder('enter your number').fill('5551234567');
    await page.getByRole('combobox').selectOption({ label: 'Student' });
    await page.getByRole('radio', { name: 'Male', exact: true }).check();
    await page.getByRole('textbox', { name: 'Passsword' }).fill('ValidPass1!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('ValidPass1!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/#\/auth\/register$/);
    await expect(page.getByRole('heading', { name: 'Register', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Account Created Successfully' })).not.toBeVisible();
    await expect(page.getByRole('alert')).toHaveText(/User already exisits with this Email Id!/i);
  });
});