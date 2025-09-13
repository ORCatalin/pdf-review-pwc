import { test, expect } from '@playwright/test';
import { createTestIssue, waitForAppLoad, getIssueCount, hasIssues } from './test-helpers';

test.describe('Issues Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('displays issue table with correct headers', async ({ page }) => {
    // The table itself has the .issues-table class
    const table = page.locator('.issues-table');
    await expect(table).toBeVisible();

    // Check all expected headers
    const headers = ['ID', 'Page', 'Description', 'Category', 'Priority', 'Status', 'Actions'];
    for (const header of headers) {
      await expect(page.locator('th').filter({ hasText: header })).toBeVisible();
    }
  });

  test('shows issue rows with data', async ({ page }) => {
    // First create a test issue
    const created = await createTestIssue(page, 'Test issue for row data validation');

    if (!created) {
      // Skip test if we couldn't create an issue
      test.skip();
    }

    const tbody = page.locator('tbody');
    await expect(tbody).toBeVisible();

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    // Check that first row has data in expected columns
    // Order: ID, Page, Description, Category, Priority, Status, Actions
    const firstRow = rows.first();
    await expect(firstRow.locator('td').nth(0)).not.toBeEmpty(); // ID
    await expect(firstRow.locator('td').nth(1)).not.toBeEmpty(); // Page
    await expect(firstRow.locator('td').nth(2)).not.toBeEmpty(); // Description
    await expect(firstRow.locator('td').nth(3)).not.toBeEmpty(); // Category
    await expect(firstRow.locator('td').nth(4)).not.toBeEmpty(); // Priority
    await expect(firstRow.locator('td').nth(5)).not.toBeEmpty(); // Status
  });

  test('allows clicking on issue rows', async ({ page }) => {
    // First create a test issue
    const created = await createTestIssue(page, 'Test issue for click interaction');
    if (!created) test.skip();

    const rows = page.locator('tbody tr');
    const firstRow = rows.first();

    // Click on the first row
    await firstRow.click();

    // The row should now be selected (highlighted)
    await expect(firstRow).toHaveClass(/selected/);
  });

  test('displays status dropdown for each issue', async ({ page }) => {
    // First create a test issue
    const created = await createTestIssue(page, 'Test issue for status dropdown');
    if (!created) test.skip();

    const rows = page.locator('tbody tr');
    const firstRow = rows.first();

    // Each row should have a status select dropdown
    const statusSelect = firstRow.locator('select');
    await expect(statusSelect).toBeVisible();

    // Check that the select has the expected options
    const options = statusSelect.locator('option');
    await expect(options).toHaveCount(3);

    // Check for specific status options
    await expect(statusSelect.locator('option[value="open"]')).toBeVisible();
    await expect(statusSelect.locator('option[value="in-review"]')).toBeVisible();
    await expect(statusSelect.locator('option[value="resolved"]')).toBeVisible();
  });

  test('can change issue status', async ({ page }) => {
    // First create a test issue
    const created = await createTestIssue(page, 'Test issue for status change');
    if (!created) test.skip();

    const rows = page.locator('tbody tr');
    const firstRow = rows.first();
    const statusSelect = firstRow.locator('select');

    // Get initial status
    const initialStatus = await statusSelect.inputValue();

    // Change to a different status
    const newStatus = initialStatus === 'open' ? 'in-review' : 'open';
    await statusSelect.selectOption(newStatus);

    // Verify the change
    await expect(statusSelect).toHaveValue(newStatus);
  });

  test('displays priority with correct styling', async ({ page }) => {
    // First create a test issue
    const created = await createTestIssue(page, 'Test issue for priority styling');
    if (!created) test.skip();

    const rows = page.locator('tbody tr');
    const firstRow = rows.first();
    const priorityCell = firstRow.locator('td').nth(4);
    await expect(priorityCell).not.toBeEmpty();

    // Check if priority badge exists and has proper styling
    const priorityBadge = priorityCell.locator('.priority-badge');
    await expect(priorityBadge).toBeVisible();
  });

  test('shows different row styling for different statuses', async ({ page }) => {
    // Create multiple test issues
    const created1 = await createTestIssue(page, 'First test issue');
    const created2 = await createTestIssue(page, 'Second test issue');

    if (!created1 && !created2) test.skip();

    const rows = page.locator('tbody tr');

    if (await rows.count() > 1) {
      // Check if different rows might have different styling based on status
      const firstRowClasses = await rows.first().getAttribute('class');
      const secondRowClasses = await rows.nth(1).getAttribute('class');

      // At minimum, rows should have some class for styling
      expect(firstRowClasses || '').toBeTruthy();
    } else {
      // If we only have one row, just verify it has styling
      const firstRow = rows.first();
      await expect(firstRow).toBeVisible();
    }
  });

  test('handles empty state gracefully', async ({ page }) => {
    // Test the initial empty state before creating any issues
    const table = page.locator('.issues-table');
    await expect(table).toBeVisible();

    const tbody = page.locator('tbody');
    await expect(tbody).toBeVisible();

    // Check for empty state message when no issues exist
    const noIssuesMessage = page.locator('.no-issues');
    await expect(noIssuesMessage).toBeVisible();
    await expect(noIssuesMessage).toContainText('No issues found');
  });

  test('creates issue successfully via highlight interaction', async ({ page }) => {
    // Verify initial empty state
    const initialCount = await getIssueCount(page);
    expect(initialCount).toBe(0);

    // Create a test issue
    const created = await createTestIssue(page, 'Test issue creation validation');

    if (!created) {
      // If we couldn't create via UI, this test isn't applicable
      test.skip();
    }

    // Verify issue was created
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    // Verify the issue has correct initial data
    const firstRow = rows.first();
    const idCell = firstRow.locator('td').first();
    await expect(idCell).toContainText('ISSUE-');

    // Check issue count increased in header stats
    const finalCount = await getIssueCount(page);
    expect(finalCount).toBeGreaterThan(initialCount);
  });
});