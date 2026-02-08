import { GameState, Operation, HistoryEntry } from './types';

export function applyOperation(op: Operation, a: number, b: number): number | null {
  switch (op) {
    case '+': return a + b;
    case '-': return a > b ? a - b : null;
    case '*': return a * b;
    case '/': return b !== 0 && a % b === 0 ? a / b : null;
  }
}

export function isValidOperation(op: Operation, a: number, b: number): boolean {
  return applyOperation(op, a, b) !== null;
}

export function executeMove(state: GameState): GameState {
  if (state.selectedIndices.length !== 2 || state.selectedOperation === null) {
    return state;
  }

  const [i, j] = state.selectedIndices;
  const a = state.numbers[i];
  const b = state.numbers[j];
  const op = state.selectedOperation;

  // Try the operation in the selected order
  let result = applyOperation(op, a, b);
  let operand1 = a;
  let operand2 = b;

  // For non-commutative operations (- and /), try both orderings
  if (result === null && (op === '-' || op === '/')) {
    result = applyOperation(op, b, a);
    if (result !== null) {
      operand1 = b;
      operand2 = a;
    }
  }

  if (result === null) {
    return {
      ...state,
      selectedIndices: [],
      selectedOperation: null,
      message: 'That operation doesn\'t work! Try another one.',
    };
  }

  const historyEntry: HistoryEntry = {
    numbers: [...state.numbers],
    operand1,
    operand2,
    operation: op,
    result,
  };

  // Remove the two used numbers and add the result
  const newNumbers = state.numbers.filter((_, idx) => idx !== i && idx !== j);
  newNumbers.push(result);
  // Sort numbers in ascending order for better readability
  newNumbers.sort((a, b) => a - b);

  const won = newNumbers.includes(state.target);

  return {
    ...state,
    numbers: newNumbers,
    selectedIndices: [],
    selectedOperation: null,
    history: [...state.history, historyEntry],
    moveCount: state.moveCount + 1,
    status: won ? 'won' : 'playing',
    message: won ? null : `${operand1} ${op} ${operand2} = ${result}`,
  };
}

export function undoMove(state: GameState): GameState {
  if (state.history.length === 0) return state;

  const lastEntry = state.history[state.history.length - 1];

  return {
    ...state,
    numbers: lastEntry.numbers,
    history: state.history.slice(0, -1),
    moveCount: state.moveCount - 1,
    selectedIndices: [],
    selectedOperation: null,
    status: 'playing',
    message: null,
  };
}

export function restartPuzzle(state: GameState): GameState {
  return {
    ...state,
    numbers: [...state.initialNumbers],
    history: [],
    moveCount: 0,
    selectedIndices: [],
    selectedOperation: null,
    status: 'playing',
    message: null,
  };
}
