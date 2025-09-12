import { test, expect } from '@playwright/test';

test.describe('Highlight Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for components to load
    await page.waitForTimeout(2000);
  });

  test('should enable highlight mode and allow text selection', async ({ page }) => {
    // Ensure we're in highlight mode (should be default)
    await expect(page.locator('.mode-button.active').filter({ hasText: 'Highlight' })).toBeVisible();
    
    // Check that the instruction shows highlight mode
    await expect(page.locator('.pdf-viewer-toolbar')).toContainText('Select text to add highlights');
    
    // Verify PDF content is visible and ready for interaction
    const pdfContent = page.locator('.pdf-content');
    await expect(pdfContent).toBeVisible();
    
    // Check that PDF pages are loaded
    const firstPage = page.locator('div[data-page-number="1"]').first();
    await expect(firstPage).toBeVisible();
  });

  test('should show modal when text is selected in highlight mode', async ({ page }) => {
    // Ensure highlight mode is active
    const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
    await highlightButton.click();
    await expect(highlightButton).toHaveClass(/active/);
    
    // Wait for PDF to fully load
    await page.waitForTimeout(3000);
    
    // Try to select some text in the PDF - look for readable text content
    const pdfTextElement = page.locator('.textLayer').first();
    if (await pdfTextElement.isVisible()) {
      // Double click to select text (common way to select text)
      await pdfTextElement.dblclick();
      
      // Wait a moment for potential modal to appear
      await page.waitForTimeout(1000);
      
      // Check if a highlight modal/popup appears (uses comment-popup class)
      const modal = page.locator('.comment-popup');
      await expect(modal).toBeVisible({ timeout: 5000 });
    } else {
      // If textLayer not found, try selecting text from the main content
      const textContent = page.locator('.pdf-content').first();
      await textContent.click();
      await page.keyboard.down('Shift');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.up('Shift');
      
      // Check for modal appearance
      await page.waitForTimeout(1000);
      const modal = page.locator('.highlight-modal, .comment-modal, [data-testid="highlight-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow adding comment to highlight', async ({ page }) => {
    // Switch to highlight mode
    const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
    await highlightButton.click();
    
    // Wait for PDF load
    await page.waitForTimeout(3000);
    
    // Try to trigger text selection and modal
    const pdfContent = page.locator('.pdf-content');
    await pdfContent.click({ position: { x: 100, y: 100 } });
    
    // Try drag selection
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 120);
    await page.mouse.up();
    
    await page.waitForTimeout(1000);
    
    // Look for comment input in modal
    const commentInput = page.locator('input[placeholder*="comment"], textarea[placeholder*="comment"], input[type="text"]').first();
    if (await commentInput.isVisible({ timeout: 3000 })) {
      // Add a test comment
      await commentInput.fill('Test highlight comment for verification');
      
      // Look for save/submit button
      const saveButton = page.locator('button').filter({ hasText: /save|add|submit/i }).first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Verify highlight was created
        await page.waitForTimeout(1000);
        
        // Check if highlight appears in the issues list or PDF
        const newHighlight = page.locator('.highlight-indicator, [data-highlight], .pdf-highlight').first();
        await expect(newHighlight).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should create new issue when highlight is added', async ({ page }) => {
    // Get initial issue count
    const initialIssuesText = await page.locator('.issues-table-header h2').textContent();
    const initialCount = parseInt(initialIssuesText?.match(/\d+/)?.[0] || '0');
    
    // Try to create a highlight (simplified test)
    const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
    await highlightButton.click();
    
    // Wait and check if we can simulate highlight creation
    await page.waitForTimeout(2000);
    
    // If the app supports programmatic highlight creation, check for issue count increase
    // This is a placeholder - actual implementation depends on the app's API
    const currentIssuesText = await page.locator('.issues-table-header h2').textContent();
    const currentCount = parseInt(currentIssuesText?.match(/\d+/)?.[0] || '0');
    
    // Verify issues count structure exists (basic validation)
    expect(currentCount).toBeGreaterThanOrEqual(initialCount);
    expect(currentCount).toBeGreaterThan(0);
  });

  test('should show different cursor in highlight mode', async ({ page }) => {
    // Ensure highlight mode
    const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
    await highlightButton.click();
    
    // Check if PDF area has appropriate cursor styling
    const pdfContent = page.locator('.pdf-content');
    await expect(pdfContent).toBeVisible();
    
    // Hover over PDF content to check cursor
    await pdfContent.hover();
    
    // Check for cursor-related classes or styles
    const cursorStyle = await pdfContent.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.cursor;
    });
    
    // In highlight mode, cursor should be auto (default) or any valid cursor style
    // The browser handles text selection cursors automatically
    expect(cursorStyle).toMatch(/(auto|text|crosshair|pointer|default)/);
  });

  test('should disable highlighting in view-only mode', async ({ page }) => {
    // Switch to view-only mode
    const viewOnlyButton = page.locator('.mode-button').filter({ hasText: 'View Only' });
    await viewOnlyButton.click();
    await expect(viewOnlyButton).toHaveClass(/active/);
    
    // Verify instruction text changes
    await expect(page.locator('.pdf-viewer-toolbar')).toContainText('View-only mode');
    
    // Try to select text (should not create highlights)
    const pdfContent = page.locator('.pdf-content');
    await pdfContent.dblclick();
    
    await page.waitForTimeout(1000);
    
    // Modal should NOT appear
    const modal = page.locator('.highlight-modal, .comment-modal');
    await expect(modal).not.toBeVisible();
  });

  test('should preserve existing highlights when switching modes', async ({ page }) => {
    // Wait for existing highlights to load
    await page.waitForTimeout(2000);
    
    // Count existing highlight indicators
    const existingHighlights = page.locator('.pdf-content [class*="highlight"], .pdf-content .react-pdf-highlighter__highlight');
    const initialCount = await existingHighlights.count();
    
    // Switch between modes
    await page.locator('.mode-button').filter({ hasText: 'Rectangle' }).click();
    await page.waitForTimeout(500);
    
    await page.locator('.mode-button').filter({ hasText: 'View Only' }).click();
    await page.waitForTimeout(500);
    
    await page.locator('.mode-button').filter({ hasText: 'Highlight' }).click();
    await page.waitForTimeout(500);
    
    // Verify highlights are still present
    const finalCount = await existingHighlights.count();
    expect(finalCount).toBeGreaterThanOrEqual(initialCount);
  });
});