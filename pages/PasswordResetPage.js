// pages/PasswordResetPage.js
class PasswordResetPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Enter New Password' });
    this.email = page.getByRole('textbox', { name: 'Enter your email address' });
    this.password = page.getByRole('textbox', { name: 'Passsword' });
    this.confirmPassword = page.getByRole('textbox', { name: 'Confirm Password' });
    this.saveButton = page.getByRole('button', { name: 'Save New Password' });
    this.loginLink = page.getByRole('link', { name: 'Login', exact: true });
  }

  async goTo() {
    await this.page.goto('#/auth/password-new');
  }
}

module.exports = { PasswordResetPage };