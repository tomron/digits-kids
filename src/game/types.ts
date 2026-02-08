export type Difficulty = 'easy' | 'medium' | 'hard';
export type Operation = '+' | '-' | '*' | '/';
export type GameMode = 'classic' | 'timer' | 'challenge';

export interface DifficultyConfig {
  label: string;
  targetMin: number;
  targetMax: number;
  numberCount: number;
  operations: Operation[];
  numberRange: [number, number];
  largeNumberRange?: [number, number];
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    targetMin: 1,
    targetMax: 50,
    numberCount: 4,
    operations: ['+', '-'],
    numberRange: [1, 15],
  },
  medium: {
    label: 'Medium',
    targetMin: 20,
    targetMax: 150,
    numberCount: 5,
    operations: ['+', '-', '*'],
    numberRange: [1, 25],
  },
  hard: {
    label: 'Hard',
    targetMin: 50,
    targetMax: 300,
    numberCount: 6,
    operations: ['+', '-', '*', '/'],
    numberRange: [1, 25],
    largeNumberRange: [10, 50],
  },
};

export interface HistoryEntry {
  numbers: number[];
  operand1: number;
  operand2: number;
  operation: Operation;
  result: number;
}

export interface ChallengeStats {
  puzzlesSolved: number;
  puzzlesSkipped: number;
}

export interface GameState {
  difficulty: Difficulty;
  mode: GameMode;
  target: number;
  numbers: number[];
  initialNumbers: number[];
  selectedIndices: number[];
  selectedOperation: Operation | null;
  history: HistoryEntry[];
  status: 'playing' | 'won' | 'timeout';
  moveCount: number;
  message: string | null;
  timeRemaining: number | null; // in seconds, null for classic mode
  timerStartedAt: number | null; // timestamp when timer started
  challengeStats: ChallengeStats | null; // stats for challenge mode
}
