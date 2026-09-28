import { test, expect } from '@playwright/test';

test.describe('Nirikshak QA & Acceptance Suite', () => {

  test('Defect P1-A & P1-B & P1-C: Navigation and Footer Links are valid', async ({ page }) => {
    await page.goto('/');

    // Check header links
    const schemesLink = page.locator('nav').getByRole('link', { name: /Schemes/i });
    await expect(schemesLink).toHaveAttribute('href', '/schemes');

    const aboutLink = page.locator('nav').getByRole('link', { name: /About/i });
    await expect(aboutLink).toHaveAttribute('href', '/about');

    const contactLink = page.locator('nav').getByRole('link', { name: /Contact/i });
    await expect(contactLink).toHaveAttribute('href', '/contact');

    // Check footer links
    const rtiLink = page.locator('footer').getByRole('link', { name: /RTI/i });
    await expect(rtiLink).toHaveAttribute('href', '/contact');

    const privacyLink = page.locator('footer').getByRole('link', { name: /Privacy/i });
    await expect(privacyLink).toHaveAttribute('href', '/privacy');

    const termsLink = page.locator('footer').getByRole('link', { name: /Terms/i });
    await expect(termsLink).toHaveAttribute('href', '/terms');
  });

  test('Defect P1-D: Register page sign-in link routes correctly', async ({ page }) => {
    await page.goto('/applicant/register');
    
    const signInLink = page.getByRole('link', { name: /Sign in/i });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute('href', '/applicant/login');
  });

  test('Defect P1-F & P2-A/B/C: Multilingual translation is applied to landing page content', async ({ page }) => {
    await page.goto('/');
    
    // Default English
    await expect(page.getByText('Empowering Scheduled Tribes through Digital Scholarship Intelligence')).toBeVisible();

    // Switch to Hindi
    await page.locator('select').selectOption('hi');
    await expect(page.getByText('डिजिटल छात्रवृत्ति बुद्धिमत्ता के माध्यम से अनुसूचित जनजातियों को सशक्त बनाना')).toBeVisible();

    // Switch to Odia
    await page.locator('select').selectOption('or');
    await expect(page.getByText('ଡିଜିଟାଲ୍ ସ୍କଲାରସିପ୍ ଇଣ୍ଟେଲିଜେନ୍ସ ମାଧ୍ୟମରେ ଅନୁସୂଚିତ ଜନଜାତିର ସଶକ୍ତିକରଣ')).toBeVisible();
    
    // Switch back to English
    await page.locator('select').selectOption('en');
  });

  test('Defect P1-G & P2-D: Form inputs have explicit dark text colors for contrast', async ({ page }) => {
    await page.goto('/applicant/login');
    
    const emailInput = page.locator('input[type="tel"]');
    await expect(emailInput).toHaveClass(/text-slate-900/);
    await expect(emailInput).toHaveClass(/bg-white/);

    await page.goto('/applicant/register');
    
    const nameInput = page.locator('input[type="text"]');
    await expect(nameInput).toHaveClass(/text-slate-900/);
    await expect(nameInput).toHaveClass(/bg-white/);
  });

});
