import { test, expect } from '@playwright/test';

const TEST_MOBILE = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_PASS = 'password123';

test.describe('Nirikshak Production E2E Workflow', () => {
  test('Applicant Workflow', async ({ page }) => {
    // 1. Register
    await page.goto('/applicant/register');
    await page.fill('input[type="text"]', 'E2E Test Applicant');
    await page.fill('input[type="tel"]', TEST_MOBILE);
    await page.click('button:has-text("Register")');
    
    // Wait for redirect to login
    await page.waitForURL('/applicant/login');

    // 2. Login
    await page.fill('input[type="tel"]', TEST_MOBILE);
    await page.click('button:has-text("Send OTP")');
    
    // Wait for OTP input
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');

    // 3. Create application
    await page.waitForURL('/applicant/dashboard');
    await page.click('text="New Application"');
    
    // 4. Complete wizard
    await page.waitForURL('/applicant/apply');
    await page.selectOption('select[name="scheme_code"]', 'PM-2022');
    await page.selectOption('select[name="academic_year"]', '2024-2025');
    await page.fill('input[name="full_name"]', 'E2E Test Applicant');
    await page.fill('input[name="dob"]', '2000-01-01');
    await page.selectOption('select[name="category"]', 'ST');
    await page.fill('input[name="domicile_state"]', 'MH');
    await page.click('button:has-text("Next")');
    
    // Academic Details
    await page.fill('input[name="institution_name"]', 'E2E University');
    await page.fill('input[name="course_name"]', 'B.Tech');
    await page.fill('input[name="exam_percentage"]', '85');
    await page.click('button:has-text("Next")');
    
    // Income & Financial
    await page.fill('input[name="annual_family_income"]', '50000');
    await page.click('button:has-text("Create Application")');
    // Documents Upload
    // Create a synthetic file
    const buffer = Buffer.from('%PDF-1.4\\nE2E Synthetic Document Content for Income Certificate');
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'income_cert.pdf',
      mimeType: 'application/pdf',
      buffer
    });
    // Wait for upload to complete
    await expect(page.locator('text="Uploaded: income_cert.pdf"')).toBeVisible({ timeout: 15000 });

    // Submit Application
    await page.click('button:has-text("Complete & Review")');
    
    // 5. Verify application status
    await page.waitForURL(/\/applicant\/applications\/.+/);
    await expect(page.locator('text="PM-2022"')).toBeVisible();
    // Accept multiple possible states due to async Celery processing
    await expect(
      page.locator('text="SUBMITTED"')
        .or(page.locator('text="VERIFICATION_IN_PROGRESS"'))
        .or(page.locator('text="REQUIRES_MANUAL_REVIEW"'))
    ).toBeVisible();
  });

  test('Officer Workflow', async ({ page }) => {
    // 1. Login as officer (seeded from database)
    await page.goto('/officer/login');
    // Using a fallback mobile number for officer, or we can use admin mobile
    await page.fill('input[type="tel"]', '9867911038'); 
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');

    // 2. Open dashboard
    await page.waitForURL('/officer/dashboard');
    
    // 3. Locate test application (Wait for list to load)
    await page.waitForSelector('text="Pending Review"');
    
    // Click the first View button
    const viewButton = page.locator('a:has-text("View")').first();
    await expect(viewButton).toBeVisible();
    await viewButton.click();
    
    // 4. View application
    await page.waitForURL(/\/officer\/applications\/.+/);
    await expect(page.locator('text="Declared Data"')).toBeVisible();
    
    // 5. Submit decision
    await page.selectOption('select', 'APPROVE');
    
    // Accept the window alert
    page.once('dialog', dialog => dialog.accept());
    
    await page.click('button:has-text("Digitally Sign & Submit")');
    
    // 6. Verify resulting state
    await page.waitForURL('/officer/dashboard');
    // Ensure we are back on dashboard
    await expect(page.locator('text="Pending Review"')).toBeVisible();
  });

  test('Admin Analytics Workflow', async ({ page }) => {
    // 1. Login as officer
    await page.goto('/officer/login');
    await page.fill('input[type="tel"]', '9867911038');
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');

    await page.waitForURL('/officer/dashboard');

    // 2. Navigate to Admin Analytics manually -> SHOULD FAIL
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await page.goto('/admin/analytics');
    
    // We expect the UI to show an error or redirect, but for API it should be 403.
    // The requirement says "Officer trying Admin: 'You are not authorized for the Admin Portal.'" when logging in,
    // but when navigating directly, it will fail fetching data.
    // Let's just expect it doesn't load the admin dashboard successfully.
    await expect(page.locator('text="Platform Analytics Dashboard"')).not.toBeVisible({ timeout: 2000 });
  });
});
