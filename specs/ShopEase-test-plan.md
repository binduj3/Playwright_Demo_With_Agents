# ShopEase Customer App — Stable Playwright Test Plan

## Application Overview

Concise test plan for https://rahulshettyacademy.com/client/, based on the supplied SE-SRS-001 v1.2 and exploratory review. Organize implementation by feature and use page objects managed by POManager. Do not use tests/seed.spec.js as a prerequisite; it was only used to start exploration. Use a custom authenticated fixture for protected-page tests: reuse a valid authenticated browser state when available, verify it by reaching the dashboard and checking a stable dashboard element, and establish authentication only when the saved state is missing or expired. Keep login behavior tests in a separate unauthenticated context. Verify successful login by the dashboard URL and stable dashboard content, not a transient toast. Use isolated browser contexts, controlled test accounts/data, environment-based credentials, deterministic setup/cleanup, semantic locators, Playwright auto-waiting assertions, and no fixed sleeps. Avoid concurrent mutation of the same shared account's cart/orders; use per-worker accounts or serialize state-changing tests. Suggested POMs: LoginPage, RegistrationPage, DashboardPage, ProductDetailsPage, CartPage, CheckoutPage, OrdersPage, OrderDetailsPage; create/get these through POManager. The app uses hash routes under /client/ such as #/auth/login and #/dashboard/dash. The SRS open questions on lockout and duplicate-product behavior remain unresolved; characterize and report them rather than assuming expected behavior.

## Test Scenarios

### 1. Authentication (unauthenticated context; no authenticated fixture)

**Seed:** `tests/fixtures/auth.fixture.js (authenticated fixture is not used for these tests)`

#### 1.1. Valid login reaches dashboard

**File:** `tests/auth/login-success.spec.js`

**Steps:**
  1. Create an isolated unauthenticated browser context and open the login route.
    - expect: The login page is shown.
  2. Enter valid test credentials from environment variables and submit Login.
    - expect: The URL reaches the dashboard route (#/dashboard/dash).
    - expect: A stable dashboard element, such as the product listing or Filters heading, is visible. Do not use the transient success toast as the login success assertion.

#### 1.2. Invalid credentials keep the customer on login

**File:** `tests/auth/login-failure.spec.js`

**Steps:**
  1. Create an isolated unauthenticated context and submit an invalid email/password pair.
    - expect: The URL remains on the login route.
    - expect: An error is displayed without revealing whether the email is registered.
  2. Repeat with a known test email and incorrect password; compare the error message category and content.
    - expect: The response does not disclose account existence.

#### 1.3. Login field validation and password masking

**File:** `tests/auth/login-validation.spec.js`

**Steps:**
  1. In a fresh unauthenticated context, submit the empty login form.
    - expect: Email-required and password-required validation messages are associated with the respective fields.
  2. Enter an invalid email format and a non-empty password.
    - expect: The email-format validation message appears.
  3. Enter a password value.
    - expect: The password input uses a masked input type.

#### 1.4. Registration required fields and validation

**File:** `tests/auth/registration.spec.js`

**Steps:**
  1. Open registration in an isolated unauthenticated context and inspect all form controls.
    - expect: First name, last name, email, phone, occupation, gender, password, confirm password, and age confirmation are available.
  2. Submit with required fields empty, then exercise phone values shorter and longer than 10 digits.
    - expect: Required fields are reported and non-10-digit phone values are rejected.
  3. Enter otherwise valid synthetic values and test mismatched passwords and passwords missing each complexity rule (uppercase, lowercase, number, special character, minimum 8 characters).
    - expect: Invalid password confirmation and complexity values are rejected.

#### 1.5. Unique valid registration succeeds

**File:** `tests/auth/registration-success.spec.js`

**Steps:**
  1. Use controlled synthetic data and a unique email to complete registration in an isolated context.
    - expect: Registration succeeds and a confirmation provides a path back to login.

#### 1.6. Existing email registration is rejected

**File:** `tests/auth/registration-duplicate.spec.js`

**Steps:**
  1. Attempt registration using the approved existing test account email and otherwise valid synthetic values.
    - expect: A clear duplicate-email error is shown and no account is created.

#### 1.7. Forgot-password page and submission

**File:** `tests/auth/forgot-password.spec.js`

**Steps:**
  1. Open the forgot-password route from login and inspect the displayed flow.
    - expect: The page provides the expected password recovery controls and a route back to login.
  2. Submit an approved test email only.
    - expect: A clear, safe outcome is shown without exposing account existence.

### 2. Authenticated customer journeys (custom authenticated fixture)

**Seed:** `tests/fixtures/auth.fixture.js`

#### 2.1. Authenticated fixture establishes a valid session

**File:** `tests/fixtures/auth.fixture.js`

**Steps:**
  1. Create a fresh isolated context using approved test credentials or a saved state for that test account. If a valid session is already present, do not log in again; if absent or expired, authenticate once.
    - expect: The fixture verifies the dashboard URL and a stable dashboard element before yielding the page.
    - expect: Credentials and storage state are not committed or logged. The fixture does not rely on a transient toast.

#### 2.2. Logout and protected route guard

**File:** `tests/auth/logout-protection.spec.js`

**Steps:**
  1. Use the authenticated fixture, sign out, then navigate directly to dashboard, cart, and orders routes.
    - expect: Each protected route redirects to login and does not expose protected content.
  2. Use browser Back after logout.
    - expect: The browser does not reveal protected pages or customer data.

#### 2.3. Product listing and search

**File:** `tests/catalog/product-list-search.spec.js`

**Steps:**
  1. Use the authenticated fixture and inspect dashboard product cards.
    - expect: Each card includes image, product name, price, View, and Add To Cart controls.
  2. Search for a known product name and press Enter, then search for a unique non-matching term.
    - expect: Matching products are shown for the known product.
    - expect: A no-products-found result is shown for the non-matching term.

#### 2.4. Combined catalog filters and product detail

**File:** `tests/catalog/filters-detail.spec.js`

**Steps:**
  1. Use the authenticated fixture and combine category, subcategory, audience, minimum price, and maximum price filters.
    - expect: Displayed results satisfy all applied filters and defined price bounds. Invalid/inverted ranges are handled without a misleading result.
  2. Open View for a known result.
    - expect: The detail page shows that product's name, price, description, and Add to Cart control.

#### 2.5. Cart additions, totals, removal, and empty state

**File:** `tests/cart/add-remove.spec.js`

**Steps:**
  1. Use an isolated authenticated account with an empty cart. Add one product and open Cart.
    - expect: The item is listed with name and price; header cart count increments by one.
  2. Remove the item and inspect the cart.
    - expect: The item is removed, total and header count update, and the empty state is shown without a Checkout action.

#### 2.6. Cart persists for the same user

**File:** `tests/cart/persistence.spec.js`

**Steps:**
  1. Use a dedicated test account, add a product, refresh, then sign out and sign back in as the same user.
    - expect: The cart contents and count persist after refresh and after re-authentication.

#### 2.7. Characterize repeated addition of the same product

**File:** `tests/cart/duplicate-product.spec.js`

**Steps:**
  1. Use a dedicated account with an empty cart; add the same product twice and inspect line items and quantity.
    - expect: Record the observed behavior. Mark pass/fail only after business resolves SRS open question Q2 (separate lines versus quantity two).

#### 2.8. Checkout details, country selection, and blocked invalid submission

**File:** `tests/checkout/checkout-validation.spec.js`

**Steps:**
  1. Use the authenticated fixture with a dedicated cart item and open checkout.
    - expect: Payment and shipping controls are present; shipping email is pre-filled with the authenticated user's email.
  2. Type a country prefix and select an item from the autocomplete suggestions.
    - expect: Suggestions can be selected and the selected country is accepted.
  3. In a separate isolated run, omit a valid selected country and attempt to place the order.
    - expect: Submission is blocked and a country validation error is displayed.

#### 2.9. Coupon results and total calculation

**File:** `tests/checkout/coupon.spec.js`

**Steps:**
  1. Use a dedicated checkout cart and apply a business-approved valid coupon.
    - expect: A success response is displayed and the total reflects the documented discount.
  2. In a separate run apply an invalid coupon.
    - expect: An error response is displayed and the total is not incorrectly discounted.

#### 2.10. Valid checkout creates order confirmation

**File:** `tests/checkout/place-order.spec.js`

**Steps:**
  1. Use an isolated account with known cart contents and sandbox payment data. Fill valid payment details and select a country from autocomplete.
    - expect: Checkout accepts the supplied test data and uses the signed-in user's shipping email.
  2. Place the order and inspect the confirmation.
    - expect: A thank-you confirmation is shown with one order ID per purchased product line.

#### 2.11. Order history and order detail match

**File:** `tests/orders/history-detail.spec.js`

**Steps:**
  1. Use an authenticated test account with at least two controlled orders and open Orders.
    - expect: History displays order ID, product, price, and date, sorted newest first.
  2. Open View for one order.
    - expect: Order details show the same order ID and matching order summary.

#### 2.12. Order data is isolated by customer

**File:** `tests/orders/data-isolation.spec.js`

**Steps:**
  1. Use customer A's authenticated fixture and verify a controlled customer B order is absent from A's history.
    - expect: Only customer A's orders are listed.
  2. Open customer B's known order-detail URL while authenticated as A.
    - expect: Access is denied or redirected, and customer B's order data is not disclosed.

#### 2.13. Delete a disposable test order

**File:** `tests/orders/delete.spec.js`

**Steps:**
  1. Use an authenticated account and a dedicated disposable order; verify it appears in history.
    - expect: The selected test order is present before deletion.
  2. Delete that order and handle any confirmation dialog using the expected user choice.
    - expect: The deleted order no longer appears in history.
