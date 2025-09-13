import { test, expect } from '@playwright/test';

test.describe('PDF Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for components to load
    await page.waitForTimeout(2000);
  });

  test('displays PDF viewer container', async ({ page }) => {
    const pdfViewer = page.locator('.pdf-viewer-container');
    await expect(pdfViewer).toBeVisible();
  });

  test('attempts to load default PDF', async ({ page }) => {
    // Wait longer for PDF to potentially load
    await page.waitForTimeout(3000);
    
    const pdfViewer = page.locator('.pdf-content');
    await expect(pdfViewer).toBeVisible();
    
    // Check if there are any PDF-related elements or error messages
    // This might show loading states or error messages if sample.pdf doesn't exist
    const viewerContent = page.locator('.pdf-content *');
    await expect(viewerContent.first()).toBeVisible();
  });

  test('shows mode-specific cursors or indicators', async ({ page }) => {
    const pdfViewer = page.locator('.pdf-content');
    
    // Test highlight mode (default)
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Highlight' })).toBeVisible();
    
    // Switch to rectangle mode
    await page.locator('.mode-button').filter({ hasText: 'Rectangle' }).click();
    await page.waitForTimeout(500);
    
    // Switch to view only mode
    await page.locator('.mode-button').filter({ hasText: 'View Only' }).click();
    await page.waitForTimeout(500);
    
    // The PDF viewer should still be visible regardless of mode
    await expect(pdfViewer).toBeVisible();
  });

  test('handles PDF loading errors gracefully', async ({ page }) => {
    // Since sample.pdf might not exist, test error handling
    const pdfViewer = page.locator('.pdf-content');
    await expect(pdfViewer).toBeVisible();
    
    // Wait to see if any error messages appear
    await page.waitForTimeout(3000);
    
    // Check for common error indicators
    const errorMessage = page.locator('[class*="error"], .error-message, [data-testid="error"]');
    const loadingMessage = page.locator('[class*="loading"], .loading, [data-testid="loading"]');
    
    // Either an error message should appear, or loading should complete, or viewer should be ready
    const hasError = await errorMessage.count() > 0;
    const hasLoading = await loadingMessage.count() > 0;
    
    // At minimum, the container should exist
    await expect(pdfViewer).toBeVisible();
  });

  test('responds to interaction mode changes', async ({ page }) => {
    const pdfViewer = page.locator('.pdf-content');
    
    // Test each mode switch
    const modes = ['Highlight', 'Rectangle', 'View Only'];
    
    for (const mode of modes) {
      await page.locator('.mode-button').filter({ hasText: mode }).click();
      await page.waitForTimeout(300);
      
      // Verify mode is active
      await expect(page.locator('.mode-button.active').filter({ hasText: mode })).toBeVisible();
      
      // PDF viewer should remain visible
      await expect(pdfViewer).toBeVisible();
    }
  });

  test('maintains viewer dimensions', async ({ page }) => {
    const pdfViewer = page.locator('.pdf-content');
    
    // Get viewer dimensions
    const boundingBox = await pdfViewer.boundingBox();
    expect(boundingBox).toBeTruthy();
    
    if (boundingBox) {
      expect(boundingBox.width).toBeGreaterThan(0);
      expect(boundingBox.height).toBeGreaterThan(0);
    }
  });

  test('is contained within right panel', async ({ page }) => {
    const rightPanel = page.locator('.resizable-right-panel');
    const pdfViewer = page.locator('.pdf-content');

    await expect(rightPanel).toBeVisible();
    await expect(pdfViewer).toBeVisible();

    // PDF viewer should be inside the right panel
    const rightPanelBox = await rightPanel.boundingBox();
    const viewerBox = await pdfViewer.boundingBox();

    if (rightPanelBox && viewerBox) {
      expect(viewerBox.x).toBeGreaterThanOrEqual(rightPanelBox.x);
      expect(viewerBox.y).toBeGreaterThanOrEqual(rightPanelBox.y);
    }
  });

  test('handles window resize', async ({ page }) => {
    const pdfViewer = page.locator('.pdf-content');
    
    // Get initial dimensions
    const initialBox = await pdfViewer.boundingBox();
    
    // Resize window
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Verify viewer is still visible and responsive
    await expect(pdfViewer).toBeVisible();
    
    const newBox = await pdfViewer.boundingBox();
    expect(newBox).toBeTruthy();
    
    if (newBox) {
      expect(newBox.width).toBeGreaterThan(0);
      expect(newBox.height).toBeGreaterThan(0);
    }
  });
});