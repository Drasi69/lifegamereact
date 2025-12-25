1→# AGENTS.md
2→
3→## Commands
4→- **Setup**: `npm install`
5→- **Build**: `npm run build` (outputs to `/build`)
6→- **Lint**: ESLint runs automatically via `react-scripts` (no standalone lint command)
7→- **Test**: `npm test` (runs Jest in watch mode)
8→- **Dev Server**: `npm start` (runs on http://localhost:3000)
9→
10→## Tech Stack
11→- **Framework**: React 18.2 with Create React App
12→- **Build Tool**: react-scripts 5.0.1 (webpack + Babel)
13→- **Testing**: Jest + React Testing Library
14→- **Styling**: CSS (component-level)
15→
16→## Architecture
17→- Single-page app implementing Conway's Game of Life
18→- Component hierarchy: `Home` → `Board` → `Square`
19→- State management via React hooks (`useState`, `useEffect`)
20→- `/src` contains components, `/public` has static assets
21→
22→## Code Style
23→- Use functional components with hooks (not class components except for utility classes)
24→- Props destructuring in component parameters
25→- Inline event handlers with arrow functions
26→- Mixed indentation styles (2-space and 4-space) - follow existing file conventions
27→