import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { randomInt, pickRandom, shuffle } from './random';

describe('randomInt', () => {
  it('should return a number within the specified range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should work with same min and max', () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it('should work with negative numbers', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(-10, -1);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-1);
    }
  });

  it('should work with range spanning negative and positive', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(-5, 5);
      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(5);
    }
  });

  it('should cover entire range over many calls', () => {
    const results = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      results.add(randomInt(1, 5));
    }

    // With 1000 calls on range 1-5, we should see all values
    expect(results.size).toBe(5);
    expect(results.has(1)).toBe(true);
    expect(results.has(2)).toBe(true);
    expect(results.has(3)).toBe(true);
    expect(results.has(4)).toBe(true);
    expect(results.has(5)).toBe(true);
  });
});

describe('pickRandom', () => {
  it('should return an element from the array', () => {
    const arr = [1, 2, 3, 4, 5];
    for (let i = 0; i < 50; i++) {
      const result = pickRandom(arr);
      expect(arr).toContain(result);
    }
  });

  it('should return the only element in single-element array', () => {
    expect(pickRandom([42])).toBe(42);
  });

  it('should work with different types', () => {
    const strings = ['a', 'b', 'c'];
    const result = pickRandom(strings);
    expect(strings).toContain(result);
    expect(typeof result).toBe('string');
  });

  it('should work with objects', () => {
    const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = pickRandom(objects);
    expect(objects).toContain(result);
    expect(result).toHaveProperty('id');
  });

  it('should pick all elements over many calls', () => {
    const arr = [1, 2, 3];
    const results = new Set<number>();

    for (let i = 0; i < 100; i++) {
      results.add(pickRandom(arr));
    }

    // With 100 calls on 3 elements, we should see all
    expect(results.size).toBe(3);
  });
});

describe('shuffle', () => {
  it('should return array with same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.length).toBe(arr.length);
  });

  it('should return array with same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort()).toEqual(arr.sort());
  });

  it('should not modify original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffle(arr);
    expect(arr).toEqual(original);
  });

  it('should produce different orders on different calls', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const results = new Set<string>();

    for (let i = 0; i < 50; i++) {
      results.add(shuffle(arr).join(','));
    }

    // With 50 shuffles of 8 elements, we should see variety
    expect(results.size).toBeGreaterThan(10);
  });

  it('should handle single element array', () => {
    const arr = [42];
    const result = shuffle(arr);
    expect(result).toEqual([42]);
  });

  it('should handle empty array', () => {
    const arr: number[] = [];
    const result = shuffle(arr);
    expect(result).toEqual([]);
  });

  it('should handle two element array', () => {
    const arr = [1, 2];
    const results = new Set<string>();

    for (let i = 0; i < 50; i++) {
      results.add(shuffle(arr).join(','));
    }

    // Should see both [1,2] and [2,1]
    expect(results.size).toBe(2);
    expect(results.has('1,2')).toBe(true);
    expect(results.has('2,1')).toBe(true);
  });

  it('should work with different types', () => {
    const strings = ['a', 'b', 'c', 'd'];
    const result = shuffle(strings);
    expect(result.length).toBe(4);
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('random functions with mocked Math.random', () => {
  let originalRandom: () => number;

  beforeEach(() => {
    originalRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('randomInt should use Math.random correctly', () => {
    Math.random = vi.fn(() => 0.5);
    const result = randomInt(1, 10);
    expect(result).toBe(6); // 0.5 * 10 + 1 = 6
  });

  it('randomInt should handle edge case Math.random = 0', () => {
    Math.random = vi.fn(() => 0);
    const result = randomInt(1, 10);
    expect(result).toBe(1);
  });

  it('randomInt should handle edge case Math.random = 0.999...', () => {
    Math.random = vi.fn(() => 0.9999);
    const result = randomInt(1, 10);
    expect(result).toBe(10);
  });

  it('pickRandom should use Math.random correctly', () => {
    Math.random = vi.fn(() => 0);
    const result = pickRandom([1, 2, 3, 4, 5]);
    expect(result).toBe(1);
  });

  it('pickRandom should pick last element when random is near 1', () => {
    Math.random = vi.fn(() => 0.9999);
    const result = pickRandom([1, 2, 3, 4, 5]);
    expect(result).toBe(5);
  });
});
