import { test, expect } from '@playwright/test';

test.describe('Rectangle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for components to load
    await page.waitForTimeout(2000);
  });

  test('should enable rectangle mode and show appropriate instruction', async ({ page }) => {
    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();
    await expect(rectangleButton).toHaveClass(/active/);

    // Check that the instruction shows rectangle mode
    await expect(page.locator('.pdf-viewer-toolbar')).toContainText('Click and drag to draw rectangles');

    // Verify PDF content is visible and ready for interaction
    const pdfContent = page.locator('.pdf-content');
    await expect(pdfContent).toBeVisible();

    // Check that PDF pages are loaded
    const firstPage = page.locator('div[data-page-number="1"]').first();
    await expect(firstPage).toBeVisible();
  });

  test('should show crosshair cursor in rectangle mode', async ({ page }) => {
    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    // Check if PDF area has crosshair cursor styling
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await expect(dragOverlay).toBeVisible();

    // Check cursor style
    const cursorStyle = await dragOverlay.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.cursor;
    });

    expect(cursorStyle).toBe('crosshair');
  });

  test('should allow drawing rectangle by click and drag', async ({ page }) => {
    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    // Wait for PDF to fully load
    await page.waitForTimeout(3000);

    // Get the drag rectangle overlay
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await expect(dragOverlay).toBeVisible();

    // Draw a rectangle by dragging
    const startX = 100;
    const startY = 100;
    const endX = 300;
    const endY = 200;

    await dragOverlay.hover({ position: { x: startX, y: startY } });
    await page.mouse.down();
    await page.mouse.move(endX, endY);

    // While dragging, should see the drawing rectangle
    const drawingRectangle = page.locator('.drawing-rectangle');
    await expect(drawingRectangle).toBeVisible();

    // Should also see coordinates tooltip
    const coordinatesTooltip = page.locator('.coordinates-tooltip');
    await expect(coordinatesTooltip).toBeVisible();
    await expect(coordinatesTooltip).toContainText(`(${startX}, ${startY})`);

    await page.mouse.up();

    // After release, drawing rectangle should disappear
    await expect(drawingRectangle).not.toBeVisible();
  });

  test('should show comment modal when rectangle is completed', async ({ page }) => {
    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    // Wait for PDF load
    await page.waitForTimeout(3000);

    // Draw a rectangle
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await dragOverlay.hover({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(250, 180);
    await page.mouse.up();

    // Wait for comment modal to appear
    await page.waitForTimeout(1000);

    // Check if comment popup appears
    const commentModal = page.locator('.comment-popup');
    await expect(commentModal).toBeVisible({ timeout: 5000 });

    // Check for comment input field
    const commentTextarea = page.locator('.comment-textarea');
    await expect(commentTextarea).toBeVisible();

    // Check for priority selector
    await expect(page.locator('.priority-selector')).toBeVisible();
    await expect(page.locator('.priority-button').filter({ hasText: 'Medium' })).toHaveClass(/selected/);
  });

  test('should allow adding comment to rectangle', async ({ page }) => {
    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    // Wait for PDF load
    await page.waitForTimeout(3000);

    // Draw a rectangle
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await dragOverlay.hover({ position: { x: 150, y: 150 } });
    await page.mouse.down();
    await page.mouse.move(300, 250);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Add comment in modal
    const commentTextarea = page.locator('.comment-textarea');
    if (await commentTextarea.isVisible({ timeout: 3000 })) {
      await commentTextarea.fill('Test rectangle annotation');

      // Change priority to High
      const highPriorityButton = page.locator('.priority-button').filter({ hasText: 'High' });
      await highPriorityButton.click();
      await expect(highPriorityButton).toHaveClass(/selected/);

      // Confirm the rectangle
      const confirmButton = page.locator('.confirm-button');
      await confirmButton.click();

      // Wait for rectangle to be processed
      await page.waitForTimeout(1000);

      // Verify rectangle appears in the PDF
      const persistentRectangle = page.locator('.persistent-rectangle').first();
      await expect(persistentRectangle).toBeVisible({ timeout: 5000 });

      // Verify rectangle info is displayed
      const rectangleInfo = persistentRectangle.locator('.rectangle-info');
      await expect(rectangleInfo).toBeVisible();
      await expect(rectangleInfo).toContainText('Test rectangle annotation');
    }
  });

  test('should create new issue when rectangle is added', async ({ page }) => {
    // Get initial issue count
    const initialIssuesText = await page.locator('.issues-table-header h2').textContent();
    const initialCount = parseInt(initialIssuesText?.match(/\d+/)?.[0] || '0');

    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    // Wait for PDF load
    await page.waitForTimeout(3000);

    // Draw a rectangle
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await dragOverlay.hover({ position: { x: 120, y: 120 } });
    await page.mouse.down();
    await page.mouse.move(280, 220);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Add comment and confirm
    const commentTextarea = page.locator('.comment-textarea');
    if (await commentTextarea.isVisible({ timeout: 3000 })) {
      await commentTextarea.fill('New rectangle issue test');

      const confirmButton = page.locator('.confirm-button');
      await confirmButton.click();

      await page.waitForTimeout(1000);

      // Check if issue count increased
      const newIssuesText = await page.locator('.issues-table-header h2').textContent();
      const newCount = parseInt(newIssuesText?.match(/\d+/)?.[0] || '0');

      expect(newCount).toBe(initialCount + 1);

      // Verify the new issue appears in the table
      const issueRows = page.locator('.issue-row');
      const lastIssue = issueRows.last();

      await expect(lastIssue).toContainText('New rectangle issue test');
      await expect(lastIssue).toContainText('Rectangle Annotation');
      await expect(lastIssue.locator('.status-select')).toHaveValue('not-approved');
    }
  });

  test('should cancel rectangle creation when cancel button is clicked', async ({ page }) => {
    // Get initial issue count
    const initialIssuesText = await page.locator('.issues-table-header h2').textContent();
    const initialCount = parseInt(initialIssuesText?.match(/\d+/)?.[0] || '0');

    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    // Wait for PDF load
    await page.waitForTimeout(3000);

    // Draw a rectangle
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await dragOverlay.hover({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(200, 180);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Cancel the rectangle creation
    const cancelButton = page.locator('.cancel-button');
    if (await cancelButton.isVisible({ timeout: 3000 })) {
      await cancelButton.click();

      await page.waitForTimeout(500);

      // Modal should disappear
      const commentModal = page.locator('.comment-popup');
      await expect(commentModal).not.toBeVisible();

      // No rectangle should be persisted
      const persistentRectangles = page.locator('.persistent-rectangle');
      const rectangleCount = await persistentRectangles.count();
      expect(rectangleCount).toBe(0);

      // Issue count should remain the same
      const finalIssuesText = await page.locator('.issues-table-header h2').textContent();
      const finalCount = parseInt(finalIssuesText?.match(/\d+/)?.[0] || '0');
      expect(finalCount).toBe(initialCount);
    }
  });

  test('should not create rectangle if drag area is too small', async ({ page }) => {
    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    // Wait for PDF load
    await page.waitForTimeout(3000);

    // Try to draw a very small rectangle (less than 5px threshold)
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await dragOverlay.hover({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(103, 103); // Only 3px movement
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Comment modal should NOT appear
    const commentModal = page.locator('.comment-popup');
    await expect(commentModal).not.toBeVisible();
  });

  test('should disable rectangle drawing in view-only mode', async ({ page }) => {
    // Switch to view-only mode
    const viewOnlyButton = page.locator('.mode-button').filter({ hasText: 'View Only' });
    await viewOnlyButton.click();
    await expect(viewOnlyButton).toHaveClass(/active/);

    // Verify instruction text changes
    await expect(page.locator('.pdf-viewer-toolbar')).toContainText('View-only mode');

    // Rectangle overlay should not be present
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await expect(dragOverlay).not.toBeVisible();

    // Try to draw (should not work)
    const pdfContent = page.locator('.pdf-content');
    await pdfContent.hover({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(200, 180);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // No comment modal should appear
    const commentModal = page.locator('.comment-popup');
    await expect(commentModal).not.toBeVisible();
  });

  test('should preserve existing rectangles when switching modes', async ({ page }) => {
    // First create a rectangle in rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    await page.waitForTimeout(3000);

    // Draw a rectangle
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await dragOverlay.hover({ position: { x: 150, y: 150 } });
    await page.mouse.down();
    await page.mouse.move(250, 220);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Add comment and confirm
    const commentTextarea = page.locator('.comment-textarea');
    if (await commentTextarea.isVisible({ timeout: 3000 })) {
      await commentTextarea.fill('Persistent rectangle test');
      const confirmButton = page.locator('.confirm-button');
      await confirmButton.click();

      await page.waitForTimeout(1000);
    }

    // Count rectangles after creation
    const initialRectangles = await page.locator('.persistent-rectangle').count();
    expect(initialRectangles).toBeGreaterThan(0);

    // Switch between different modes
    await page.locator('.mode-button').filter({ hasText: 'Highlight' }).click();
    await page.waitForTimeout(500);

    await page.locator('.mode-button').filter({ hasText: 'View Only' }).click();
    await page.waitForTimeout(500);

    await page.locator('.mode-button').filter({ hasText: 'Rectangle' }).click();
    await page.waitForTimeout(500);

    // Verify rectangles are still present
    const finalRectangles = await page.locator('.persistent-rectangle').count();
    expect(finalRectangles).toBe(initialRectangles);

    // Verify rectangle content is still visible
    const rectangleInfo = page.locator('.persistent-rectangle .rectangle-info').first();
    await expect(rectangleInfo).toContainText('Persistent rectangle test');
  });

  test('should display rectangle with correct positioning', async ({ page }) => {
    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    await page.waitForTimeout(3000);

    // Draw a rectangle at specific coordinates
    const startX = 200;
    const startY = 150;
    const endX = 350;
    const endY = 250;

    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await dragOverlay.hover({ position: { x: startX, y: startY } });
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Add comment and confirm
    const commentTextarea = page.locator('.comment-textarea');
    if (await commentTextarea.isVisible({ timeout: 3000 })) {
      await commentTextarea.fill('Position test rectangle');
      const confirmButton = page.locator('.confirm-button');
      await confirmButton.click();

      await page.waitForTimeout(1000);

      // Verify rectangle position and size
      const persistentRectangle = page.locator('.persistent-rectangle').first();
      await expect(persistentRectangle).toBeVisible();

      const boundingBox = await persistentRectangle.boundingBox();
      if (boundingBox) {
        expect(boundingBox.x).toBeCloseTo(startX, 5);
        expect(boundingBox.y).toBeCloseTo(startY, 5);
        expect(boundingBox.width).toBeCloseTo(endX - startX, 5);
        expect(boundingBox.height).toBeCloseTo(endY - startY, 5);
      }

      // Verify coordinates in info tooltip
      const rectangleInfo = persistentRectangle.locator('.rectangle-info');
      await expect(rectangleInfo).toContainText(`(${startX}, ${startY})`);
    }
  });

  test('should handle rectangle creation on different pages', async ({ page }) => {
    // Switch to rectangle mode
    const rectangleButton = page.locator('.mode-button').filter({ hasText: 'Rectangle' });
    await rectangleButton.click();

    await page.waitForTimeout(3000);

    // Check current page number
    const pageInfo = page.locator('.page-info');
    const pageText = await pageInfo.textContent();
    const currentPage = parseInt(pageText?.match(/\d+/)?.[0] || '1');

    // Draw a rectangle
    const dragOverlay = page.locator('.drag-rectangle-overlay.enabled');
    await dragOverlay.hover({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(200, 180);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Add comment and confirm
    const commentTextarea = page.locator('.comment-textarea');
    if (await commentTextarea.isVisible({ timeout: 3000 })) {
      await commentTextarea.fill(`Rectangle on page ${currentPage}`);
      const confirmButton = page.locator('.confirm-button');
      await confirmButton.click();

      await page.waitForTimeout(1000);

      // Verify the issue shows correct page number
      const issueRows = page.locator('.issue-row');
      const lastIssue = issueRows.last();

      // Check that the issue contains the correct page reference
      const issueText = await lastIssue.textContent();
      expect(issueText).toContain(currentPage.toString());
    }
  });

});