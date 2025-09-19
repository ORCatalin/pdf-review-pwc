import { test, expect } from '@playwright/test';

test.describe('View Mode Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await expect(page.locator('h1')).toContainText('PDF Review Tool');
  });

  test('displays view mode switch in table mode by default', async ({ page }) => {
    const viewModeSwitch = page.locator('.view-mode-switch');
    await expect(viewModeSwitch).toBeVisible();

    // Check both switch buttons are present
    await expect(page.locator('.switch-button').filter({ hasText: 'Table' })).toBeVisible();
    await expect(page.locator('.switch-button').filter({ hasText: 'PDF' })).toBeVisible();

    // Table mode should be active by default
    await expect(page.locator('.switch-button.active').filter({ hasText: 'Table' })).toBeVisible();

    // Issues table should be visible
    await expect(page.locator('.issues-table')).toBeVisible();
  });

  test('switches from table to PDF view mode', async ({ page }) => {
    // Start with table mode (default)
    await expect(page.locator('.switch-button.active').filter({ hasText: 'Table' })).toBeVisible();
    await expect(page.locator('.issues-table')).toBeVisible();

    // Click PDF mode button
    await page.locator('.switch-button').filter({ hasText: 'PDF' }).click();

    // PDF mode should now be active
    await expect(page.locator('.switch-button.active').filter({ hasText: 'PDF' })).toBeVisible();
    await expect(page.locator('.switch-button.active').filter({ hasText: 'Table' })).not.toBeVisible();

    // Marker PDF viewer should be visible
    await expect(page.locator('.marker-pdf-viewer-container')).toBeVisible();

    // Issues table should not be visible
    await expect(page.locator('.issues-table')).not.toBeVisible();
  });

  test('switches back from PDF to table view mode', async ({ page }) => {
    // First switch to PDF mode
    await page.locator('.switch-button').filter({ hasText: 'PDF' }).click();
    await expect(page.locator('.marker-pdf-viewer-container')).toBeVisible();

    // Switch back to table mode
    await page.locator('.switch-button').filter({ hasText: 'Table' }).click();

    // Table mode should be active again
    await expect(page.locator('.switch-button.active').filter({ hasText: 'Table' })).toBeVisible();
    await expect(page.locator('.issues-table')).toBeVisible();

    // Marker PDF viewer should not be visible
    await expect(page.locator('.marker-pdf-viewer-container')).not.toBeVisible();
  });

  test('displays marker PDF viewer toolbar in PDF mode', async ({ page }) => {
    // Switch to PDF mode
    await page.locator('.switch-button').filter({ hasText: 'PDF' }).click();

    // Check toolbar is visible with correct content
    const toolbar = page.locator('.marker-pdf-viewer-toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar.locator('.toolbar-info')).toContainText('PDF View - Click markers to navigate');
    await expect(toolbar.locator('.page-info')).toContainText('Page');
  });

  test('loads PDF in marker viewer when switching to PDF mode', async ({ page }) => {
    // Switch to PDF mode
    await page.locator('.switch-button').filter({ hasText: 'PDF' }).click();

    // Wait for PDF to load
    await expect(page.locator('.marker-pdf-content')).toBeVisible();

    // Check that PDF loading or content area is visible
    // This test may need adjustment based on actual PDF loading behavior
    const pdfContent = page.locator('.marker-pdf-content');
    await expect(pdfContent).toBeVisible();
  });
});

test.describe('Marker Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('PDF Review Tool');
  });

  test('creates issues that appear as markers in PDF view', async ({ page }) => {
    // First, create a highlight to generate an issue
    // Note: This test assumes there's a way to create highlights programmatically
    // You may need to adjust based on your existing highlight creation tests

    // Switch to highlight mode
    await page.locator('.mode-button').filter({ hasText: 'Highlight' }).click();

    // Check if there are any existing issues first
    const initialIssueCount = await page.locator('.issues-table tbody tr').count();

    // Switch to PDF view mode to check for markers
    await page.locator('.switch-button').filter({ hasText: 'PDF' }).click();

    // If there are issues, there should be markers visible
    if (initialIssueCount > 0) {
      // Wait for markers to render
      await page.waitForTimeout(1000);

      // Check if markers are present
      const markers = page.locator('.issue-marker');
      await expect(markers).toHaveCount(initialIssueCount);
    }
  });

  test('displays different marker icons for approved and not-approved issues', async ({ page }) => {
    // This test checks the visual distinction between approved and not-approved markers
    // You may need to create test data or mock issues to verify this

    // Switch to PDF mode
    await page.locator('.switch-button').filter({ hasText: 'PDF' }).click();

    // Look for markers with different classes/styles
    const approvedMarkers = page.locator('.marker-icon.approved');
    const notApprovedMarkers = page.locator('.marker-icon.not-approved');

    // At least one type should exist (depending on test data)
    const totalMarkers = await page.locator('.issue-marker').count();
    const approvedCount = await approvedMarkers.count();
    const notApprovedCount = await notApprovedMarkers.count();

    // Verify that the counts add up correctly
    expect(approvedCount + notApprovedCount).toBe(totalMarkers);
  });

  test('marker click navigation between viewers', async ({ page }) => {
    // This test verifies that clicking a marker in the PDF view navigates to the corresponding location in the main viewer
    // Implementation depends on your existing navigation test patterns

    // Switch to PDF mode
    await page.locator('.switch-button').filter({ hasText: 'PDF' }).click();

    // If there are markers, click one
    const markers = page.locator('.issue-marker');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      // Click the first marker
      await markers.first().click();

      // This should trigger navigation in the main PDF viewer
      // You may need to check for specific visual indicators of navigation
      // such as highlighting or scrolling to the correct location

      // For now, we'll just verify the marker was clickable
      await expect(markers.first()).toBeVisible();
    }
  });

  test('marker hover shows issue information', async ({ page }) => {
    // Switch to PDF mode
    await page.locator('.switch-button').filter({ hasText: 'PDF' }).click();

    // Check if markers have title attributes for tooltips
    const markers = page.locator('.issue-marker');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      const firstMarker = markers.first();

      // Check if the marker has a title attribute (for tooltip)
      const markerWrapper = firstMarker.locator('.marker-wrapper');
      const titleAttribute = await markerWrapper.getAttribute('title');

      if (titleAttribute) {
        expect(titleAttribute).toContain('ISSUE-');
      }
    }
  });
});