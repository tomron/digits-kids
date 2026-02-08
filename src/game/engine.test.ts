import { describe, it, expect } from 'vitest';
import { applyOperation, isValidOperation, executeMove, undoMove, restartPuzzle } from './engine';
import { GameState } from './types';

describe('applyOperation', () => {
  describe('addition', () => {
    it('should add two positive numbers', () => {
      expect(applyOperation('+', 5, 3)).toBe(8);
      expect(applyOperation('+', 10, 25)).toBe(35);
    });

    it('should handle zero', () => {
      expect(applyOperation('+', 0, 5)).toBe(5);
      expect(applyOperation('+', 5, 0)).toBe(5);
    });
  });

  describe('subtraction', () => {
    it('should subtract when a > b', () => {
      expect(applyOperation('-', 10, 3)).toBe(7);
      expect(applyOperation('-', 50, 25)).toBe(25);
    });

    it('should return null when a <= b (no negative results)', () => {
      expect(applyOperation('-', 3, 10)).toBe(null);
      expect(applyOperation('-', 5, 5)).toBe(null);
    });

    it('should handle subtracting to zero', () => {
      expect(applyOperation('-', 5, 5)).toBe(null); // No negatives or zeros allowed
    });
  });

  describe('multiplication', () => {
    it('should multiply two positive numbers', () => {
      expect(applyOperation('*', 5, 3)).toBe(15);
      expect(applyOperation('*', 10, 10)).toBe(100);
    });

    it('should handle multiplication by zero', () => {
      expect(applyOperation('*', 5, 0)).toBe(0);
      expect(applyOperation('*', 0, 5)).toBe(0);
    });

    it('should handle multiplication by one', () => {
      expect(applyOperation('*', 5, 1)).toBe(5);
      expect(applyOperation('*', 1, 5)).toBe(5);
    });
  });

  describe('division', () => {
    it('should divide when result is a whole number', () => {
      expect(applyOperation('/', 10, 2)).toBe(5);
      expect(applyOperation('/', 15, 3)).toBe(5);
      expect(applyOperation('/', 100, 10)).toBe(10);
    });

    it('should return null when division produces a remainder', () => {
      expect(applyOperation('/', 10, 3)).toBe(null);
      expect(applyOperation('/', 7, 2)).toBe(null);
    });

    it('should return null when dividing by zero', () => {
      expect(applyOperation('/', 10, 0)).toBe(null);
      expect(applyOperation('/', 0, 0)).toBe(null);
    });

    it('should handle dividing zero by a number', () => {
      expect(applyOperation('/', 0, 5)).toBe(0);
    });
  });
});

describe('isValidOperation', () => {
  it('should return true for valid operations', () => {
    expect(isValidOperation('+', 5, 3)).toBe(true);
    expect(isValidOperation('-', 10, 3)).toBe(true);
    expect(isValidOperation('*', 5, 3)).toBe(true);
    expect(isValidOperation('/', 10, 2)).toBe(true);
  });

  it('should return false for invalid operations', () => {
    expect(isValidOperation('-', 3, 10)).toBe(false);
    expect(isValidOperation('/', 10, 3)).toBe(false);
    expect(isValidOperation('/', 5, 0)).toBe(false);
  });
});

describe('executeMove', () => {
  const createTestState = (overrides: Partial<GameState> = {}): GameState => ({
    difficulty: 'easy',
    mode: 'classic',
    target: 25,
    numbers: [5, 10, 15, 20],
    initialNumbers: [5, 10, 15, 20],
    selectedIndices: [],
    selectedOperation: null,
    history: [],
    status: 'playing',
    moveCount: 0,
    message: null,
    timeRemaining: null,
    timerStartedAt: null,
    ...overrides,
  });

  it('should return state unchanged if less than 2 numbers selected', () => {
    const state = createTestState({ selectedIndices: [0] });
    const newState = executeMove(state);
    expect(newState).toBe(state);
  });

  it('should return state unchanged if no operation selected', () => {
    const state = createTestState({ selectedIndices: [0, 1] });
    const newState = executeMove(state);
    expect(newState).toBe(state);
  });

  it('should execute valid addition move', () => {
    const state = createTestState({
      selectedIndices: [0, 1],
      selectedOperation: '+',
      numbers: [5, 10, 15, 20],
    });
    const newState = executeMove(state);

    expect(newState.numbers).toContain(15); // 5 + 10
    expect(newState.numbers.length).toBe(3); // 4 numbers - 2 used + 1 result
    expect(newState.moveCount).toBe(1);
    expect(newState.history).toHaveLength(1);
    expect(newState.selectedIndices).toEqual([]);
    expect(newState.selectedOperation).toBe(null);
  });

  it('should execute valid subtraction move', () => {
    const state = createTestState({
      selectedIndices: [1, 0],
      selectedOperation: '-',
      numbers: [5, 10, 15, 20],
    });
    const newState = executeMove(state);

    expect(newState.numbers).toContain(5); // 10 - 5
    expect(newState.numbers.length).toBe(3);
    expect(newState.moveCount).toBe(1);
  });

  it('should try both orderings for non-commutative operations', () => {
    const state = createTestState({
      selectedIndices: [0, 1], // 5 and 10, where 5 - 10 is invalid but 10 - 5 is valid
      selectedOperation: '-',
      numbers: [5, 10, 15, 20],
    });
    const newState = executeMove(state);

    expect(newState.numbers).toContain(5); // Should compute 10 - 5
    expect(newState.history[0].operand1).toBe(10);
    expect(newState.history[0].operand2).toBe(5);
  });

  it('should return error message for invalid operations', () => {
    const state = createTestState({
      selectedIndices: [0, 1], // 5 and 7, where 7 / 5 and 5 / 7 are both invalid
      selectedOperation: '/',
      numbers: [5, 7, 20, 3],
    });
    const newState = executeMove(state);

    expect(newState.message).toBe('That operation doesn\'t work! Try another one.');
    expect(newState.selectedIndices).toEqual([]);
    expect(newState.selectedOperation).toBe(null);
    expect(newState.moveCount).toBe(0);
  });

  it('should detect win condition when target is reached', () => {
    const state = createTestState({
      target: 25,
      selectedIndices: [0, 1],
      selectedOperation: '+',
      numbers: [10, 15, 5], // 10 + 15 = 25 (target)
    });
    const newState = executeMove(state);

    expect(newState.status).toBe('won');
    expect(newState.numbers).toContain(25);
  });

  it('should record history entry with correct values', () => {
    const state = createTestState({
      selectedIndices: [0, 1],
      selectedOperation: '*',
      numbers: [5, 10, 15],
    });
    const newState = executeMove(state);

    expect(newState.history).toHaveLength(1);
    const entry = newState.history[0];
    expect(entry.numbers).toEqual([5, 10, 15]);
    expect(entry.operand1).toBe(5);
    expect(entry.operand2).toBe(10);
    expect(entry.operation).toBe('*');
    expect(entry.result).toBe(50);
  });
});

describe('undoMove', () => {
  it('should return state unchanged if no history', () => {
    const state: GameState = {
      difficulty: 'easy',
      mode: 'classic',
      target: 25,
      numbers: [5, 10, 15],
      initialNumbers: [5, 10, 15, 20],
      selectedIndices: [],
      selectedOperation: null,
      history: [],
      status: 'playing',
      moveCount: 0,
      message: null,
      timeRemaining: null,
      timerStartedAt: null,
    };
    const newState = undoMove(state);
    expect(newState).toBe(state);
  });

  it('should restore previous state from history', () => {
    const state: GameState = {
      difficulty: 'easy',
      mode: 'classic',
      target: 25,
      numbers: [15, 20], // After move
      initialNumbers: [5, 10, 15, 20],
      selectedIndices: [],
      selectedOperation: null,
      history: [
        {
          numbers: [5, 10, 15, 20],
          operand1: 5,
          operand2: 10,
          operation: '+',
          result: 15,
        },
      ],
      status: 'playing',
      moveCount: 1,
      message: null,
      timeRemaining: null,
      timerStartedAt: null,
    };

    const newState = undoMove(state);
    expect(newState.numbers).toEqual([5, 10, 15, 20]);
    expect(newState.history).toEqual([]);
    expect(newState.moveCount).toBe(0);
  });

  it('should reset status to playing if was won', () => {
    const state: GameState = {
      difficulty: 'easy',
      mode: 'classic',
      target: 25,
      numbers: [25, 5],
      initialNumbers: [5, 10, 15],
      selectedIndices: [],
      selectedOperation: null,
      history: [
        {
          numbers: [5, 10, 15],
          operand1: 10,
          operand2: 15,
          operation: '+',
          result: 25,
        },
      ],
      status: 'won',
      moveCount: 1,
      message: null,
      timeRemaining: null,
      timerStartedAt: null,
    };

    const newState = undoMove(state);
    expect(newState.status).toBe('playing');
  });

  it('should clear message', () => {
    const state: GameState = {
      difficulty: 'easy',
      mode: 'classic',
      target: 25,
      numbers: [15, 20],
      initialNumbers: [5, 10, 15, 20],
      selectedIndices: [],
      selectedOperation: null,
      history: [
        {
          numbers: [5, 10, 15, 20],
          operand1: 5,
          operand2: 10,
          operation: '+',
          result: 15,
        },
      ],
      status: 'playing',
      moveCount: 1,
      message: '5 + 10 = 15',
      timeRemaining: null,
      timerStartedAt: null,
    };

    const newState = undoMove(state);
    expect(newState.message).toBe(null);
  });
});

describe('restartPuzzle', () => {
  it('should reset to initial state', () => {
    const state: GameState = {
      difficulty: 'easy',
      mode: 'classic',
      target: 25,
      numbers: [15, 20],
      initialNumbers: [5, 10, 15, 20],
      selectedIndices: [0],
      selectedOperation: '+',
      history: [
        {
          numbers: [5, 10, 15, 20],
          operand1: 5,
          operand2: 10,
          operation: '+',
          result: 15,
        },
      ],
      status: 'playing',
      moveCount: 1,
      message: '5 + 10 = 15',
      timeRemaining: null,
      timerStartedAt: null,
    };

    const newState = restartPuzzle(state);
    expect(newState.numbers).toEqual([5, 10, 15, 20]);
    expect(newState.history).toEqual([]);
    expect(newState.moveCount).toBe(0);
    expect(newState.selectedIndices).toEqual([]);
    expect(newState.selectedOperation).toBe(null);
    expect(newState.status).toBe('playing');
    expect(newState.message).toBe(null);
  });

  it('should preserve difficulty, mode, and target', () => {
    const state: GameState = {
      difficulty: 'hard',
      mode: 'timer',
      target: 150,
      numbers: [50],
      initialNumbers: [5, 10, 15, 20, 25, 30],
      selectedIndices: [],
      selectedOperation: null,
      history: [],
      status: 'won',
      moveCount: 5,
      message: null,
      timeRemaining: 30,
      timerStartedAt: Date.now(),
    };

    const newState = restartPuzzle(state);
    expect(newState.difficulty).toBe('hard');
    expect(newState.mode).toBe('timer');
    expect(newState.target).toBe(150);
    expect(newState.timeRemaining).toBe(30); // Timer state preserved
  });
});
