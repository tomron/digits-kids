# CLAUDE.md - Development Guidelines for Digits for Kids

## Project Overview

Digits for Kids is a kid-friendly math puzzle game built with TypeScript, Vite, and vanilla DOM manipulation. The game is deployed to GitHub Pages and allows children to combine numbers using arithmetic operations to reach a target number.

## Critical Workflow Requirements

### 1. Git Worktree and Branch Management

**ALWAYS create a new git worktree and branch for each feature or change:**

```bash
# Create a new worktree for a feature
git worktree add ../digits-kids-<feature-name> -b <branch-name>

# Example:
git worktree add ../digits-kids-timer-fix -b fix/timer-countdown
```

**Why:** This keeps the main working directory clean and allows parallel development without context switching.

**After completing work:**
- Commit changes in the worktree
- Push to remote
- Create a pull request
- Switch back to main worktree
- Clean up merged worktree using `/clean_gone` command

### 2. Documentation Updates

**REQUIRED: Update both PRD.md and README.md on EVERY change that affects:**
- Game functionality or features
- User interface or user experience
- Technical architecture or dependencies
- Game modes, difficulty levels, or rules
- Deployment or development process

**PRD.md** should reflect:
- Updated feature specifications
- New acceptance criteria
- Changed game mechanics
- Technical architecture modifications

**README.md** should reflect:
- User-facing feature changes
- Updated setup/build instructions
- New dependencies or tech stack changes
- Modified gameplay instructions

### 3. Build and Test Verification

**MANDATORY: Run build and tests before every commit:**

```bash
# Run all tests (recommended before commit)
npm test -- --run

# Build the application
npm run build

# Preview the production build locally
npm run preview

# Run tests in watch mode during development
npm test

# Run tests with UI (helpful for debugging)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

**Pre-commit checklist:**
- [ ] All tests pass (`npm test -- --run`)
- [ ] TypeScript compiles without errors
- [ ] Vite build completes successfully
- [ ] No console errors in development mode
- [ ] Game functions correctly in browser preview
- [ ] All game modes (Classic/Timer/Challenge) work
- [ ] All difficulty levels (Easy/Medium/Hard) work
- [ ] Key interactions tested (number selection, operations, undo, restart, skip)

## Project Structure

```
digits-kids/
├── index.html              # Single HTML entry point
├── src/
│   ├── main.ts             # Entry point, initializes game
│   ├── game/
│   │   ├── types.ts        # Type definitions (GameState, Difficulty, etc.)
│   │   ├── engine.ts       # Core game logic (apply operation, validate, check win)
│   │   ├── engine.test.ts  # Tests for game engine
│   │   ├── generator.ts    # Puzzle generation (reverse-solve approach)
│   │   └── generator.test.ts # Tests for puzzle generator
│   ├── ui/
│   │   ├── renderer.ts     # DOM rendering and updates
│   │   ├── animations.ts   # Confetti, shake, highlight animations
│   │   └── events.ts       # Event handlers (click, touch)
│   └── utils/
│       ├── random.ts       # Seeded random helpers
│       └── random.test.ts  # Tests for random utilities
├── styles/
│   └── main.css            # All styles
├── PRD.md                  # Product Requirements Document (KEEP UPDATED)
├── README.md               # User-facing documentation (KEEP UPDATED)
├── CLAUDE.md               # Development guidelines (this file)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts        # Test configuration
└── dist/                   # Built output for GitHub Pages
```

## Code Style and Standards

### TypeScript Guidelines

1. **Strict mode enabled** - No `any` types allowed
2. **All functions must have explicit return types**
3. **Use type imports** where appropriate
4. **No unused variables or parameters** (enforced by tsconfig)

### Code Organization

- **No frameworks** - Use vanilla TypeScript with direct DOM manipulation
- **Pure functions** - Game logic should be pure and testable
- **Single responsibility** - Each module has one clear purpose
- **Minimal complexity** - Avoid over-engineering; keep solutions simple

### Naming Conventions

- **Files**: kebab-case (e.g., `generator.ts`, `event-handlers.ts`)
- **Types/Interfaces**: PascalCase (e.g., `GameState`, `Operation`)
- **Variables/Functions**: camelCase (e.g., `applyOperation`, `generatePuzzle`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TARGET_VALUE`)

## Development Workflow

### Starting New Work

1. Create a new worktree and branch (see above)
2. Make your changes
3. Run build and verify it works: `npm run build && npm run preview`
4. Update PRD.md and README.md if needed
5. Commit changes with descriptive message
6. Push and create PR

### Making Changes

**Before editing code:**
- Read relevant files first to understand current implementation
- Check PRD.md for specification details
- Look for existing patterns to follow

**When adding features:**
- Follow the architecture in PRD.md section 9
- Keep TypeScript strict compliance
- Add types to `types.ts` if needed
- Consider mobile/touch interaction

**When fixing bugs:**
- Understand root cause before fixing
- Ensure fix doesn't break other game modes or difficulties
- Test all game states (playing, won, timeout)

## Game-Specific Guidelines

### Game Modes
- **Classic Mode**: Unlimited time
- **Timer Mode**: 60-second countdown

Always test both modes when making changes to game logic.

### Difficulty Levels
- **Easy**: 4 numbers, + and − only, target 1-50
- **Medium**: 5 numbers, +, −, ×, target 20-150
- **Hard**: 6 numbers (2×3 grid), all operations, target 50-300

### Validation Rules
- Addition: always valid
- Subtraction: only if a > b (positive result)
- Multiplication: always valid
- Division: only if b ≠ 0 and a % b === 0 (whole number result)

### UI/UX Principles
- Large tap targets (minimum 48px)
- Clear visual feedback for selections
- Shake animation for invalid moves
- Confetti celebration on win
- Mobile-first responsive design

## Deployment

### GitHub Pages Deployment

The project uses a dedicated gh-pages worktree managed by `deploy.sh`:

```bash
./deploy.sh
```

**What it does:**
1. Builds the application (`npm run build`)
2. Copies dist files to gh-pages worktree
3. Commits and pushes to gh-pages branch
4. Deployed site: https://tomron.github.io/digits-kids/

**Setup requirement:**
The deploy script expects a gh-pages worktree at `../digits-kids-gh-pages`. If it doesn't exist:

```bash
git worktree add ../digits-kids-gh-pages gh-pages
```

### Vite Configuration

The base path is set to `/digits-kids/` for GitHub Pages deployment:

```typescript
// vite.config.ts
base: '/digits-kids/'
```

## Testing Strategy

The project uses **Vitest** for automated testing with **jsdom** for DOM environment simulation.

### Automated Tests

Run automated tests before every commit:

```bash
# Run all tests once
npm test -- --run

# Run tests in watch mode (during development)
npm test

# Run with UI for debugging
npm run test:ui

# Run with coverage report
npm run test:coverage
```

**Test Coverage:**
- `src/game/engine.test.ts` - Core game logic (operations, validation, move execution, undo, restart)
- `src/game/generator.test.ts` - Puzzle generation (solvability, difficulty constraints)
- `src/utils/random.test.ts` - Random number utilities (seeded random, range validation)

**Testing Guidelines:**
- All game logic modules should have corresponding `.test.ts` files
- Tests use Vitest with jsdom environment
- Use `describe` blocks to group related tests
- Use descriptive test names that explain the expected behavior
- Test both success and failure cases
- Verify edge cases (division by zero, subtraction resulting in negatives, etc.)

### Manual Test Checklist

In addition to automated tests, perform manual testing for UI/UX:

**Basic Gameplay:**
- [ ] Can select two numbers
- [ ] Can select an operation
- [ ] Operation applies correctly and automatically
- [ ] Invalid operations show shake animation and error message
- [ ] Reaching target triggers confetti and win state

**Game Modes:**
- [ ] Classic mode has no timer
- [ ] Timer mode shows countdown
- [ ] Timer mode ends game at 0:00
- [ ] Can switch modes between puzzles

**Difficulty Levels:**
- [ ] Easy: 4 numbers, only + and −
- [ ] Medium: 5 numbers, +, −, ×
- [ ] Hard: 6 numbers in 2×3 grid, all operations

**Controls:**
- [ ] Undo restores previous state
- [ ] Restart resets to initial puzzle
- [ ] New Puzzle generates fresh puzzle

**Responsive Design:**
- [ ] Works on mobile (touch)
- [ ] Works on tablet
- [ ] Works on desktop (click)

## Common Tasks

### Add a new feature
1. Create worktree: `git worktree add ../digits-kids-<feature> -b feature/<name>`
2. Implement feature following existing patterns
3. Add tests for new functionality (if applicable)
4. Update PRD.md with new specifications
5. Update README.md with user-facing changes
6. Run tests: `npm test -- --run`
7. Build and test: `npm run build && npm run preview`
8. Commit, push, and create PR

### Fix a bug
1. Create worktree: `git worktree add ../digits-kids-<bugfix> -b fix/<name>`
2. Identify and fix the issue
3. Add/update tests to cover the bug
4. Run tests: `npm test -- --run`
5. Test the fix in all game modes and difficulties
6. Build and verify: `npm run build && npm run preview`
7. Update docs if the bug revealed missing specification
8. Commit, push, and create PR

### Refactor code
1. Create worktree: `git worktree add ../digits-kids-refactor -b refactor/<name>`
2. Refactor while maintaining existing behavior
3. Ensure all tests still pass: `npm test -- --run`
4. Ensure no TypeScript errors
5. Test all game functionality
6. Update PRD.md if architecture changed
7. Build and test: `npm run build && npm run preview`
8. Commit, push, and create PR

### Update styling
1. Create worktree: `git worktree add ../digits-kids-styling -b style/<name>`
2. Edit `styles/main.css`
3. Test on mobile and desktop
4. Verify all difficulty layouts (especially Hard mode grid)
5. Build and preview: `npm run build && npm run preview`
6. Commit, push, and create PR

## Dependencies

**Production:**
- None (vanilla TypeScript, no runtime dependencies)

**Development:**
- `typescript` - Type checking and compilation
- `vite` - Dev server and bundler
- `vitest` - Fast unit test framework
- `@vitest/ui` - Interactive test UI
- `jsdom` - DOM environment for testing

**Keep dependencies minimal.** This is intentional for:
- Fast load times
- Offline capability
- Simple deployment
- Easy maintenance

All test dependencies are dev-only and don't affect the production bundle.

## Security Considerations

- No user authentication (no backend)
- No external API calls
- No data persistence (all client-side, session-only)
- No user-generated content
- Safe for kids - no ads, tracking, or external links

## Performance Guidelines

- Keep JavaScript bundle small (<100KB)
- Optimize for mobile devices (primary target audience)
- Minimize reflows/repaints during animations
- Use CSS transforms for animations (GPU-accelerated)
- Lazy-load confetti animation if needed

## Accessibility

- High contrast colors
- Large text sizes
- Large tap targets (48px minimum)
- Color-blind friendly palette
- Keyboard navigation should work for desktop users

## Future Enhancements (Out of Scope for MVP)

These are explicitly NOT in the current scope:
- Daily puzzle mode
- Hints system
- Sound effects
- Score persistence
- Multiplayer mode
- User accounts
- Backend/database

If implementing any of these, update PRD.md first with specifications.

## Questions or Issues?

- Check PRD.md for game specifications
- Review existing code patterns before adding new ones
- Follow the three critical requirements: worktree, docs, build/test
- Keep it simple - avoid over-engineering

## Summary Checklist for Every Change

- [ ] Create new worktree and branch
- [ ] Make changes following project patterns
- [ ] Add/update tests if changing game logic (`npm test -- --run`)
- [ ] Update PRD.md if specifications changed
- [ ] Update README.md if user-facing features changed
- [ ] Run `npm test -- --run` - all tests must pass
- [ ] Run `npm run build` successfully
- [ ] Test in `npm run preview`
- [ ] Verify game works in browser
- [ ] Test all game modes (Classic/Timer/Challenge)
- [ ] Test all difficulty levels
- [ ] Commit with descriptive message
- [ ] Push and create PR
- [ ] After merge, clean up worktree
