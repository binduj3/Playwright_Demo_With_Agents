// pages/DashboardPage.js
class DashboardPage {
  constructor(page) {
    this.filtersHeading = page.getByRole('heading', { name: 'Filters' });
  }
}

module.exports = { DashboardPage };