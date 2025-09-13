# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start the development server with hot module replacement (HMR)
- `npm run build` - Build the production bundle (runs TypeScript compilation followed by Vite build)
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code quality issues

**Testing Protocols:**

**During Development (Bug Fixes/Feature Development):**
- When fixing tests or implementing features, run tests directly using `npx playwright test` to verify fixes
- Use this for iterative development and immediate feedback
- Do NOT use the playwright-test-validator agent during active development

**Post-Development Testing Protocol:**
After completing ALL development tasks, you MUST proactively run the playwright-test-validator agent to ensure code quality and test integrity.

**IMPORTANT**: Always use the Task tool to launch the playwright-test-validator agent immediately after finishing development work. This agent will:
- Run the complete Playwright test suite with single browser instance
- Take screenshots for each test (no video recording)
- Generate and open HTML report in browser for detailed review
- Validate all test scenarios
- Identify any regressions or failures
- Provide actionable feedback on test results
- Ensure the codebase remains stable

The agent should be invoked using:
```
Task tool with subagent_type: "playwright-test-validator"
```

## Project Documentation

- **Project Structure**: See [context/project-structure.md](context/project-structure.md) for the complete folder structure
- **Architecture**: See [context/architecture.md](context/architecture.md) for technical architecture details