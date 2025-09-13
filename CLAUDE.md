# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start the development server with hot module replacement (HMR)
- `npm run build` - Build the production bundle (runs TypeScript compilation followed by Vite build)
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code quality issues

**Post-Development Testing Protocol:**
After completing ALL development tasks, you MUST proactively run the playwright-test-validator agent to ensure code quality and test integrity.

**IMPORTANT**: Always use the Task tool to launch the playwright-test-validator agent immediately after finishing development work. This agent will:
- Run the complete Playwright test suite
- Validate all test scenarios
- Identify any regressions or failures
- Provide actionable feedback on test results
- Ensure the codebase remains stable

The agent should be invoked using:
```
Task tool with subagent_type: "playwright-test-validator"
```

**Detailed Testing Approach:**

1. **Automated Validation (REQUIRED)**: Proactively run the playwright-test-validator agent
   - This MUST be done after completing any development work
   - The agent will handle all test execution and validation
   - Wait for the agent's report before considering the task complete
   
2. **MCP Interactive Testing**: Use the MCP Playwright tools to manually verify functionality
   - Navigate to the application and test the implemented features
   - Take screenshots to document working functionality
   - Verify user interactions work as expected
   
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

# 2. REQUIRED: Run the playwright-test-validator agent
# Use the Task tool with subagent_type: "playwright-test-validator"

# 3. Use MCP tools to test interactively (optional)
# browser_navigate, browser_snapshot, browser_click, etc.

# 4. Document results and any additional test needs
```

This comprehensive approach ensures automated validation through the agent, plus optional manual verification and regression testing.

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