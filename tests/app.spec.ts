import { test, expect } from '@playwright/test';

test.describe('PDF Review App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the main page successfully', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('PDF Review Tool');
    await expect(page.locator('.pdf-review-app')).toBeVisible();
  });

  test('displays mode selector buttons', async ({ page }) => {
    const modeSelector = page.locator('.mode-selector');
    await expect(modeSelector).toBeVisible();
    
    // Check all three mode buttons are present
    await expect(page.locator('.mode-button').filter({ hasText: 'Highlight' })).toBeVisible();
    await expect(page.locator('.mode-button').filter({ hasText: 'Rectangle' })).toBeVisible();
    await expect(page.locator('.mode-button').filter({ hasText: 'View Only' })).toBeVisible();
    
    // Highlight mode should be active by default
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Highlight' })).toBeVisible();
  });

  test('switches between interaction modes', async ({ page }) => {
    // Start with highlight mode (default)
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Highlight' })).toBeVisible();
    
    // Click rectangle mode
    await page.locator('.mode-button').filter({ hasText: 'Rectangle' }).click();
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Rectangle' })).toBeVisible();
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Highlight' })).not.toBeVisible();
    
    // Click view only mode
    await page.locator('.mode-button').filter({ hasText: 'View Only' }).click();
    await expect(page.locator('.mode-button.active').filter({ hasText: 'View Only' })).toBeVisible();
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Rectangle' })).not.toBeVisible();
  });


  test('displays statistics counters', async ({ page }) => {
    const stats = page.locator('.stats');
    await expect(stats).toBeVisible();
    
    // Check all status counters are present
    await expect(page.locator('.stat').filter({ hasText: 'Open:' })).toBeVisible();
    await expect(page.locator('.stat').filter({ hasText: 'In Review:' })).toBeVisible();
    await expect(page.locator('.stat').filter({ hasText: 'Resolved:' })).toBeVisible();
  });

  test('displays issues table', async ({ page }) => {
    const issuesTable = page.locator('.issues-table');
    await expect(issuesTable).toBeVisible();
    
    // Check table has expected columns
    await expect(page.locator('th').filter({ hasText: 'ID' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Page' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Description' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Status' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Priority' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Category' })).toBeVisible();
  });

  test('displays PDF viewer', async ({ page }) => {
    // Wait a bit for the PDF to potentially load
    await page.waitForTimeout(2000);
    
    const pdfViewer = page.locator('.pdf-content');
    await expect(pdfViewer).toBeVisible();
  });

  test('has resizable splitter', async ({ page }) => {
    const splitter = page.locator('.resizable-splitter-container');
    await expect(splitter).toBeVisible();
    
    const leftPanel = page.locator('.resizable-left-panel');
    const rightPanel = page.locator('.resizable-right-panel');
    
    await expect(leftPanel).toBeVisible();
    await expect(rightPanel).toBeVisible();
  });

  test('handles mock issue data', async ({ page }) => {
    // Wait for mock data to load
    await page.waitForTimeout(1000);
    
    // Check if any issue rows are visible (mock data should be loaded)
    const issueRows = page.locator('tbody tr');
    await expect(issueRows.first()).toBeVisible();
    
    // Check that statistics reflect the mock data
    const openCount = await page.locator('.stat').filter({ hasText: 'Open:' }).textContent();
    const inReviewCount = await page.locator('.stat').filter({ hasText: 'In Review:' }).textContent();
    const resolvedCount = await page.locator('.stat').filter({ hasText: 'Resolved:' }).textContent();
    
    expect(openCount).toMatch(/Open: \d+/);
    expect(inReviewCount).toMatch(/In Review: \d+/);
    expect(resolvedCount).toMatch(/Resolved: \d+/);
  });
});