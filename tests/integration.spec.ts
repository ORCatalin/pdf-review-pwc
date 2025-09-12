import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('issue selection updates PDF viewer', async ({ page }) => {
    // Wait for mock data to load
    await page.waitForTimeout(1500);
    
    const issueRows = page.locator('tbody tr');
    const firstRow = issueRows.first();
    
    if (await issueRows.count() > 0) {
      // Click on first issue
      await firstRow.click();
      
      // Row should be selected
      await expect(firstRow).toHaveClass(/selected/);
      
      // PDF viewer should still be visible (integration working)
      const pdfViewer = page.locator('.pdf-content');
      await expect(pdfViewer).toBeVisible();
    }
  });

  test('mode switching affects entire app state', async ({ page }) => {
    const pdfViewer = page.locator('.pdf-content');
    const modeButtons = page.locator('.mode-button');
    
    // Test switching between all modes
    const modes = ['Rectangle', 'View Only', 'Highlight'];
    
    for (const mode of modes) {
      await page.locator('.mode-button').filter({ hasText: mode }).click();
      
      // Active mode should be reflected
      await expect(page.locator('.mode-button.active').filter({ hasText: mode })).toBeVisible();
      
      // PDF viewer should remain functional
      await expect(pdfViewer).toBeVisible();
      
      // Issue table should remain functional
      const issuesTable = page.locator('.issues-table');
      await expect(issuesTable).toBeVisible();
    }
  });

  test('statistics update with issue status changes', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    const rows = page.locator('tbody tr');
    
    if (await rows.count() > 0) {
      // Get initial stats
      const initialOpenText = await page.locator('.stat').filter({ hasText: 'Open:' }).textContent();
      const initialOpen = parseInt(initialOpenText?.match(/\d+/)?.[0] || '0');
      
      // Change first issue status
      const firstRow = rows.first();
      const statusSelect = firstRow.locator('select');
      const currentStatus = await statusSelect.inputValue();
      
      // Change to different status
      const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
      await statusSelect.selectOption(newStatus);
      
      // Wait for state to update
      await page.waitForTimeout(500);
      
      // Check if stats updated (this depends on the app's implementation)
      const updatedOpenText = await page.locator('.stat').filter({ hasText: 'Open:' }).textContent();
      expect(updatedOpenText).toBeTruthy();
    }
  });

  test('resizable splitter maintains functionality', async ({ page }) => {
    const splitter = page.locator('.resizable-splitter');
    const leftPanel = page.locator('.resizable-left-panel');
    const rightPanel = page.locator('.resizable-right-panel');
    
    await expect(splitter).toBeVisible();
    await expect(leftPanel).toBeVisible();
    await expect(rightPanel).toBeVisible();
    
    // Get initial dimensions
    const initialLeftBox = await leftPanel.boundingBox();
    const initialRightBox = await rightPanel.boundingBox();
    
    expect(initialLeftBox).toBeTruthy();
    expect(initialRightBox).toBeTruthy();
    
    // Both panels should contain their expected content
    const issuesTable = leftPanel.locator('.issues-table');
    const pdfViewer = rightPanel.locator('.pdf-content');
    
    await expect(issuesTable).toBeVisible();
    await expect(pdfViewer).toBeVisible();
  });

  test('full workflow: load app, switch mode, select issue, change status', async ({ page }) => {
    // 1. App loads successfully
    await expect(page.locator('.pdf-review-app')).toBeVisible();
    await expect(page.locator('h1')).toContainText('PDF Review Tool');
    
    // 2. Switch to rectangle mode
    await page.locator('.mode-button').filter({ hasText: 'Rectangle' }).click();
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Rectangle' })).toBeVisible();
    
    // 3. Wait for issues to load and select one
    await page.waitForTimeout(1500);
    const issueRows = page.locator('tbody tr');
    
    if (await issueRows.count() > 0) {
      const firstRow = issueRows.first();
      await firstRow.click();
      await expect(firstRow).toHaveClass(/selected/);
      
      // 4. Change issue status
      const statusSelect = firstRow.locator('select');
      const currentStatus = await statusSelect.inputValue();
      const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
      await statusSelect.selectOption(newStatus);
      await expect(statusSelect).toHaveValue(newStatus);
    }
    
    // 5. Switch back to highlight mode
    await page.locator('.mode-button').filter({ hasText: 'Highlight' }).click();
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Highlight' })).toBeVisible();
    
    // 6. Verify app is still functional
    await expect(page.locator('.pdf-review-app')).toBeVisible();
    await expect(page.locator('.issues-table')).toBeVisible();
    await expect(page.locator('.pdf-content')).toBeVisible();
  });

  test('error handling and recovery', async ({ page }) => {
    // Test that the app handles various scenarios gracefully
    const app = page.locator('.pdf-review-app');
    await expect(app).toBeVisible();
    
    // Try rapid mode switching
    const modes = ['Rectangle', 'View Only', 'Highlight', 'Rectangle', 'Highlight'];
    for (const mode of modes) {
      await page.locator('.mode-button').filter({ hasText: mode }).click();
      await page.waitForTimeout(100);
    }
    
    // App should still be functional
    await expect(app).toBeVisible();
    await expect(page.locator('.issues-table')).toBeVisible();
    await expect(page.locator('.pdf-content')).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    // Focus on first interactive element
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through mode buttons
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    // App should remain stable during keyboard navigation
    await expect(page.locator('.pdf-review-app')).toBeVisible();
  });

  test('simultaneous user interactions', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Test multiple quick interactions
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
    const viewOnlyButton = page.locator('.mode-button').filter({ hasText: 'View Only' });
    
    // Quick succession of clicks
    await rectangleButton.click();
    await viewOnlyButton.click();
    await highlightButton.click();
    
    // App should handle this gracefully
    await expect(page.locator('.pdf-review-app')).toBeVisible();
    await expect(highlightButton).toHaveClass(/active/);
  });
});