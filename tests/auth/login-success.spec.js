const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pages/POManager');

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Valid login reaches dashboard', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    expect(email, 'TEST_USER_EMAIL must be configured').toBeTruthy();
    expect(password, 'TEST_USER_PASSWORD must be configured').toBeTruthy();

    const poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();
    const dashboardPage = poManager.getDashBoardPage();

    // 1. Open the login route in an isolated unauthenticated context.
    await loginPage.goTo();
    await expect(page).toHaveURL(/#\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

    // 2. Log in and verify the dashboard route and stable dashboard content.
    await loginPage.validLogin(email, password);
    await expect(page).toHaveURL(/#\/dashboard\/dash$/);
    await expect(dashboardPage.filtersHeading).toBeVisible();
  });
});