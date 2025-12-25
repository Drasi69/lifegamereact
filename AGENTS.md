# AGENTS.md

## Commands
- **Setup**: `npm install`
- **Build**: `npm run build` (outputs to `/build`)
- **Lint**: ESLint runs automatically via `react-scripts` (no standalone lint command)
- **Test**: `npm test` (runs Jest in watch mode)
- **Dev Server**: `npm start` (runs on http://localhost:3000)

## Tech Stack
- **Framework**: React 18.2 with Create React App
- **Build Tool**: react-scripts 5.0.1 (webpack + Babel)
- **Testing**: Jest + React Testing Library
- **Styling**: CSS (component-level)

## Architecture

### Project Structure
```
lifegamereact/
├── public/              # Static assets (HTML, icons, manifest)
├── src/
│   ├── App.js          # Main application component (Home, Board, Square)
│   ├── App.css         # Application styles
│   ├── index.js        # React entry point
│   ├── index.css       # Global styles
│   ├── App.test.js     # Test file
│   └── ...
├── package.json        # Dependencies and scripts
└── AGENTS.md          # This file
```

### Component Hierarchy
```
Home (App.js - default export)
├── Controls Section (inline)
│   ├── Grid Size Controls
│   ├── Speed Slider
│   ├── Pattern Buttons
│   └── Game Controls (Start/Stop/Clear/Random)
└── Board (memoized component)
    └── Square (memoized component) [grid of squares]
```

### Component Details

#### Home Component
- **Location**: `src/App.js` (lines 58-302)
- **Type**: Functional component (default export)
- **Responsibilities**:
  - Main application container
  - State management for entire game
  - Game logic execution (play function)
  - Control panel UI
  - Grid configuration

**State Variables**:
- `maxCol`: Number of columns (default: 30)
- `maxRow`: Number of rows (default: 20)
- `world`: 2D array representing grid state (`null` or `'X'`)
- `isRunning`: Boolean flag for animation state
- `speed`: Animation interval in ms (default: 500)
- `isDragging`: Boolean for mouse drag painting
- `generation`: Counter for iterations

**Key Functions**:
- `getNeighbours(world, row, col, maxRow, maxCol)`: Counts live neighbors (8 directions)
- `play()`: Executes one generation using Conway's rules
- `start()`: Begins automatic animation
- `stop()`: Pauses animation
- `clearGrid()`: Resets all cells to dead
- `randomFill()`: Randomly populates ~30% of cells
- `loadPattern(patternKey)`: Loads predefined patterns centered on grid

#### Board Component
- **Location**: `src/App.js` (lines 304-366)
- **Type**: Memoized functional component
- **Props**: `world`, `onPlay`, `isDragging`, `setIsDragging`, `isRunning`
- **Responsibilities**:
  - Renders grid of squares
  - Handles mouse interactions (click, drag)
  - Propagates state changes upward

**Interaction Handlers**:
- `click(row, col)`: Toggles cell on click
- `handleMouseDown(row, col)`: Starts drag-to-paint
- `handleMouseEnter(row, col)`: Continues drag painting
- `handleMouseUp()`: Ends drag painting
- Global `mouseup` listener prevents stuck drag state

#### Square Component
- **Location**: `src/App.js` (lines 368-379)
- **Type**: Memoized functional component
- **Props**: `val`, `click`, `onMouseDown`, `onMouseEnter`
- **Responsibilities**:
  - Renders individual grid cell
  - Displays 'X' for live cells, empty for dead
  - Handles mouse events

#### Point Class
- **Location**: `src/App.js` (lines 381-405)
- **Type**: Utility class
- **Purpose**: Represents coordinate pairs for tracking cell changes
- **Methods**: `getX()`, `setX(x)`, `getY()`, `setY(y)`

## Game of Life Algorithm Implementation

### Conway's Rules
1. **Underpopulation**: Live cell with < 2 neighbors dies
2. **Survival**: Live cell with 2-3 neighbors lives
3. **Overpopulation**: Live cell with > 3 neighbors dies
4. **Reproduction**: Dead cell with exactly 3 neighbors becomes alive

### Implementation Strategy

**Neighbor Counting** (`getNeighbours`):
- Iterates through 8 adjacent cells (horizontal, vertical, diagonal)
- Boundary checking prevents out-of-bounds access
- Returns count of live neighbors
- Algorithm: Explicit checks for each direction with nested boundary conditions

**Generation Evolution** (`play`):
- Creates deep clone of current world state (`deepCloneWorld`)
- Two-pass algorithm:
  1. **Analysis Pass**: Scan all cells, collect changes in `lives` and `deads` arrays
     - Cell with 0 neighbors + 3 neighbors → add to `lives`
     - Live cell with < 2 or > 3 neighbors → add to `deads`
  2. **Application Pass**: Apply collected changes to cloned world
- Updates state only if modifications occurred
- Increments generation counter on change

**Key Design Decisions**:
- Uses arrays to collect changes before applying (prevents read-after-write issues)
- `Point` class encapsulates coordinates for clarity
- `deepCloneWorld` ensures immutability
- `isModified` flag prevents unnecessary re-renders on stable states

### Boundary Handling
- **Finite Grid**: Edges are treated as permanent boundaries
- Cells on edges have fewer neighbors (3-5 instead of 8)
- No wrapping or toroidal topology

## State Management Approach

### React Hooks Used
- **useState**: All component state (world, isRunning, speed, etc.)
- **useEffect**: 
  1. Grid resize synchronization (lines 67-71)
  2. Animation loop timing (lines 156-164)
  3. Global mouseup listener (lines 334-338)
- **useCallback**: Memoizes functions to prevent recreation (all event handlers)
- **memo**: Optimizes Board and Square re-renders

### State Flow
1. User interacts with controls → Updates state in Home
2. State change triggers re-render
3. New props flow down to Board → Square
4. Memoization prevents unnecessary re-renders of unchanged squares
5. User draws on grid → Board calls `onPlay` → Home updates world state

### Performance Optimizations
- **Component Memoization**: `memo()` on Board and Square prevents re-renders when props unchanged
- **Callback Memoization**: `useCallback` prevents child re-renders from function reference changes
- **Deep Clone Strategy**: Creates new array references for React change detection
- **Conditional Updates**: Only update state when world actually changes (`isModified` flag)

## Predefined Patterns

Stored in `PATTERNS` object (lines 6-52):
- **Glider**: Moves diagonally (smallest spaceship)
- **Blinker**: Oscillates between horizontal/vertical (period 2)
- **Toad**: Oscillator (period 2)
- **Beacon**: Oscillator (period 2)
- **Pulsar**: Large oscillator (period 3)
- **Gosper Glider Gun**: Produces gliders indefinitely

Patterns are centered on grid using offset calculations based on grid dimensions.

## User Interaction Features

### Drawing Modes
1. **Click**: Toggle single cell
2. **Drag**: Paint multiple cells by holding mouse down
3. **Pattern Load**: Insert predefined pattern at center

### Grid Configuration
- Rows: 5-50 (disabled during simulation)
- Columns: 5-50 (disabled during simulation)
- Changes reset grid and generation counter

### Animation Control
- **Speed Slider**: 100-2000ms per generation
- **Start/Stop**: Begin/pause automatic evolution
- **Clear**: Reset all cells to dead state
- **Random**: Fill ~30% of cells randomly

### UI/UX Details
- Controls disabled during simulation to prevent mid-run changes
- Generation counter tracks iterations
- Visual feedback: hover effects on squares
- Drag-to-paint with global mouseup listener (prevents stuck state)

## Code Style Conventions

### General Patterns
- **Components**: Functional components with hooks (no class components except Point utility)
- **Props**: Destructured in function parameters
- **Event Handlers**: Arrow functions with inline definitions
- **State Updates**: Functional updates when depending on previous state
- **Indentation**: Mixed 2-space (JSX) and 4-space (logic blocks) - follow existing conventions

### Naming Conventions
- **Components**: PascalCase (`Home`, `Board`, `Square`)
- **Functions**: camelCase (`getNeighbours`, `deepCloneWorld`)
- **Constants**: SCREAMING_SNAKE_CASE (`PATTERNS`)
- **State**: camelCase with descriptive names (`isRunning`, `maxCol`)

### React Patterns
- Memoization for performance: `memo()`, `useCallback()`
- State lifted to common ancestor (Home)
- Props drilling for simple hierarchy
- Controlled components for form inputs
- Dependency arrays for hooks explicitly defined

## Testing

### Current Test Status
- **Test File**: `src/App.test.js`
- **Current Test**: Placeholder test checking for "learn react" text (will fail - incorrect test)
- **Framework**: Jest + React Testing Library
- **Coverage**: Minimal - needs expansion

### Testing Opportunities
- Component rendering tests (Home, Board, Square)
- Game logic unit tests (getNeighbours, play, Conway's rules)
- User interaction tests (click, drag, button controls)
- Pattern loading tests
- State management tests (generation counting, grid resize)

## Future Enhancement Opportunities

### Feature Enhancements
1. **Save/Load Patterns**: Import/export custom patterns (JSON format)
2. **History/Undo**: Track previous states for step-back functionality
3. **Statistics Dashboard**: Track population count, stable patterns, oscillator detection
4. **Zoom Controls**: Dynamic cell size adjustment for larger grids
5. **Color Themes**: Cell age visualization, heat maps
6. **Toroidal Grid**: Optional wraparound at edges
7. **Variable Rules**: Support for other cellular automata (Highlife, Seeds, etc.)
8. **Step-by-Step Mode**: Manual generation advance with pause/step buttons
9. **Pattern Library**: Extended collection with categories (oscillators, spaceships, methuselahs)
10. **Mobile Optimization**: Touch events, responsive grid sizing

### Performance Enhancements
1. **Sparse Data Structure**: Track only live cells for large grids
2. **Web Workers**: Offload computation to background thread
3. **Canvas Rendering**: Replace DOM grid with canvas for 100+ cell dimensions
4. **Quadtree**: Spatial partitioning for efficient neighbor queries
5. **HashLife Algorithm**: Exponential speedup for stable patterns

### Code Quality Improvements
1. **Test Coverage**: Comprehensive unit and integration tests
2. **TypeScript Migration**: Add type safety
3. **Component Extraction**: Separate Controls into dedicated component
4. **Custom Hooks**: Extract game logic to `useGameOfLife` hook
5. **Error Boundaries**: Graceful error handling
6. **Accessibility**: ARIA labels, keyboard navigation
7. **Performance Monitoring**: React Profiler integration
8. **Code Comments**: Document complex algorithm sections

### Architecture Improvements
1. **State Management Library**: Consider Redux/Zustand for complex state
2. **Route-Based Navigation**: Multiple pages (game, patterns, about)
3. **Local Storage**: Persist user preferences and patterns
4. **Service Worker**: Offline functionality, PWA support
5. **Module Organization**: Separate files for components, utils, constants

## Known Issues & Quirks

1. **Mixed Indentation**: File uses both 2-space and 4-space indentation
2. **Console Logs**: Debug logs present (lines 167, 307, 340-341)
3. **'use client' Directive**: Line 1 suggests Next.js compatibility attempt (unnecessary for CRA)
4. **Test Mismatch**: Default test expects "learn react" text that doesn't exist
5. **Key Generation**: Keys calculated mathematically (could use more robust approach)
6. **No Cell Age Tracking**: Can't visualize pattern longevity
7. **Performance**: DOM-based rendering limits practical grid size (~50x50)

## Debugging Tips

- **State Inspection**: Console logs show world array on Board render
- **Generation Counter**: Visible on UI for tracking evolution
- **React DevTools**: Inspect component hierarchy and state
- **Performance**: Check for excessive re-renders in large grids
- **Drag Issues**: Global mouseup listener should prevent stuck drag state

## Dependencies

All dependencies managed via `package.json`:
- **React**: ^18.2.0 (core library)
- **react-dom**: ^18.2.0 (DOM rendering)
- **react-scripts**: 5.0.1 (build tooling, includes webpack, Babel, ESLint)
- **@testing-library/react**: ^13.4.0 (testing utilities)
- **@testing-library/jest-dom**: ^5.17.0 (DOM matchers)
- **@testing-library/user-event**: ^13.5.0 (user interaction simulation)
- **web-vitals**: ^2.1.4 (performance metrics)

No additional runtime dependencies required.
