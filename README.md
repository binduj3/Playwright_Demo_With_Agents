# Playwright_Demo_With_Agents

## Environment variables

Copy `.env.example` to `.env` and fill in the values for your environment. `.env`
is ignored by Git, so credentials and other local secrets are not committed.

- `BASE_URL` overrides the default application URL used by Playwright.
- `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are available to tests through
  `process.env` when authentication is needed.

Keep `.env.example` limited to non-secret placeholders; never put real
credentials in it.
