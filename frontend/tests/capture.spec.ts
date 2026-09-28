import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = 'C:/Users/souvi/.gemini/antigravity-ide/brain/b44bebe1-c033-4187-9583-4f961fd73547/scratch/screenshots';
const reportFile = path.join(outDir, 'report.json');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reportData: any[] = [];
const globalErrors: string[] = [];
const globalWarnings: string[] = [];
const globalNetworkFailures: string[] = [];

test.describe('Capture Visual Evidence', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  
  test('Capture Desktop and Mobile', async ({ browser }) => {
    test.setTimeout(120000);
    // Ensure output dir exists
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') globalErrors.push(msg.text());
      if (msg.type() === 'warning') globalWarnings.push(msg.text());
    });

    page.on('requestfailed', request => {
      globalNetworkFailures.push(request.url() + ' ' + request.failure()?.errorText);
    });

    page.on('response', response => {
      if (response.status() >= 400) {
         globalNetworkFailures.push(response.url() + ' ' + response.status());
      }
    });

    async function takeScreenshot(name: string, route: string, isMobile: boolean, requireAuth: boolean) {
      await page.waitForTimeout(1000); // Wait for animations
      
      const width = isMobile ? 390 : 1440;
      const height = isMobile ? 844 : 900;
      await page.setViewportSize({ width, height });
      
      // Wait for layout shift
      await page.waitForTimeout(500);

      // Check overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      const fileName = `${name}_${isMobile ? 'mobile' : 'desktop'}.png`;
      const filePath = path.join(outDir, fileName);
      await page.screenshot({ path: filePath, fullPage: true });

      // Identify if data is real or empty
      const html = await page.content();
      const hasEmptyState = html.includes('No applications found') || html.includes('No records') || html.includes('0') || html.includes('N/A');

      reportData.push({
        route,
        viewportSize: `${width}x${height}`,
        isMobile,
        emptyStateDisplayed: hasEmptyState,
        requireAuth,
        overflow,
        screenshotFile: filePath
      });
    }

    // --- DESKTOP ---
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Public Landing
    await page.goto('http://localhost:3000/');
    await takeScreenshot('01_public_landing', '/', false, false);

    // 2. Login
    await page.goto('http://localhost:3000/applicant/login');
    await takeScreenshot('02_login', '/applicant/login', false, false);

    // Register Applicant
    const TEST_MOBILE = `44${Math.floor(10000000 + Math.random() * 90000000)}`;
    await page.goto('http://localhost:3000/register');
    await page.fill('input[type="text"]', 'Visual Evidence Applicant');
    await page.fill('input[type="tel"]', TEST_MOBILE);
    await page.click('button:has-text("Register")');
    await page.waitForURL('http://localhost:3000/applicant/login');

    // Login Applicant
    await page.fill('input[type="tel"]', TEST_MOBILE);
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');

    // 3. Applicant Dashboard
    await page.waitForURL('http://localhost:3000/applicant/dashboard');
    await takeScreenshot('03_applicant_dashboard', '/applicant/dashboard', false, true);

    // Create Application
    await page.goto('http://localhost:3000/applicant/apply');
    await page.selectOption('select[name="scheme_code"]', 'PM-2022');
    await page.selectOption('select[name="academic_year"]', '2024-2025');
    await page.fill('input[name="full_name"]', 'Visual Evidence Applicant');
    await page.fill('input[name="dob"]', '2000-01-01');
    await page.selectOption('select[name="category"]', 'ST');
    await page.fill('input[name="domicile_state"]', 'MH');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="institution_name"]', 'VE University');
    await page.fill('input[name="course_name"]', 'B.Tech');
    await page.fill('input[name="exam_percentage"]', '85');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="annual_family_income"]', '50000');
    await page.click('button:has-text("Create Application")');
    
    // Upload document
    const buffer = Buffer.from('%PDF-1.4\\nTest');
    await page.locator('input[type="file"]').first().setInputFiles({ name: 'income_cert.pdf', mimeType: 'application/pdf', buffer });
    await expect(page.locator('text="Uploaded: income_cert.pdf"')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Complete & Review")');
    await page.waitForURL(/\/applicant\/applications\/.+/);

    const applicantAppUrl = page.url();
    const applicantAppId = applicantAppUrl.split('/').pop();

    // 4. Applicant Application
    await takeScreenshot('04_applicant_application', `/applicant/applications/${applicantAppId}`, false, true);

    // Logout and Login Officer
    await page.goto('http://localhost:3000/applicant/login');
    // We clear localStorage to simulate logout if needed, but going to login clears it in the app? Let's clear manually just in case
    await page.evaluate(() => { localStorage.clear(); });
    await page.goto('http://localhost:3000/applicant/login');
    await page.fill('input[type="tel"]', '9867911038');
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');

    // 5. Officer Dashboard
    await page.waitForURL('http://localhost:3000/officer/dashboard');
    await takeScreenshot('05_officer_dashboard', '/officer/dashboard', false, true);

    // Get an officer application ID
    // We'll just click the first "View" button
    const viewButton = page.locator('a:has-text("View")').first();
    let officerAppId = 'none';
    if (await viewButton.isVisible()) {
        await viewButton.click();
        await page.waitForURL(/\/officer\/applications\/.+/);
        officerAppId = page.url().split('/').pop() || 'none';
    } else {
        // Fallback if queue empty
        if (applicantAppId) {
            await page.goto(`http://localhost:3000/officer/applications/${applicantAppId}`);
            officerAppId = applicantAppId;
        }
    }

    // 6. Officer Application
    await takeScreenshot('06_officer_application', `/officer/applications/${officerAppId}`, false, true);

    // 7. Admin Analytics
    await page.goto('http://localhost:3000/admin/analytics');
    await takeScreenshot('07_admin_analytics', '/admin/analytics', false, true);


    // --- MOBILE ---

    // 8. Public Landing (Mobile)
    await page.goto('http://localhost:3000/');
    await takeScreenshot('08_public_landing', '/', true, false);

    // 9. Applicant Dashboard (Mobile)
    await page.evaluate(() => { localStorage.clear(); });
    await page.goto('http://localhost:3000/applicant/login');
    await page.fill('input[type="tel"]', TEST_MOBILE);
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');
    await page.waitForURL('http://localhost:3000/applicant/dashboard');
    await takeScreenshot('09_applicant_dashboard', '/applicant/dashboard', true, true);

    // 10. Officer Dashboard (Mobile)
    await page.evaluate(() => { localStorage.clear(); });
    await page.goto('http://localhost:3000/applicant/login');
    await page.fill('input[type="tel"]', '9867911038');
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Verify OTP")');
    await page.waitForURL('http://localhost:3000/officer/dashboard');
    await takeScreenshot('10_officer_dashboard', '/officer/dashboard', true, true);

    // 11. Officer Application (Mobile)
    if (officerAppId !== 'none') {
        await page.goto(`http://localhost:3000/officer/applications/${officerAppId}`);
        await takeScreenshot('11_officer_application', `/officer/applications/${officerAppId}`, true, true);
    }

    fs.writeFileSync(reportFile, JSON.stringify({
      screenshots: reportData,
      errors: globalErrors,
      warnings: globalWarnings,
      networkFailures: globalNetworkFailures
    }, null, 2));
  });
});
