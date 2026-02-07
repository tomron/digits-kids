import { GameState, Difficulty, Operation } from '../game/types';
import { executeMove, undoMove, restartPuzzle } from '../game/engine';
import { generatePuzzle } from '../game/generator';
import { render } from './renderer';
import { launchConfetti } from './animations';

let state: GameState;
let container: HTMLElement;

export function initGame(el: HTMLElement): void {
  container = el;
  state = generatePuzzle('easy');
  renderAndBind();
}

function renderAndBind(): void {
  render(state, container);
  bindEvents();

  if (state.status === 'won') {
    launchConfetti();
  }
}

function update(newState: GameState): void {
  state = newState;
  renderAndBind();
}

function bindEvents(): void {
  // Difficulty buttons
  container.querySelectorAll<HTMLButtonElement>('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const difficulty = btn.dataset.difficulty as Difficulty;
      update(generatePuzzle(difficulty));
    });
  });

  // Number tiles
  container.querySelectorAll<HTMLButtonElement>('.number-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.status === 'won') return;
      const index = parseInt(btn.dataset.index!, 10);
      handleNumberClick(index);
    });
  });

  // Operation buttons
  container.querySelectorAll<HTMLButtonElement>('.op-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.status === 'won') return;
      const op = btn.dataset.operation as Operation;
      handleOperationClick(op);
    });
  });

  // Action buttons
  document.getElementById('undo')?.addEventListener('click', () => {
    update(undoMove(state));
  });

  document.getElementById('restart')?.addEventListener('click', () => {
    update(restartPuzzle(state));
  });

  document.getElementById('new-puzzle')?.addEventListener('click', () => {
    update(generatePuzzle(state.difficulty));
  });

  document.getElementById('win-new-puzzle')?.addEventListener('click', () => {
    update(generatePuzzle(state.difficulty));
  });
}

function handleNumberClick(index: number): void {
  const selected = [...state.selectedIndices];

  // Deselect if already selected
  const existingPos = selected.indexOf(index);
  if (existingPos !== -1) {
    selected.splice(existingPos, 1);
    update({ ...state, selectedIndices: selected, message: null });
    return;
  }

  if (selected.length === 0) {
    // First number
    update({ ...state, selectedIndices: [index], message: null });
  } else if (selected.length === 1) {
    // Second number selected
    const newState = { ...state, selectedIndices: [selected[0], index], message: null };

    if (newState.selectedOperation !== null) {
      // Both numbers + operation selected → auto-execute
      update(executeMove(newState));
    } else {
      update(newState);
    }
  } else {
    // Replace second selection
    update({ ...state, selectedIndices: [selected[0], index], message: null });
  }
}

function handleOperationClick(op: Operation): void {
  // Deselect if same operation
  if (state.selectedOperation === op) {
    update({ ...state, selectedOperation: null, message: null });
    return;
  }

  const newState = { ...state, selectedOperation: op, message: null };

  if (newState.selectedIndices.length === 2) {
    // Both numbers already selected + operation → auto-execute
    update(executeMove(newState));
  } else {
    update(newState);
  }
}
