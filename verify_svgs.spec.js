import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'index.html');

test('decorative SVGs have aria-hidden attribute', async ({ page }) => {
  await page.goto(`file://${filePath}`);

  // Verify SVGs in toggles
  const searchToggleSvg = page.locator('#search-toggle svg');
  await expect(searchToggleSvg).toHaveAttribute('aria-hidden', 'true');

  const themeToggleSun = page.locator('#theme-toggle .sun-icon');
  await expect(themeToggleSun).toHaveAttribute('aria-hidden', 'true');

  const themeToggleMoon = page.locator('#theme-toggle .moon-icon');
  await expect(themeToggleMoon).toHaveAttribute('aria-hidden', 'true');

  const backToTopSvg = page.locator('#back-to-top svg');
  await expect(backToTopSvg).toHaveAttribute('aria-hidden', 'true');

  // Verify dynamic copy button SVG
  const firstCopyBtnSvg = page.locator('.copy-btn svg').first();
  await expect(firstCopyBtnSvg).toHaveAttribute('aria-hidden', 'true');

  console.log('✅ All SVGs correctly have aria-hidden="true"');
});
