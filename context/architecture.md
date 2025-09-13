# Architecture

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