# Digits for Kids

A kid-friendly math puzzle game where players combine numbers using arithmetic operations to reach a target number. This is a simplified, educational version of the discontinued NYT Digits game.

## Features

- **Three Game Modes:**
  - **Classic Mode**: Solve puzzles at your own pace with unlimited time
  - **Timer Mode**: Race against a 60-second countdown for added challenge
  - **Challenge Mode**: Solve as many puzzles as possible in 60 seconds

- **Three Difficulty Levels:**
  - **Easy** (Ages 6-8): Addition and subtraction only
  - **Medium** (Ages 8-10): Introduces multiplication
  - **Hard** (Ages 10-12): All four operations including division

- **Interactive Gameplay:**
  - Tap numbers and operations to combine them
  - Undo mistakes
  - Restart or generate new puzzles
  - Get help with the "Explain" button to see a step-by-step solution
  - Skip puzzles in Challenge mode
  - Win celebrations with confetti
  - Track your progress in Challenge mode (solved/skipped)

- **Smart Layout:**
  - Hard mode displays 6 numbers in a clean 2×3 grid
  - Mobile-friendly responsive design
  - Works offline after first load

## How to Play

1. Choose your game mode (Classic, Timer, or Challenge)
2. Select a difficulty level
3. Pick two numbers from the available tiles
4. Choose an arithmetic operation (+, −, ×, ÷)
5. The result replaces the two numbers
6. Keep combining until you reach the target number!

**Challenge Mode:**
- Solve as many puzzles as you can in 60 seconds
- Click "Skip" to move to the next puzzle if you're stuck
- When you solve a puzzle, a new one appears automatically
- Your score shows solved and skipped puzzles at the end!
- Click "Copy" to copy your results to clipboard
- Click "Share" to share your results with friends (uses native share on mobile)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- TypeScript
- Vite (dev server & bundler)
- Vanilla HTML/CSS (no framework)
- GitHub Pages (deployment)

## License

MIT
