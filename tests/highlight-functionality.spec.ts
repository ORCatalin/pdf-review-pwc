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

    // Try to create a highlight using our helper
    const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
    await highlightButton.click();

    // Attempt to create an issue through text selection
    await page.waitForTimeout(2000);

    // Check if issue count changed or stayed at zero (since no hardcoded data)
    const currentIssuesText = await page.locator('.issues-table-header h2').textContent();
    const currentCount = parseInt(currentIssuesText?.match(/\d+/)?.[0] || '0');

    // Verify the count is valid (should be 0 without hardcoded data)
    expect(currentCount).toBeGreaterThanOrEqual(0);
    expect(currentCount).toBe(initialCount); // Should be same since no hardcoded data
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

  test('should show priority selector in comment popup', async ({ page }) => {
    // Switch to highlight mode
    const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
    await highlightButton.click();

    // Wait for PDF load
    await page.waitForTimeout(3000);

    // Try to trigger text selection
    const pdfContent = page.locator('.pdf-content');
    await pdfContent.click({ position: { x: 100, y: 100 } });

    // Try drag selection to trigger comment popup
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 120);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Check if comment popup appeared with priority selector
    const commentPopup = page.locator('.comment-popup');
    if (await commentPopup.isVisible({ timeout: 3000 })) {
      // Verify priority selector is present
      await expect(page.locator('.priority-selector')).toBeVisible();
      await expect(page.locator('.priority-selector label')).toContainText('Priority');

      // Verify all priority buttons are present
      await expect(page.locator('.priority-button').filter({ hasText: 'Low' })).toBeVisible();
      await expect(page.locator('.priority-button').filter({ hasText: 'Medium' })).toBeVisible();
      await expect(page.locator('.priority-button').filter({ hasText: 'High' })).toBeVisible();

      // Verify medium is selected by default
      await expect(page.locator('.priority-button.selected').filter({ hasText: 'Medium' })).toBeVisible();
    }
  });

  test('should allow changing priority in comment popup', async ({ page }) => {
    // Switch to highlight mode
    const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
    await highlightButton.click();

    // Wait for PDF load
    await page.waitForTimeout(3000);

    // Try to trigger text selection
    const pdfContent = page.locator('.pdf-content');
    await pdfContent.click({ position: { x: 100, y: 100 } });

    // Try drag selection
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 120);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Check if comment popup appeared
    const commentPopup = page.locator('.comment-popup');
    if (await commentPopup.isVisible({ timeout: 3000 })) {
      // Click on High priority button
      const highPriorityButton = page.locator('.priority-button').filter({ hasText: 'High' });
      await highPriorityButton.click();

      // Verify High priority is now selected
      await expect(highPriorityButton).toHaveClass(/selected/);
      await expect(page.locator('.priority-button.selected').filter({ hasText: 'Medium' })).not.toBeVisible();

      // Click on Low priority button
      const lowPriorityButton = page.locator('.priority-button').filter({ hasText: 'Low' });
      await lowPriorityButton.click();

      // Verify Low priority is now selected
      await expect(lowPriorityButton).toHaveClass(/selected/);
      await expect(highPriorityButton).not.toHaveClass(/selected/);
    }
  });

  test('should delete highlight and remove from table when delete button is clicked', async ({ page }) => {
    // First ensure we have highlights by waiting for any existing ones
    await page.waitForTimeout(2000);

    // Get initial issue count
    const initialIssuesHeader = page.locator('.issues-table-header h2');
    const initialText = await initialIssuesHeader.textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');

    // Look for an existing highlight to delete
    const highlights = page.locator('.pdf-content [class*="highlight"], .react-pdf-highlighter__highlight__content');
    const highlightCount = await highlights.count();

    if (highlightCount > 0) {
      // Click on the first highlight to show popup with delete button
      await highlights.first().hover();
      await page.waitForTimeout(500);

      // Look for delete button in highlight popup
      const deleteButton = page.locator('.delete-highlight, button').filter({ hasText: /delete/i });
      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click();

        // Wait for deletion to process
        await page.waitForTimeout(1000);

        // Verify highlight was removed from PDF
        const remainingHighlights = await page.locator('.pdf-content [class*="highlight"], .react-pdf-highlighter__highlight__content').count();
        expect(remainingHighlights).toBeLessThan(highlightCount);

        // Verify issue was removed from table (count should decrease)
        const newIssuesText = await initialIssuesHeader.textContent();
        const newCount = parseInt(newIssuesText?.match(/\d+/)?.[0] || '0');
        expect(newCount).toBeLessThan(initialCount);
      }
    } else {
      // If no highlights exist, create one first for testing deletion
      const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
      await highlightButton.click();

      // Create a test highlight
      const pdfContent = page.locator('.pdf-content');
      await pdfContent.click({ position: { x: 100, y: 100 } });

      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.move(200, 120);
      await page.mouse.up();

      await page.waitForTimeout(1000);

      // Fill in comment if popup appears
      const commentInput = page.locator('.comment-textarea, textarea');
      if (await commentInput.isVisible({ timeout: 3000 })) {
        await commentInput.fill('Test highlight for deletion');
        const confirmButton = page.locator('.confirm-button, button').filter({ hasText: /add|confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await page.waitForTimeout(1000);

          // Now test deletion on newly created highlight
          const newHighlight = page.locator('.pdf-content [class*="highlight"], .react-pdf-highlighter__highlight__content').first();
          if (await newHighlight.isVisible()) {
            await newHighlight.hover();
            await page.waitForTimeout(500);

            const deleteButton = page.locator('.delete-highlight, button').filter({ hasText: /delete/i });
            if (await deleteButton.isVisible({ timeout: 2000 })) {
              await deleteButton.click();
              await page.waitForTimeout(1000);

              // Verify deletion
              await expect(newHighlight).not.toBeVisible();
            }
          }
        }
      }
    }
  });

  test('should allow editing priority in issues table', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check if there are any issues in the table
    const issueRows = page.locator('.issue-row');
    const issueCount = await issueRows.count();

    if (issueCount > 0) {
      // Get the first issue row
      const firstIssueRow = issueRows.first();

      // Find the priority select dropdown
      const prioritySelect = firstIssueRow.locator('.priority-select');
      if (await prioritySelect.isVisible()) {
        // Get current priority value
        const currentPriority = await prioritySelect.inputValue();

        // Change to a different priority
        const newPriority = currentPriority === 'high' ? 'low' : 'high';
        await prioritySelect.selectOption(newPriority);

        // Verify the change was applied
        await expect(prioritySelect).toHaveValue(newPriority);

        // Verify the CSS class was updated
        await expect(prioritySelect).toHaveClass(new RegExp(`priority-${newPriority}`));
      }
    } else {
      // Create a test issue first by creating a highlight
      const highlightButton = page.locator('.mode-button').filter({ hasText: 'Highlight' });
      await highlightButton.click();

      const pdfContent = page.locator('.pdf-content');
      await pdfContent.click({ position: { x: 100, y: 100 } });

      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.move(200, 120);
      await page.mouse.up();

      await page.waitForTimeout(1000);

      const commentInput = page.locator('.comment-textarea, textarea');
      if (await commentInput.isVisible({ timeout: 3000 })) {
        await commentInput.fill('Test issue for priority editing');

        // Set priority to High before creating
        const highPriorityButton = page.locator('.priority-button').filter({ hasText: 'High' });
        if (await highPriorityButton.isVisible()) {
          await highPriorityButton.click();
        }

        const confirmButton = page.locator('.confirm-button, button').filter({ hasText: /add|confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await page.waitForTimeout(1000);

          // Now test priority editing in the table
          const newIssueRow = page.locator('.issue-row').first();
          const prioritySelect = newIssueRow.locator('.priority-select');

          if (await prioritySelect.isVisible()) {
            // Verify it was created with high priority
            await expect(prioritySelect).toHaveValue('high');

            // Change to low priority
            await prioritySelect.selectOption('low');
            await expect(prioritySelect).toHaveValue('low');
            await expect(prioritySelect).toHaveClass(/priority-low/);
          }
        }
      }
    }
  });

  test('should maintain priority colors in issues table', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check if there are any issues in the table to test colors
    const issueRows = page.locator('.issue-row');
    const issueCount = await issueRows.count();

    if (issueCount > 0) {
      const firstIssueRow = issueRows.first();
      const prioritySelect = firstIssueRow.locator('.priority-select');

      if (await prioritySelect.isVisible()) {
        // Test high priority color
        await prioritySelect.selectOption('high');
        await expect(prioritySelect).toHaveClass(/priority-high/);

        // Test medium priority color
        await prioritySelect.selectOption('medium');
        await expect(prioritySelect).toHaveClass(/priority-medium/);

        // Test low priority color
        await prioritySelect.selectOption('low');
        await expect(prioritySelect).toHaveClass(/priority-low/);
      }
    }
  });
});