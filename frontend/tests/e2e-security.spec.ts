import { test, expect } from '@playwright/test';

const TEST_MOBILE_A = `88${Math.floor(10000000 + Math.random() * 90000000)}`;
const TEST_MOBILE_B = `77${Math.floor(10000000 + Math.random() * 90000000)}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_PASS = 'password123';

test.describe('Nirikshak Security Regression Suite', () => {
  test('BOLA: Applicant A cannot access Applicant B application', async ({ page, request }) => {
    // 1. Register Applicant A
    await page.goto('/applicant/register');
    await page.fill('input[type="text"]', 'Applicant A');
    await page.fill('input[type="tel"]', TEST_MOBILE_A);
    await page.click('button:has-text("Register")');
    await page.waitForURL('/applicant/login');

    // 2. Register Applicant B
    await page.goto('/applicant/register');
    await page.fill('input[type="text"]', 'Applicant B');
    await page.fill('input[type="tel"]', TEST_MOBILE_B);
    await page.click('button:has-text("Register")');
    await page.waitForURL('/applicant/login');

    // 3. Login Applicant A
    await page.fill('input[type="tel"]', TEST_MOBILE_A);
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');
    await page.waitForURL('/applicant/dashboard');

    // 4. Create App for A
    await page.goto('/applicant/apply');
    await page.fill('input[name="full_name"]', 'Applicant A');
    await page.fill('input[name="dob"]', '2000-01-01');
    await page.fill('input[name="domicile_state"]', 'MH');
    await page.click('button:has-text("Next")');

    await page.fill('input[name="institution_name"]', 'Test Inst');
    await page.fill('input[name="course_name"]', 'Test Course');
    await page.click('button:has-text("Next")');

    await page.fill('input[name="annual_family_income"]', '50000');
    // Using API intercept to capture created app ID
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/applications/') && res.request().method() === 'POST'),
      page.click('button:has-text("Create Application")')
    ]);
    const appData = await response.json();
    const appA_id = appData.application_id;

    // 5. Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL('/');

    // 6. Login Applicant B
    await page.goto('/applicant/login');
    await page.fill('input[type="tel"]', TEST_MOBILE_B);
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');
    await page.waitForURL('/applicant/dashboard');

    // 7. Try to access Applicant A's application via UI
    await page.goto(`/applicant/applications/${appA_id}`);
    
    // Expect redirection to dashboard or 403 error page. 
    await expect(page.locator('text="AUTHORIZATION_DENIED"').or(page.locator('text="403"')).or(page.locator('text="Unauthorized"'))).toBeVisible();
    
    // Test API Directly
    const token = await page.evaluate(() => localStorage.getItem('nirikshak_token'));
    const apiRes = await request.get(`http://127.0.0.1:8000/api/v1/applications/${appA_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(apiRes.status()).toBe(403);
  });

  test('RBAC: Applicant cannot access officer dashboard or admin analytics', async ({ page }) => {
    const TEST_MOBILE_C = `66${Math.floor(10000000 + Math.random() * 90000000)}`;
    await page.goto('/applicant/register');
    await page.fill('input[type="text"]', 'Applicant C');
    await page.fill('input[type="tel"]', TEST_MOBILE_C);
    await page.click('button:has-text("Register")');
    await page.waitForURL('/applicant/login');

    await page.goto('/applicant/login');
    await page.fill('input[type="tel"]', TEST_MOBILE_C);
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');
    await page.waitForURL('/applicant/dashboard');

    await page.goto('/officer/dashboard');
    await page.waitForURL('/');

    await page.goto('/admin/analytics');
    await page.waitForURL('/applicant/login'); // the layout checks user role and redirects
  });
});
