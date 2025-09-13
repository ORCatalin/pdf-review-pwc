import { Page, expect } from '@playwright/test';

/**
 * Helper function to create a test issue via UI interaction
 */
export const createTestIssue = async (page: Page, comment = 'Test issue comment') => {
  // Wait for PDF to load completely
  await page.waitForTimeout(3000);

  // Ensure we're in highlight mode
  const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
  await highlightButton.click();
  await expect(highlightButton).toHaveClass(/active/);

  // Wait for mode to be set
  await page.waitForTimeout(500);

  // Try to find and select text in the PDF
  const pdfContent = page.locator('.pdf-content');
  await expect(pdfContent).toBeVisible();

  // Look for text content in the PDF pages
  const textInPDF = page.locator('span:has-text("securitatea"), span:has-text("Guvernul"), span:has-text("Art")').first();

  try {
    // Try to select text by double-clicking
    if (await textInPDF.isVisible({ timeout: 5000 })) {
      await textInPDF.dblclick();

      // Wait for comment popup to appear
      const commentPopup = page.locator('.comment-popup');
      if (await commentPopup.isVisible({ timeout: 5000 })) {
        // Fill in the comment
        const commentTextarea = commentPopup.locator('.comment-textarea');
        await commentTextarea.fill(comment);

        // Click confirm to create the issue
        const confirmButton = commentPopup.locator('.confirm-button');
        await confirmButton.click();

        // Wait for the issue to be created and appear in the table
        await page.waitForTimeout(1500);
        return true;
      }
    }
  } catch (error) {
    console.log('First attempt failed, trying alternative method');
  }

  // Alternative method: Try to select text manually
  try {
    // Click and drag to select text
    const pdfPageContent = page.locator('[data-page-number="1"]').first();
    if (await pdfPageContent.isVisible()) {
      const box = await pdfPageContent.boundingBox();
      if (box) {
        // Start selection
        await page.mouse.move(box.x + 100, box.y + 100);
        await page.mouse.down();
        await page.mouse.move(box.x + 300, box.y + 120);
        await page.mouse.up();

        // Wait for comment popup
        const commentPopup = page.locator('.comment-popup');
        if (await commentPopup.isVisible({ timeout: 3000 })) {
          // Fill comment and submit
          const commentTextarea = commentPopup.locator('.comment-textarea');
          await commentTextarea.fill(comment);

          const confirmButton = commentPopup.locator('.confirm-button');
          await confirmButton.click();

          await page.waitForTimeout(1500);
          return true;
        }
      }
    }
  } catch (error) {
    console.log('Alternative method also failed');
  }

  return false;
};

/**
 * Wait for the application to be fully loaded
 */
export const waitForAppLoad = async (page: Page) => {
  // Wait for main components to be visible
  await expect(page.locator('.pdf-review-app')).toBeVisible();
  await expect(page.locator('.issues-table')).toBeVisible();
  await expect(page.locator('.pdf-content')).toBeVisible();

  // Wait for PDF to load
  await page.waitForTimeout(2000);
};

/**
 * Get current issue count from the issues table header
 */
export const getIssueCount = async (page: Page) => {
  const headerText = await page.locator('.issues-table-header h2').textContent();
  const count = parseInt(headerText?.match(/\d+/)?.[0] || '0');
  return count;
};

/**
 * Check if table has any issues
 */
export const hasIssues = async (page: Page) => {
  const rows = page.locator('tbody tr');
  const count = await rows.count();
  return count > 0;
};