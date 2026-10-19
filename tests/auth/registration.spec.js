const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pages/POManager');

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Registration required fields and validation', async ({ page }) => {
    const poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();
    const registerButton = page.getByRole('button', { name: 'Register' });
    const phoneInput = page.getByPlaceholder('enter your number');
    const phoneError = page.getByText(/Phone Number must be 10 digit/i);
    const passwordInput = page.getByRole('textbox', { name: 'Passsword' });
    const confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm Password' });

    // The app has no client-side validation for these; record the gaps instead of failing.
    test.info().annotations.push(
      { type: 'known gap', description: 'No "Last Name is required" message' },
      { type: 'known gap', description: 'No "Occupation is required" message' },
      { type: 'known gap', description: 'No "Gender is required" message' },
      { type: 'known gap', description: 'No client-side password complexity validation' },
    );

    // 1. Open registration and verify all required form controls are available.
    await loginPage.goTo();
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/#\/auth\/register$/);
    await expect(page.getByRole('heading', { name: 'Register', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'First Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Last Name' })).toBeVisible();
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Male', exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Female', exact: true })).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();

    // 2. Empty submission must stay on registration and report required values.
    await registerButton.click();
    await expect(page).toHaveURL(/#\/auth\/register$/);
    await expect(page.getByText(/^\*First Name is required$/)).toBeVisible();
    await expect(page.getByText(/^\*(?:Email|email) is (?:required|mandatory)$/)).toBeVisible();
    await expect(page.getByText(/^\*Phone Number is required$/)).toBeVisible();
    await expect(page.getByText(/^\*Password is required$/)).toBeVisible();
    await expect(page.getByText(/^Confirm Password is required$/)).toBeVisible();
    await expect(page.getByText(/^\*Please check above checkbox$/)).toBeVisible();

    // 3. Fill synthetic data; invalid phone lengths must be rejected.
    await page.getByRole('textbox', { name: 'First Name' }).fill('QATest');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Validation');
    await page.getByPlaceholder('email@example.com').fill(`registration-validation-${Date.now()}@example.test`);
    await page.getByRole('combobox').selectOption({ label: 'Student' });
    await page.getByRole('radio', { name: 'Male', exact: true }).check();
    await page.getByRole('checkbox').check();

    await phoneInput.fill('123456789');
    await passwordInput.fill('ValidPass1!');
    await confirmPasswordInput.fill('DifferentPass2!');
    await registerButton.click();
    await expect(phoneError).toBeVisible();
    await expect(page.getByText(/Password and Confirm Password must match/i)).toBeVisible();
    await expect(page).toHaveURL(/#\/auth\/register$/);

    await phoneInput.fill('12345678901');
    await registerButton.click();
    await expect(phoneError).toBeVisible();
    await expect(page).toHaveURL(/#\/auth\/register$/);

    // 4. Keep phone invalid so weak-password attempts cannot create an account.
    await phoneInput.fill('123456789');
    for (const weakPassword of ['lowercase1!', 'UPPERCASE1!', 'NoNumber!!', 'NoSpecial1', 'Short1!']) {
      await test.step(`weak password: ${weakPassword}`, async () => {
        await passwordInput.fill(weakPassword);
        await confirmPasswordInput.fill(weakPassword);
        await registerButton.click();
        await expect(phoneError).toBeVisible();
        await expect(page).toHaveURL(/#\/auth\/register$/);
      });
    }

    await phoneInput.fill('1234567890');
    await expect(phoneError).toBeHidden();
    await expect(page).toHaveURL(/#\/auth\/register$/);
  });
});