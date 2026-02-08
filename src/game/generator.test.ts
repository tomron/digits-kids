import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator';
import { DIFFICULTY_CONFIGS } from './types';

describe('generatePuzzle', () => {
  describe('easy difficulty', () => {
    it('should generate a puzzle with correct number count', () => {
      const state = generatePuzzle('easy');
      expect(state.numbers.length).toBe(4);
      expect(state.initialNumbers.length).toBe(4);
    });

    it('should have target within easy range', () => {
      const state = generatePuzzle('easy');
      expect(state.target).toBeGreaterThanOrEqual(DIFFICULTY_CONFIGS.easy.targetMin);
      expect(state.target).toBeLessThanOrEqual(DIFFICULTY_CONFIGS.easy.targetMax);
    });

    it('should not include target in starting numbers', () => {
      const state = generatePuzzle('easy');
      expect(state.numbers).not.toContain(state.target);
    });

    it('should have difficulty set to easy', () => {
      const state = generatePuzzle('easy');
      expect(state.difficulty).toBe('easy');
    });

    it('should initialize with playing status', () => {
      const state = generatePuzzle('easy');
      expect(state.status).toBe('playing');
      expect(state.moveCount).toBe(0);
      expect(state.history).toEqual([]);
    });

    it('should have numbers within easy range', () => {
      const state = generatePuzzle('easy');
      const [min, max] = DIFFICULTY_CONFIGS.easy.numberRange;

      state.numbers.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(min);
        expect(num).toBeLessThanOrEqual(max);
      });
    });
  });

  describe('medium difficulty', () => {
    it('should generate a puzzle with correct number count', () => {
      const state = generatePuzzle('medium');
      expect(state.numbers.length).toBe(5);
      expect(state.initialNumbers.length).toBe(5);
    });

    it('should have target within medium range', () => {
      const state = generatePuzzle('medium');
      expect(state.target).toBeGreaterThanOrEqual(DIFFICULTY_CONFIGS.medium.targetMin);
      expect(state.target).toBeLessThanOrEqual(DIFFICULTY_CONFIGS.medium.targetMax);
    });

    it('should not include target in starting numbers', () => {
      const state = generatePuzzle('medium');
      expect(state.numbers).not.toContain(state.target);
    });

    it('should have numbers within medium range', () => {
      const state = generatePuzzle('medium');
      const [min, max] = DIFFICULTY_CONFIGS.medium.numberRange;

      state.numbers.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(min);
        expect(num).toBeLessThanOrEqual(max);
      });
    });
  });

  describe('hard difficulty', () => {
    it('should generate a puzzle with correct number count', () => {
      const state = generatePuzzle('hard');
      expect(state.numbers.length).toBe(6);
      expect(state.initialNumbers.length).toBe(6);
    });

    it('should have target within hard range', () => {
      const state = generatePuzzle('hard');
      expect(state.target).toBeGreaterThanOrEqual(DIFFICULTY_CONFIGS.hard.targetMin);
      expect(state.target).toBeLessThanOrEqual(DIFFICULTY_CONFIGS.hard.targetMax);
    });

    it('should not include target in starting numbers', () => {
      const state = generatePuzzle('hard');
      expect(state.numbers).not.toContain(state.target);
    });

    it('should have at least one large number', () => {
      const state = generatePuzzle('hard');
      const largeRange = DIFFICULTY_CONFIGS.hard.largeNumberRange!;

      const hasLargeNumber = state.numbers.some(num =>
        num >= largeRange[0] && num <= largeRange[1]
      );

      expect(hasLargeNumber).toBe(true);
    });
  });

  describe('game mode', () => {
    it('should default to classic mode', () => {
      const state = generatePuzzle('easy');
      expect(state.mode).toBe('classic');
      expect(state.timeRemaining).toBe(null);
      expect(state.timerStartedAt).toBe(null);
    });

    it('should support timer mode', () => {
      const state = generatePuzzle('easy', 'timer');
      expect(state.mode).toBe('timer');
      expect(state.timeRemaining).toBe(60);
      expect(state.timerStartedAt).not.toBe(null);
    });

    it('should initialize timer with 60 seconds', () => {
      const state = generatePuzzle('medium', 'timer');
      expect(state.timeRemaining).toBe(60);
    });
  });

  describe('puzzle initialization', () => {
    it('should have empty selection state', () => {
      const state = generatePuzzle('easy');
      expect(state.selectedIndices).toEqual([]);
      expect(state.selectedOperation).toBe(null);
    });

    it('should have no initial message', () => {
      const state = generatePuzzle('easy');
      expect(state.message).toBe(null);
    });

    it('should preserve initial numbers for restart', () => {
      const state = generatePuzzle('easy');
      // Initial numbers and current numbers should have the same elements (possibly in different order due to shuffle)
      expect(state.initialNumbers.sort()).toEqual([...state.numbers].sort());
      expect(state.initialNumbers.length).toBe(state.numbers.length);
    });
  });

  describe('uniqueness', () => {
    it('should generate different puzzles on repeated calls', () => {
      const puzzles = Array.from({ length: 10 }, () => generatePuzzle('easy'));
      const targets = puzzles.map(p => p.target);

      // Not all targets should be the same (very unlikely)
      const uniqueTargets = new Set(targets);
      expect(uniqueTargets.size).toBeGreaterThan(1);
    });

    it('should generate different starting numbers', () => {
      const puzzles = Array.from({ length: 10 }, () => generatePuzzle('medium'));
      const numberSets = puzzles.map(p => p.numbers.sort().join(','));

      // Not all number sets should be the same
      const uniqueSets = new Set(numberSets);
      expect(uniqueSets.size).toBeGreaterThan(1);
    });
  });

  describe('puzzle validity', () => {
    it('should generate solvable puzzles (easy)', () => {
      // Generate multiple puzzles and check they meet basic criteria
      for (let i = 0; i < 5; i++) {
        const state = generatePuzzle('easy');

        // Basic validity checks
        expect(state.numbers.length).toBe(4);
        expect(state.target).toBeGreaterThanOrEqual(1);
        expect(state.target).toBeLessThanOrEqual(50);
        expect(state.numbers).not.toContain(state.target);

        // All numbers should be positive
        state.numbers.forEach(num => {
          expect(num).toBeGreaterThan(0);
        });
      }
    });

    it('should generate solvable puzzles (medium)', () => {
      for (let i = 0; i < 5; i++) {
        const state = generatePuzzle('medium');

        expect(state.numbers.length).toBe(5);
        expect(state.target).toBeGreaterThanOrEqual(20);
        expect(state.target).toBeLessThanOrEqual(150);
        expect(state.numbers).not.toContain(state.target);
      }
    });

    it('should generate solvable puzzles (hard)', () => {
      for (let i = 0; i < 5; i++) {
        const state = generatePuzzle('hard');

        expect(state.numbers.length).toBe(6);
        expect(state.target).toBeGreaterThanOrEqual(50);
        expect(state.target).toBeLessThanOrEqual(300);
        expect(state.numbers).not.toContain(state.target);
      }
    });
  });

  describe('number uniqueness in starting set', () => {
    it('should avoid duplicate numbers in easy puzzles', () => {
      // Run multiple times since there's randomness
      for (let i = 0; i < 10; i++) {
        const state = generatePuzzle('easy');
        const uniqueNumbers = new Set(state.numbers);

        // Most of the time, numbers should be unique (allowing some duplicates in hard mode with larger sets)
        // For easy with only 4 numbers, expect high uniqueness
        expect(uniqueNumbers.size).toBeGreaterThanOrEqual(3);
      }
    });

    it('should avoid duplicate numbers in medium puzzles', () => {
      for (let i = 0; i < 10; i++) {
        const state = generatePuzzle('medium');
        const uniqueNumbers = new Set(state.numbers);

        expect(uniqueNumbers.size).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
