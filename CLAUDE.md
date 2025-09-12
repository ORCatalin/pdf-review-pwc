# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start the development server with hot module replacement (HMR)
- `npm run build` - Build the production bundle (runs TypeScript compilation followed by Vite build)
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code quality issues

### Testing
This project uses **Playwright** for end-to-end testing. Tests run only on Chrome with visible browser windows for debugging.

- `npm test` - Run all Playwright tests with visible browser
- `npm run test:ui` - Run tests with Playwright's UI mode for interactive debugging
- `npm run test:headed` - Run tests with visible browser (same as npm test)

#### Test Structure
- `tests/app.spec.ts` - Main application functionality tests
- `tests/issues-table.spec.ts` - Issues table component tests
- `tests/pdf-viewer.spec.ts` - PDF viewer component tests  
- `tests/integration.spec.ts` - Integration and workflow tests

#### Test Verification with Playwright MCP
Always use the Playwright MCP server tools for interactive testing and debugging. This provides better visual verification than running tests directly:

**Complete MCP Playwright Toolkit:**
1. `mcp__playwright__browser_navigate` - Navigate to http://localhost:5175 (dev server port)
2. `mcp__playwright__browser_snapshot` - Capture accessibility snapshots to understand page structure and find selectors
3. `mcp__playwright__browser_take_screenshot` - Take visual screenshots, save with descriptive filenames
4. `mcp__playwright__browser_click` - Test user interactions (buttons, links, form elements, mode switches)
5. `mcp__playwright__browser_evaluate` - Run JavaScript to inspect DOM, verify state, and test functionality
6. `mcp__playwright__browser_close` - Clean up browser instances when testing is complete
7. `mcp__playwright__browser_resize` - Test responsive behavior and viewport changes
8. `mcp__playwright__browser_wait_for` - Wait for async operations, text changes, or element visibility
9. `mcp__playwright__browser_type` - Test text input in forms and comment fields
10. `mcp__playwright__browser_hover` - Test hover states and tooltip functionality

**Enhanced Testing Workflow:**
1. **Initialize**: Use `browser_navigate` to load the app at http://localhost:5175
2. **Inspect**: Use `browser_snapshot` to see current page state and identify correct selectors
3. **Document**: Use `browser_take_screenshot` with descriptive filenames like `highlight-modal-visible.png`
4. **Interact**: Use `browser_click` to test mode switches, issue navigation, and UI interactions
5. **Input**: Use `browser_type` for comment forms and text input testing
6. **Verify**: Use `browser_evaluate` to check CSS classes, element states, and application functionality
7. **Debug**: Take screenshots at each step to document expected vs actual behavior
8. **Wait**: Use `browser_wait_for` for async operations like PDF loading or modal appearances
9. **Cleanup**: Use `browser_close` only when completely finished with testing session

**Critical Selectors for Testing:**
- **Mode Controls**: `.mode-button` (with `.active` class when selected)
- **PDF Interface**: `.pdf-content`, `.pdf-viewer-container`, `.pdf-viewer-toolbar`
- **Comment System**: `.comment-popup`, `.comment-textarea`, `.emoji-button`
- **Highlights**: `.Highlight`, `.AreaHighlight`, temporary highlights with `data-highlight-id="temp-highlight"`
- **Issues Management**: `.issues-table`, `.issues-table tbody tr`, `.status-select`
- **Layout**: `.resizable-left-panel`, `.resizable-right-panel`, `.pdf-review-content`
- **Statistics**: `.stats .stat`, `.stat` elements showing counts

**Real-World Testing Examples:**
```javascript
// Test highlight functionality
await page.locator('.mode-button').filter({ hasText: 'Highlight' }).click();
await page.locator('.pdf-content').dblclick(); // Select text
await expect(page.locator('.comment-popup')).toBeVisible();

// Test comment modal interactions
await page.locator('.emoji-button').first().click();
await page.fill('.comment-textarea', 'Test comment');
await page.locator('.confirm-button').click();
```

**Browser Instance Management:**
- Keep one browser instance open throughout the entire testing session
- Never close browser between individual test steps
- Only use `browser_close` when completely finished with all testing
- Use `browser_resize` to test different viewport sizes if needed

**Post-Development Testing Protocol:**
After completing coding requirements, always follow this comprehensive testing approach:

1. **MCP Interactive Testing**: Use the MCP Playwright tools to manually verify functionality
   - Navigate to the application and test the implemented features
   - Take screenshots to document working functionality
   - Verify user interactions work as expected
   
2. **Automated Test Suite**: Run the full Playwright test suite to ensure no regressions
   - Execute: `npx playwright test tests/highlight-functionality.spec.ts`
   - Verify all existing tests still pass
   - Fix any test failures by updating test selectors or expectations
   
3. **Test Documentation**: Document testing results and any new requirements
   - Create `new-tests.md` if additional test coverage is needed
   - Include specific scenarios that should be tested
   - Note any edge cases discovered during development
   
4. **Visual Verification**: Compare expected vs actual behavior
   - Take before/after screenshots showing the implemented changes
   - Document any visual improvements or new UI elements
   - Ensure consistency with existing design patterns

**Example Testing Session:**
```bash
# 1. Start dev server (should already be running)
npm run dev

# 2. Use MCP tools to test interactively
# browser_navigate, browser_snapshot, browser_click, etc.

# 3. Run automated tests to verify no regressions
npx playwright test tests/highlight-functionality.spec.ts

# 4. Document results and any additional test needs
```

This dual approach ensures both manual verification and automated regression testing.

## Architecture

This is a React application using:
- **Vite** as the build tool and dev server
- **TypeScript** for type safety
- **React 19** with function components and hooks
- **ESLint** for code quality

The project structure follows a standard Vite React template:
- Entry point: `src/main.tsx` renders the App component to the DOM
- Main component: `src/App.tsx` contains the root application component
- Styling: CSS modules with `App.css` and global styles in `index.css`
- Assets: Static assets are served from `public/` and `src/assets/`

## TypeScript Configuration

The project uses multiple TypeScript configs:
- `tsconfig.json` - Base configuration extending other configs
- `tsconfig.app.json` - Application-specific TypeScript settings
- `tsconfig.node.json` - Node.js environment settings for Vite config

## Build Process

The build process (`npm run build`) performs:
1. TypeScript compilation checking (`tsc -b`)
2. Vite production build optimization

The development server uses Vite's HMR with the React plugin for fast refresh during development.