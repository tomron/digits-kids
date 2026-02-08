# Testing Documentation

## Overview

This project uses **Vitest** as the testing framework. Vitest is a fast, Vite-native test framework with a Jest-compatible API.

## Test Structure

Tests are organized alongside the source code:

```
src/
├── game/
│   ├── engine.ts
│   ├── engine.test.ts         # Tests for game engine logic
│   ├── generator.ts
│   └── generator.test.ts      # Tests for puzzle generation
└── utils/
    ├── random.ts
    └── random.test.ts         # Tests for random utilities
```

## Test Coverage

### Core Game Engine (`engine.test.ts`) - 28 tests

Tests the fundamental game mechanics:

- **Operation Logic**: Addition, subtraction, multiplication, division
  - Valid operations (positive results, whole numbers only)
  - Invalid operations (negative results, remainders, division by zero)
- **Move Execution**: Combining numbers with operations
  - Valid moves and state updates
  - Invalid move handling and error messages
  - Win condition detection
  - History tracking
- **Undo Functionality**: Reverting moves
- **Restart Functionality**: Resetting to initial state

### Puzzle Generator (`generator.test.ts`) - 27 tests

Tests puzzle generation across all difficulty levels:

- **Easy Difficulty**: 4 numbers, target 1-50, operations: +, −
- **Medium Difficulty**: 5 numbers, target 20-150, operations: +, −, ×
- **Hard Difficulty**: 6 numbers, target 50-300, all operations including ÷

Tests cover:
- Number count validation
- Target range validation
- Target not in starting numbers
- Number range validation
- Large numbers in hard mode
- Game mode initialization (classic vs timer)
- Puzzle uniqueness and variety
- Basic solvability checks

### Random Utilities (`random.test.ts`) - 23 tests

Tests helper functions for randomness:

- **randomInt**: Generate random integers within a range
- **pickRandom**: Pick a random element from an array
- **shuffle**: Shuffle an array (Fisher-Yates algorithm)

Includes deterministic tests using mocked `Math.random` for edge cases.

## Running Tests

### Run all tests once
```bash
npm run test:run
```

### Run tests in watch mode (during development)
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```
Opens an interactive UI at `http://localhost:51204/__vitest__/` to view and debug tests.

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Configuration

Configuration is in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,           // Enable global test APIs (describe, it, expect)
    environment: 'jsdom',    // Use jsdom for DOM APIs
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.ts',
        '**/main.ts',       // UI entry point not tested
      ],
    },
  },
});
```

## TypeScript Configuration

Test files are excluded from the production build:

```json
{
  "exclude": ["src/**/*.test.ts", "node_modules", "dist"]
}
```

This ensures:
- Tests don't get bundled in the production build
- `tsc` doesn't complain about test-only dependencies
- Build stays fast and lean

## Development Workflow

### Before committing code:

1. **Run tests**: `npm run test:run`
2. **Run build**: `npm run build`
3. **Preview**: `npm run preview`

### When writing new features:

1. Write tests first (TDD) or alongside implementation
2. Place test files next to source files: `feature.ts` → `feature.test.ts`
3. Run tests in watch mode: `npm test`
4. Ensure all tests pass before committing

### Test structure example:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('myFunction', () => {
  it('should handle normal case', () => {
    expect(myFunction(5, 3)).toBe(8);
  });

  it('should handle edge case', () => {
    expect(myFunction(0, 0)).toBe(0);
  });
});
```

## Test Statistics

- **Total Tests**: 78
- **Total Test Files**: 3
- **Test Execution Time**: ~650ms
- **Code Coverage**: Not yet measured (run `npm run test:coverage`)

## Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions.

**Workflow**: `.github/workflows/test.yml`

The CI pipeline:
1. Checks out the code
2. Sets up Node.js 20
3. Installs dependencies with `npm ci`
4. Runs all tests with `npm run test:run`
5. Verifies the build with `npm run build`

**Status**: Check the Actions tab on GitHub or PR status checks.

## Future Testing Improvements

1. **Add integration tests** for complete game flows
2. **Add UI tests** for renderer and animations
3. **Add event handler tests** for user interactions
4. **Set up coverage thresholds** to maintain quality
5. **Performance benchmarks** for puzzle generation
6. **Add test coverage reporting** in CI

## Dependencies

- `vitest`: Test framework
- `@vitest/ui`: Interactive test UI
- `jsdom`: DOM environment for tests

All test dependencies are dev-only and don't affect the production bundle.

## Notes

- Tests use `vitest` globals (`describe`, `it`, `expect`) - no imports needed
- Tests are fast (~20ms execution time for 78 tests)
- DOM environment is available for future UI testing
- Random functions are tested both with real randomness and mocked values
