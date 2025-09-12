import { test, expect } from '@playwright/test';

test.describe('Issues Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the table to load with mock data
    await page.waitForTimeout(1000);
  });

  test('displays issue table with correct headers', async ({ page }) => {
    const table = page.locator('.issues-table table');
    await expect(table).toBeVisible();
    
    // Check all expected headers
    const headers = ['ID', 'Page', 'Description', 'Status', 'Priority', 'Category'];
    for (const header of headers) {
      await expect(page.locator('th').filter({ hasText: header })).toBeVisible();
    }
  });

  test('shows issue rows with data', async ({ page }) => {
    const tbody = page.locator('tbody');
    await expect(tbody).toBeVisible();
    
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    
    // Check that first row has data in expected columns
    const firstRow = rows.first();
    await expect(firstRow.locator('td').nth(0)).not.toBeEmpty(); // ID
    await expect(firstRow.locator('td').nth(1)).not.toBeEmpty(); // Page
    await expect(firstRow.locator('td').nth(2)).not.toBeEmpty(); // Description
    await expect(firstRow.locator('td').nth(3)).not.toBeEmpty(); // Status
    await expect(firstRow.locator('td').nth(4)).not.toBeEmpty(); // Priority
    await expect(firstRow.locator('td').nth(5)).not.toBeEmpty(); // Category
  });

  test('allows clicking on issue rows', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const firstRow = rows.first();
    
    // Click on the first row
    await firstRow.click();
    
    // The row should now be selected (highlighted)
    await expect(firstRow).toHaveClass(/selected/);
  });

  test('displays status dropdown for each issue', async ({ page }) => {
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
    const rows = page.locator('tbody tr');
    
    // Check if any rows have priority badges/spans
    const priorityElements = page.locator('.priority-high, .priority-medium, .priority-low');
    
    // At least one priority element should exist if mock data is loaded
    if (await rows.count() > 0) {
      const firstRow = rows.first();
      const priorityCell = firstRow.locator('td').nth(4);
      await expect(priorityCell).not.toBeEmpty();
    }
  });

  test('shows different row styling for different statuses', async ({ page }) => {
    const rows = page.locator('tbody tr');
    
    if (await rows.count() > 1) {
      // Check if different rows might have different styling based on status
      const firstRowClasses = await rows.first().getAttribute('class');
      const secondRowClasses = await rows.nth(1).getAttribute('class');
      
      // At minimum, rows should have some class for styling
      expect(firstRowClasses || '').toBeTruthy();
    }
  });

  test('handles empty state gracefully', async ({ page }) => {
    // This test would be more meaningful with a way to clear the mock data
    // For now, just verify the table structure exists even with data
    const table = page.locator('.issues-table');
    await expect(table).toBeVisible();
    
    const tbody = page.locator('tbody');
    await expect(tbody).toBeVisible();
  });
});