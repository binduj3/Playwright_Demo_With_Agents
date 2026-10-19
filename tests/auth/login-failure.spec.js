const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pages/POManager');

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Invalid credentials keep the customer on login', async ({ page }) => {
    const knownAccountEmail = process.env.TEST_USER_EMAIL;
    expect(knownAccountEmail, 'TEST_USER_EMAIL must be configured').toBeTruthy();

    const poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();

    // 1. Try credentials for an address reserved for negative testing.
    await loginPage.goTo();
    await expect(page).toHaveURL(/#\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

    await loginPage.validLogin(
      'nonexistent-user-qa@example.test',
      'IncorrectPassword!123',
    );
    await expect(page).toHaveURL(/#\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

    // 2. A known account with a wrong password must remain on the same login route.
    await loginPage.validLogin(knownAccountEmail, 'IncorrectPassword!123');
    await expect(page).toHaveURL(/#\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });
});