# Product Requirements Document: Digits for Kids

## 1. Overview

**Digits for Kids** is a simplified, kid-friendly version of the discontinued NYT Digits math puzzle game. It is a single-page web application that challenges players to combine numbers using basic arithmetic operations to reach a target number. The game is designed for children aged 6-12 and will be deployed as a static site on GitHub Pages.

**Tech Stack:** TypeScript, HTML, CSS (no framework — vanilla TS for simplicity and zero build-dependency deployment).

---

## 2. Game Rules

### Core Mechanic
- The player is given a **target number** and a set of **starting numbers**.
- The player selects **two numbers** and an **arithmetic operation** (+, −, ×, ÷) to combine them.
- The result replaces the two selected numbers in the pool.
- The player repeats until they reach the target or choose to restart.
- **Only positive whole numbers** are allowed — division that doesn't produce a whole number is not permitted, and subtraction that would produce zero or a negative number is not permitted.

### Winning
- The player wins by producing the **exact target number** from the available pool.
- If the player cannot make any more valid moves without reaching the target, they can undo or restart.

---

## 3. Game Modes

**Digits for Kids** offers three game modes:

| Mode | Description |
|------|-------------|
| **Classic** | Unlimited time to solve the puzzle at your own pace |
| **Timer** | 60-second countdown timer to add challenge and excitement |
| **Challenge** | Solve as many puzzles as possible in 60 seconds with skip option |

The player can switch between modes at any time. The default is **Classic**.

### Challenge Mode Details
- Players have 60 seconds to solve as many puzzles as they can
- When a puzzle is solved, a new one is automatically generated
- Players can skip a puzzle they find too difficult (counts as skipped)
- At the end of 60 seconds, the game shows:
  - Total puzzles solved
  - Total puzzles skipped
  - Final score display
  - **Copy button** to copy results to clipboard
  - **Share button** to share results via Web Share API (mobile) or copy to clipboard as fallback

---

## 4. Difficulty Levels

| Level | Target Range | Starting Numbers | Operations | Layout | Description |
|-------|-------------|-----------------|------------|--------|-------------|
| **Easy** | 1 – 50 | 4 numbers (small: 1-15) | + and − only | Flex wrap | For younger kids (ages 6-8) |
| **Medium** | 20 – 150 | 5 numbers (mixed: 1-25) | +, −, × | Flex wrap | Introduces multiplication (ages 8-10) |
| **Hard** | 50 – 300 | 6 numbers (mixed: 1-25, with one larger 10-50) | +, −, ×, ÷ | 2×3 grid | Full operations, closer to original (ages 10-12) |

The player selects a difficulty level before starting a puzzle. The default is **Easy**.

**Note:** In Hard mode, the 6 numbers are displayed in a 2-row by 3-column grid layout for better visual organization.

---

## 5. Puzzle Generation

Puzzles are **randomly generated on the client** with a guarantee that a solution exists:
1. Pick random starting numbers for the chosen difficulty.
2. Work **backwards** from a random sequence of operations to ensure at least one valid path to the target exists.
3. This "reverse generation" approach guarantees solvability without needing a brute-force solver at runtime.

---

## 6. Gameplay Flow

```
┌─────────────────────────────────────────┐
│           DIGITS FOR KIDS               │
│                                         │
│  Mode: [Classic] [Timer] [Challenge]    │
│     Difficulty: [Easy] [Med] [Hard]     │
│                                         │
│         Target: ★ 42 ★                  │
│      Timer: 0:45  |  Solved: 3          │
│                                         │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│   │  3 │ │  7 │ │ 10 │ │  5 │          │
│   └────┘ └────┘ └────┘ └────┘          │
│                                         │
│       [ + ]  [ − ]  [ × ]  [ ÷ ]       │
│                                         │
│   Current: 3 + 7 = ?         [Go]       │
│                                         │
│   ┌──────┐ ┌─────────┐ ┌──────┐        │
│   │ Undo │ │ Explain │ │ New  │        │
│   └──────┘ └─────────┘ └──────┘        │
│                                         │
│   Moves: 1 / 3                          │
└─────────────────────────────────────────┘
```

**Challenge Mode View:**
```
┌─────────────────────────────────────────┐
│       TIME'S UP! Great Job! 🎉          │
│                                         │
│   ┌───────────────────────────────┐    │
│   │   PUZZLES SOLVED:    5        │    │
│   │   PUZZLES SKIPPED:   2        │    │
│   └───────────────────────────────┘    │
│                                         │
│        [Play Again] [Change Mode]       │
└─────────────────────────────────────────┘
```

### Interaction Steps
1. **Tap/click a number** — it highlights as the first operand.
2. **Tap/click an operation** (+, −, ×, ÷) — it highlights as the chosen operation.
3. **Tap/click a second number** — a preview of the equation appears (e.g., `3 + 7 = 10`).
4. **Confirm** — the result replaces the two numbers in the pool. (Auto-confirm on second number selection to reduce friction.)
5. Repeat until the target is reached or the player undoes/restarts.

### Deselection
- Tapping an already-selected number or operation deselects it.
- Tapping a different number when one is already selected swaps the selection.

---

## 7. Features

### MVP (v1.0)

| Feature | Description |
|---------|-------------|
| **Game modes** | Choose between Classic (unlimited time), Timer (60-second countdown), or Challenge (solve as many as possible) |
| **Timer display** | Real-time countdown timer in Timer and Challenge modes with timeout handling |
| **Skip button** | In Challenge mode, skip the current puzzle (counts as skipped) |
| **Challenge stats** | Track and display solved and skipped puzzles during Challenge mode |
| **Challenge results** | Show final score (solved/skipped) when Challenge mode timer expires |
| **Copy results** | Copy Challenge mode results to clipboard with one click |
| **Share results** | Share Challenge mode results via native Web Share API (mobile) or clipboard fallback (desktop) |
| **Puzzle board** | Display target number and available number tiles |
| **Hard mode grid layout** | 2×3 grid layout for 6 numbers in Hard difficulty |
| **Operation buttons** | +, −, ×, ÷ (filtered by difficulty) |
| **Number selection** | Tap-to-select interaction with visual highlights |
| **Auto-resolve** | Automatically compute and apply operation when two numbers + operation are selected |
| **Invalid move feedback** | Shake animation + message when operation produces non-integer or negative result |
| **Undo** | Undo the last operation (restores the two numbers and removes the result) |
| **Restart** | Reset current puzzle to its initial state |
| **Explain** | Show step-by-step solution to help users understand how to solve the puzzle |
| **New Puzzle** | Generate a fresh puzzle at the current difficulty and mode |
| **Win celebration** | Confetti animation + congratulations message on reaching the target |
| **Timeout overlay** | Display message when time runs out in Timer mode |
| **Mode selector** | Toggle between Classic / Timer modes |
| **Difficulty selector** | Toggle between Easy / Medium / Hard before or between puzzles |
| **Move counter** | Show how many operations the player has used |
| **Responsive design** | Works well on tablets and phones (primary kid devices) |
| **Offline support** | Works without internet after initial load (no backend) |

### Out of Scope (potential future)

- Daily puzzle mode
- Progressive hints system (partial hints before showing full solution)
- Sound effects
- Score persistence / streak tracking
- Multiplayer / competitive mode
- User accounts

---

## 8. UI / Visual Design

### Style
- **Colorful and playful** — rounded corners, large tap targets (minimum 48px), bold fonts.
- **High contrast** — accessible color palette that works for color-blind users.
- **Large text** — target number is prominently displayed; number tiles are large and easy to tap.
- **Minimal chrome** — no menus, no navigation, everything on one screen.

### Color Palette (indicative)
- Background: soft gradient (light blue → light purple)
- Number tiles: white cards with colored borders (changes on selection)
- Selected state: bright yellow highlight with subtle scale-up
- Operation buttons: distinct pastel colors per operation
- Target number: bold, centered, with a subtle glow or star decoration
- Win state: green background flash + confetti

### Typography
- Primary font: system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- Large sizes: target = 48px, number tiles = 32px, operations = 28px

### Layout
- Single column, centered, max-width 480px.
- Mobile-first, scales gracefully to desktop.

---

## 9. Technical Architecture

```
digits-kids/
├── index.html              # Single HTML entry point
├── src/
│   ├── main.ts             # Entry point, initializes game
│   ├── game/
│   │   ├── types.ts        # Type definitions (GameState, Difficulty, Operation, etc.)
│   │   ├── engine.ts       # Core game logic (apply operation, validate, check win)
│   │   ├── generator.ts    # Puzzle generation (reverse-solve approach)
│   │   └── solver.ts       # Solvability verification
│   ├── ui/
│   │   ├── renderer.ts     # DOM rendering and updates
│   │   ├── animations.ts   # Confetti, shake, highlight animations
│   │   └── events.ts       # Event handlers (click, touch)
│   └── utils/
│       └── random.ts       # Seeded random helpers
├── styles/
│   └── main.css            # All styles
├── tsconfig.json
├── package.json            # Build scripts (tsc + bundler)
├── vite.config.ts          # Vite for dev server + build
└── dist/                   # Built output for GitHub Pages
```

### Build & Deploy
- **Vite** as the dev server and bundler (fast, zero-config TS support).
- `npm run dev` for local development.
- `npm run build` produces static files in `dist/`.
- GitHub Pages serves from the `dist/` folder (or via GitHub Actions).

### Key Design Decisions
- **No framework** — vanilla TypeScript with direct DOM manipulation. The app is small enough that React/Vue adds unnecessary complexity.
- **No backend** — all puzzle generation happens client-side.
- **No state management library** — a simple state object passed through functions.

---

## 10. Game State Model

```typescript
type Difficulty = 'easy' | 'medium' | 'hard';
type Operation = '+' | '-' | '*' | '/';
type GameMode = 'classic' | 'timer' | 'challenge';

interface GameState {
  difficulty: Difficulty;
  mode: GameMode;
  target: number;
  numbers: number[];              // current available numbers
  initialNumbers: number[];       // for restart
  selectedIndices: number[];      // 0, 1, or 2 selected number indices
  selectedOperation: Operation | null;
  history: HistoryEntry[];        // for undo
  status: 'playing' | 'won' | 'timeout';
  timeRemaining: number | null;   // in seconds, null for classic mode
  timerStartedAt: number | null;  // timestamp when timer started
  challengeStats: ChallengeStats | null; // stats for challenge mode
}

interface HistoryEntry {
  numbers: number[];              // snapshot before this operation
  operand1: number;
  operand2: number;
  operation: Operation;
  result: number;
}

interface ChallengeStats {
  puzzlesSolved: number;          // total puzzles solved
  puzzlesSkipped: number;         // total puzzles skipped
}
```

---

## 11. Puzzle Generation Algorithm

1. **Pick N random starting numbers** according to difficulty constraints.
2. **Simulate a random sequence of valid operations** on those numbers to produce an intermediate set.
3. **Choose one of the intermediate results as the target.**
4. This guarantees at least one solution path exists.

Alternative approach (simpler):
1. Start with the target number.
2. **Reverse-decompose** it: split the target into two numbers via a random inverse operation.
3. Repeat, expanding the pool until we have the right count of starting numbers.
4. Shuffle the starting numbers.

The second approach is cleaner and more predictable. We'll use this one.

---

## 12. Validation Rules

| Operation | Valid When |
|-----------|-----------|
| a + b     | Always valid |
| a − b     | a > b (result must be positive, non-zero) |
| a × b     | Always valid |
| a ÷ b     | b ≠ 0 and a % b === 0 (must divide evenly) |

---

## 13. Acceptance Criteria

- [ ] Player can select game mode (Classic, Timer, or Challenge).
- [ ] Timer mode shows a 60-second countdown timer.
- [ ] Timer mode displays timeout overlay when time expires.
- [ ] Challenge mode tracks solved and skipped puzzles.
- [ ] Challenge mode allows skipping puzzles.
- [ ] Challenge mode auto-generates new puzzle when one is solved.
- [ ] Challenge mode shows final stats (solved/skipped) when time expires.
- [ ] Player can select difficulty (Easy, Medium, Hard) and start a new puzzle.
- [ ] Hard mode displays numbers in a 2×3 grid layout.
- [ ] Puzzle always has at least one valid solution.
- [ ] Player can select two numbers and an operation to combine them.
- [ ] Invalid operations (negative result, non-integer division) show clear feedback.
- [ ] Undo restores the previous state correctly.
- [ ] Restart resets to the original puzzle numbers.
- [ ] Reaching the target number triggers a win celebration.
- [ ] Game is fully playable on mobile (touch) and desktop (click).
- [ ] Page loads fast (<1s) and works offline after first load.
- [ ] All code is TypeScript with no `any` types.
- [ ] Deployed and accessible via GitHub Pages.

---

## 14. Resolved Design Decisions

1. **Auto-confirm** — operation applies automatically when both numbers + operation are selected (no "Go" button).
2. **Confetti in MVP** — celebration animations are included in the initial release.
3. **Default colorful gradient theme** — no specific theme, use the playful gradient design described above.
4. **Vite** — used for dev server and bundling.
5. **Timer duration** — 60 seconds for Timer and Challenge modes provides appropriate challenge for kids.
6. **Hard mode grid layout** — 2×3 grid layout improves visual organization for 6 numbers.
7. **Challenge mode behavior** — Auto-generates new puzzle on solve, shows skip button instead of restart, displays running stats.
8. **Challenge mode stats** — Track both solved and skipped puzzles to encourage completion while allowing difficulty adjustment.
