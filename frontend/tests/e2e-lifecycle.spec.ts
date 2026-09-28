import { test, expect } from '@playwright/test';

const TEST_MOBILE = `55${Math.floor(10000000 + Math.random() * 90000000)}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_PASS = 'password123';
const OFFICER_MOBILE = '9867911038';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OFFICER_PASS = 'Password123!';

test.describe('Nirikshak Phase 5 E2E Lifecycle', () => {
  // Use serial mode because the tests depend on each other's state
  test.describe.configure({ mode: 'serial' });

  let appId: string | null = null;

  test('Applicant creates and submits application', async ({ page }) => {
    // 1. Register Applicant
    await page.goto('/applicant/register');
    await page.fill('input[type="text"]', 'Lifecycle Test Applicant');
    await page.fill('input[type="tel"]', TEST_MOBILE);
    await page.click('button:has-text("Register")');
    await page.waitForURL('/applicant/login');

    // 2. Login Applicant
    await page.fill('input[type="tel"]', TEST_MOBILE);
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');
    await page.waitForURL('/applicant/dashboard');

    // 3. Create application
    await page.click('text="New Application"');
    await page.waitForURL('/applicant/apply');
    
    // Complete wizard
    await page.selectOption('select[name="scheme_code"]', 'PM-2022');
    await page.selectOption('select[name="academic_year"]', '2024-2025');
    await page.fill('input[name="full_name"]', 'Lifecycle Test Applicant');
    await page.fill('input[name="dob"]', '2000-01-01');
    await page.selectOption('select[name="category"]', 'ST');
    await page.fill('input[name="domicile_state"]', 'MH');
    await page.click('button:has-text("Next")');
    
    // Academic Details
    await page.fill('input[name="institution_name"]', 'Lifecycle University');
    await page.fill('input[name="course_name"]', 'B.Tech');
    await page.fill('input[name="exam_percentage"]', '88');
    await page.click('button:has-text("Next")');
    
    // Income & Financial
    await page.fill('input[name="annual_family_income"]', '45000');
    await page.click('button:has-text("Create Application")');
    
    // Documents Upload
    const buffer = Buffer.from('%PDF-1.4\\nE2E Lifecycle Document Content');
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'income_cert.pdf',
      mimeType: 'application/pdf',
      buffer
    });
    await expect(page.locator('text="Uploaded: income_cert.pdf"')).toBeVisible({ timeout: 15000 });

    // Submit Application
    await page.click('button:has-text("Complete & Review")');
    
    // Verify application status
    await page.waitForURL(/\/applicant\/applications\/.+/);
    await expect(page.locator('text="PM-2022"')).toBeVisible();
    
    const url = page.url();
    const match = url.match(/\/applicant\/applications\/(.+)/);
    appId = match ? match[1] : null;
    expect(appId).toBeTruthy();
  });

  test('Officer reviews and makes decision', async ({ page }) => {
    expect(appId).toBeTruthy();

    // 1. Login as Officer
    await page.goto('/applicant/login');
    await page.fill('input[type="tel"]', OFFICER_MOBILE);
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');
    await page.waitForURL('/officer/dashboard');

    // 2. Open specific application
    await page.goto(`/officer/applications/${appId}`);
    await page.waitForURL(`/officer/applications/${appId}`);
    
    // Verify application details loaded
    await expect(page.locator('text="Declared Data"')).toBeVisible();
    await expect(page.locator('text="Lifecycle Test Applicant"').first()).toBeVisible();

    // 3. Submit decision
    await page.selectOption('select', 'APPROVE');
    await page.fill('textarea', 'Approved by E2E Lifecycle test');
    
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Digitally Sign & Submit")');
    
    // Verify resulting state
    await page.waitForURL('/officer/dashboard');
    await expect(page.locator('text="Pending Review"')).toBeVisible();
  });

  test('Applicant verifies resulting state', async ({ page }) => {
    expect(appId).toBeTruthy();

    // 1. Login as Applicant again
    await page.goto('/applicant/login');
    await page.fill('input[type="tel"]', TEST_MOBILE);
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');
    await page.waitForURL('/applicant/dashboard');

    // 2. Check application detail
    await page.goto(`/applicant/applications/${appId}`);
    await page.waitForURL(`/applicant/applications/${appId}`);
    
    // 3. Verify it is approved
    await expect(page.locator('text="APPROVED"')).toBeVisible();
  });
});
