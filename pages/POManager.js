// pages/POManager.js
const { LoginPage } = require('./LoginPage');
const { DashboardPage } = require('./DashboardPage');
const { RegistrationPage } = require('./RegistrationPage');
const { PasswordResetPage } = require('./PasswordResetPage');


class POManager {
  constructor(page) {
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
    this.registrationPage = new RegistrationPage(page);
this.passwordResetPage = new PasswordResetPage(page);

  }

  getLoginPage() {
    return this.loginPage;
  }

  getDashBoardPage() {
    return this.dashboardPage;
  }

  getRegistrationPage() {
  return this.registrationPage;
}

getPasswordResetPage() {
  return this.passwordResetPage;
}
}

module.exports = { POManager };