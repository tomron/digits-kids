import { GameState, Difficulty, Operation, GameMode } from '../game/types';
import { executeMove, undoMove, restartPuzzle } from '../game/engine';
import { generatePuzzle } from '../game/generator';
import { render } from './renderer';
import { launchConfetti } from './animations';

let state: GameState;
let container: HTMLElement;
let timerInterval: number | null = null;

export function initGame(el: HTMLElement): void {
  container = el;
  state = generatePuzzle('easy');
  renderAndBind();
}

function renderAndBind(): void {
  render(state, container);
  bindEvents();

  if (state.status === 'won') {
    stopTimer();
    launchConfetti();
  }

  if (state.status === 'timeout') {
    stopTimer();
  }

  // Start or update timer for timer mode
  if (state.mode === 'timer' && state.status === 'playing') {
    startTimer();
  } else {
    stopTimer();
  }
}

function update(newState: GameState): void {
  state = newState;
  renderAndBind();
}

function bindEvents(): void {
  // Mode buttons
  container.querySelectorAll<HTMLButtonElement>('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode as GameMode;
      update(generatePuzzle(state.difficulty, mode));
    });
  });

  // Difficulty buttons
  container.querySelectorAll<HTMLButtonElement>('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const difficulty = btn.dataset.difficulty as Difficulty;
      update(generatePuzzle(difficulty, state.mode));
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
    update(generatePuzzle(state.difficulty, state.mode));
  });

  document.getElementById('win-new-puzzle')?.addEventListener('click', () => {
    update(generatePuzzle(state.difficulty, state.mode));
  });

  document.getElementById('timeout-new-puzzle')?.addEventListener('click', () => {
    update(generatePuzzle(state.difficulty, state.mode));
  });
}

function startTimer(): void {
  stopTimer(); // Clear any existing timer

  timerInterval = window.setInterval(() => {
    if (state.mode !== 'timer' || state.status !== 'playing' || state.timerStartedAt === null) {
      stopTimer();
      return;
    }

    const elapsed = Math.floor((Date.now() - state.timerStartedAt) / 1000);
    const timeRemaining = Math.max(0, 60 - elapsed);

    if (timeRemaining === 0) {
      update({ ...state, status: 'timeout', timeRemaining: 0 });
      return;
    }

    // Update timer display without full re-render
    state = { ...state, timeRemaining };
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const timerText = timerDisplay.querySelector('.timer-text');
      if (timerText) {
        timerText.textContent = timeText;
      }
    }
  }, 100);
}

function stopTimer(): void {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
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
