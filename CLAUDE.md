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
- **IMPORTANT**: Always create new Playwright tests when implementing new features or functionality
- **IMPORTANT**: Always modify existing Playwright tests when fixing or modifying code behavior
- Tests should be created/updated during development, not as an afterthought

**Post-Development Testing Protocol:**
The playwright-test-validator agent is available for manual execution when you need comprehensive test validation. This agent will:
- **Smart Test Execution**: Run targeted tests based on code changes for faster feedback:
  - Single component changes: Run component-specific + integration tests
  - Multiple components: Run affected test suites
  - Global changes: Run complete test suite
- Take screenshots for each test (no video recording)
- Generate and open HTML report in browser for detailed review
- Validate all test scenarios
- Identify any regressions or failures
- Provide actionable feedback on test results
- Ensure the codebase remains stable

When needed, the agent can be invoked manually using:
```
Task tool with subagent_type: "playwright-test-validator"
```

## Development Workflow Requirements

**Todo List Usage:**
- **MANDATORY**: Always use the TodoWrite tool for all development tasks to track progress
- Create todo lists at the beginning of any development work so the user can see what you're planning to do
- Update todo status (pending → in_progress → completed) as you work through tasks
- Break down complex tasks into smaller, trackable items
- This provides transparency and allows the user to follow your progress in real-time

**Optional Test Validation:**
- The playwright-test-validator agent is available for manual execution when comprehensive test validation is needed
- Can be used to validate code quality and test integrity when desired
- The agent will intelligently run relevant tests based on code changes

## Project Documentation

- **Project Structure**: See [context/project-structure.md](context/project-structure.md) for the complete folder structure
- **Architecture**: See [context/architecture.md](context/architecture.md) for technical architecture details