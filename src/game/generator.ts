import { Difficulty, DifficultyConfig, DIFFICULTY_CONFIGS, Operation, GameState, GameMode, SolutionStep } from './types';
import { randomInt, pickRandom, shuffle } from '../utils/random';
import { applyOperation } from './engine';

interface SearchNode {
  numbers: number[];
  path: SolutionStep[];
}

/**
 * Generate a puzzle using forward simulation:
 * 1. Generate random starting numbers
 * 2. Simulate random valid operations to produce a target
 * 3. This guarantees at least one solution path exists
 */
export function generatePuzzle(difficulty: Difficulty, mode: GameMode = 'classic'): GameState {
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Try until we get a good puzzle
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = tryGeneratePuzzle(config, difficulty, mode);
    if (result) return result;
  }

  // Fallback — should rarely happen
  return tryGeneratePuzzle(config, difficulty, mode, true)!;
}

function tryGeneratePuzzle(
  config: DifficultyConfig,
  difficulty: Difficulty,
  mode: GameMode,
  forceFallback = false
): GameState | null {
  // Generate starting numbers
  const numbers = generateStartingNumbers(config);

  // Simulate a random sequence of operations to find a target
  const simNumbers = [...numbers];
  const steps = Math.min(2, simNumbers.length - 1); // Use 2 operations to create the target

  for (let step = 0; step < steps; step++) {
    if (simNumbers.length < 2) break;

    const validMoves = findValidMoves(simNumbers, config.operations);
    if (validMoves.length === 0) break;

    const move = pickRandom(validMoves);
    const result = applyOperation(move.op, move.a, move.b)!;

    // Remove used numbers and add result
    const idxA = simNumbers.indexOf(move.a);
    simNumbers.splice(idxA, 1);
    const idxB = simNumbers.indexOf(move.b);
    simNumbers.splice(idxB, 1);
    simNumbers.push(result);
  }

  // Pick target from the resulting numbers
  const target = pickRandom(simNumbers);

  // Validate target is in range
  if (!forceFallback && (target < config.targetMin || target > config.targetMax)) {
    return null;
  }

  // Make sure target isn't already in the starting numbers
  if (numbers.includes(target)) {
    return null;
  }

  // Find the shortest solution to reach the target
  const solution = findShortestSolution(numbers, target, config.operations);

  return {
    difficulty,
    mode,
    target,
    numbers: shuffle([...numbers]),
    initialNumbers: [...numbers],
    selectedIndices: [],
    selectedOperation: null,
    history: [],
    status: 'playing',
    moveCount: 0,
    message: null,
    timeRemaining: mode === 'timer' || mode === 'challenge' ? 60 : null,
    timerStartedAt: mode === 'timer' || mode === 'challenge' ? Date.now() : null,
    challengeStats: mode === 'challenge' ? { puzzlesSolved: 0, puzzlesSkipped: 0 } : null,
    solution,
  };
}

function generateStartingNumbers(config: DifficultyConfig): number[] {
  const numbers: number[] = [];
  const count = config.numberCount;

  for (let i = 0; i < count; i++) {
    // For hard mode, make the last number larger
    if (i === count - 1 && config.largeNumberRange) {
      numbers.push(randomInt(config.largeNumberRange[0], config.largeNumberRange[1]));
    } else {
      let num: number;
      // Avoid duplicates
      do {
        num = randomInt(config.numberRange[0], config.numberRange[1]);
      } while (numbers.includes(num));
      numbers.push(num);
    }
  }

  return numbers;
}

interface ValidMove {
  a: number;
  b: number;
  op: Operation;
}

function findValidMoves(numbers: number[], allowedOps: Operation[]): ValidMove[] {
  const moves: ValidMove[] = [];

  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      for (const op of allowedOps) {
        const a = numbers[i];
        const b = numbers[j];

        if (applyOperation(op, a, b) !== null) {
          moves.push({ a, b, op });
        }
        // Try reverse order for non-commutative ops
        if ((op === '-' || op === '/') && applyOperation(op, b, a) !== null) {
          moves.push({ a: b, b: a, op });
        }
      }
    }
  }

  return moves;
}

/**
 * Find the shortest solution to reach the target using BFS
 */
function findShortestSolution(numbers: number[], target: number, allowedOps: Operation[]): SolutionStep[] {
  // If target is already in numbers, no solution needed
  if (numbers.includes(target)) {
    return [];
  }

  const queue: SearchNode[] = [{ numbers: [...numbers], path: [] }];
  const visited = new Set<string>();
  visited.add(sortedKey(numbers));

  while (queue.length > 0) {
    const node = queue.shift()!;

    // Try all valid moves from current state
    const validMoves = findValidMoves(node.numbers, allowedOps);

    for (const move of validMoves) {
      const result = applyOperation(move.op, move.a, move.b)!;

      // Properly remove the two numbers and add result
      const tempNumbers = [...node.numbers];
      const idxA = tempNumbers.indexOf(move.a);
      tempNumbers.splice(idxA, 1);
      const idxB = tempNumbers.indexOf(move.b);
      tempNumbers.splice(idxB, 1);
      tempNumbers.push(result);

      const newPath = [
        ...node.path,
        {
          operand1: move.a,
          operand2: move.b,
          operation: move.op,
          result,
        },
      ];

      // Check if we reached the target
      if (result === target) {
        return newPath;
      }

      // Add to queue if not visited
      const key = sortedKey(tempNumbers);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ numbers: tempNumbers, path: newPath });
      }
    }
  }

  // No solution found (shouldn't happen with our generation method)
  return [];
}

/**
 * Create a sorted string key for a numbers array to detect visited states
 */
function sortedKey(numbers: number[]): string {
  return [...numbers].sort((a, b) => a - b).join(',');
}

/**
 * Generate a new puzzle in challenge mode, preserving timer and stats
 */
export function generateChallengePuzzle(currentState: GameState): GameState {
  const config = DIFFICULTY_CONFIGS[currentState.difficulty];

  // Try until we get a good puzzle
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = tryGenerateChallengePuzzle(config, currentState);
    if (result) return result;
  }

  // Fallback — should rarely happen
  return tryGenerateChallengePuzzle(config, currentState, true)!;
}

function tryGenerateChallengePuzzle(
  config: DifficultyConfig,
  currentState: GameState,
  forceFallback = false
): GameState | null {
  // Generate starting numbers
  const numbers = generateStartingNumbers(config);

  // Simulate a random sequence of operations to find a target
  const simNumbers = [...numbers];
  const steps = Math.min(2, simNumbers.length - 1);

  for (let step = 0; step < steps; step++) {
    if (simNumbers.length < 2) break;

    const validMoves = findValidMoves(simNumbers, config.operations);
    if (validMoves.length === 0) break;

    const move = pickRandom(validMoves);
    const result = applyOperation(move.op, move.a, move.b)!;

    const idxA = simNumbers.indexOf(move.a);
    simNumbers.splice(idxA, 1);
    const idxB = simNumbers.indexOf(move.b);
    simNumbers.splice(idxB, 1);
    simNumbers.push(result);
  }

  const target = pickRandom(simNumbers);

  if (!forceFallback && (target < config.targetMin || target > config.targetMax)) {
    return null;
  }

  if (numbers.includes(target)) {
    return null;
  }

  // Find the shortest solution to reach the target
  const solution = findShortestSolution(numbers, target, config.operations);

  return {
    ...currentState,
    target,
    numbers: shuffle([...numbers]),
    initialNumbers: [...numbers],
    selectedIndices: [],
    selectedOperation: null,
    history: [],
    status: 'playing',
    moveCount: 0,
    message: null,
    solution,
    // Preserve timer and stats
  };
}
