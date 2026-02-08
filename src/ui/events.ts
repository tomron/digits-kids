import { GameState, Difficulty, Operation, GameMode, DIFFICULTY_CONFIGS } from '../game/types';
import { executeMove, undoMove, restartPuzzle } from '../game/engine';
import { generatePuzzle, generateChallengePuzzle } from '../game/generator';
import { render, createExplanationOverlay } from './renderer';
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
    if (state.mode === 'challenge' && state.challengeStats) {
      // In challenge mode, increment solved count and generate new puzzle
      const newStats = {
        puzzlesSolved: state.challengeStats.puzzlesSolved + 1,
        puzzlesSkipped: state.challengeStats.puzzlesSkipped,
      };
      const newState = generateChallengePuzzle({ ...state, challengeStats: newStats });
      state = newState;
      render(state, container);
      bindEvents();
      launchConfetti();
    } else {
      stopTimer();
      launchConfetti();
    }
  }

  if (state.status === 'timeout') {
    stopTimer();
  }

  // Start or update timer for timer and challenge modes
  if ((state.mode === 'timer' || state.mode === 'challenge') && state.status === 'playing') {
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

  document.getElementById('skip')?.addEventListener('click', () => {
    if (state.mode === 'challenge' && state.challengeStats) {
      const newStats = {
        puzzlesSolved: state.challengeStats.puzzlesSolved,
        puzzlesSkipped: state.challengeStats.puzzlesSkipped + 1,
      };
      update(generateChallengePuzzle({ ...state, challengeStats: newStats }));
    }
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

  document.getElementById('challenge-play-again')?.addEventListener('click', () => {
    update(generatePuzzle(state.difficulty, state.mode));
  });

  document.getElementById('challenge-share')?.addEventListener('click', async () => {
    await handleShare();
  });

  document.getElementById('explain')?.addEventListener('click', () => {
    handleExplain();
  });

  document.getElementById('explanation-close')?.addEventListener('click', () => {
    closeExplanation();
  });
}

function handleExplain(): void {
  // Remove existing explanation overlay if present
  const existingOverlay = document.getElementById('explanation-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create and show explanation overlay
  const overlay = createExplanationOverlay(state.solution, state.target, state.initialNumbers);
  container.appendChild(overlay);

  // Re-bind the close button
  document.getElementById('explanation-close')?.addEventListener('click', () => {
    closeExplanation();
  });
}

function closeExplanation(): void {
  const overlay = document.getElementById('explanation-overlay');
  if (overlay) {
    overlay.remove();
  }
}

async function handleShare(): Promise<void> {
  const overlay = document.querySelector('.challenge-results-overlay') as HTMLElement;
  if (!overlay) return;

  const difficulty = overlay.dataset.difficulty as Difficulty;
  const solvedElement = overlay.querySelector('.stat-value');
  const skippedElement = overlay.querySelectorAll('.stat-value')[1];

  if (!solvedElement || !skippedElement) return;

  const solved = solvedElement.textContent || '0';
  const skipped = skippedElement.textContent || '0';
  const difficultyLabel = DIFFICULTY_CONFIGS[difficulty].label;

  const shareText = `Digits for Kids Challenge (${difficultyLabel})
✅ Solved: ${solved}
⏭️ Skipped: ${skipped}

Play at https://tomron.github.io/digits-kids/`;

  const shareButton = document.getElementById('challenge-share');
  if (!shareButton) return;

  // Try Web Share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        text: shareText,
      });
      return;
    } catch (err) {
      // User cancelled or share failed, fall through to clipboard
      if ((err as Error).name === 'AbortError') {
        return; // User cancelled, don't show "Copied!"
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    const originalText = shareButton.textContent;
    shareButton.textContent = 'Copied!';
    shareButton.classList.add('copied');

    setTimeout(() => {
      shareButton.textContent = originalText;
      shareButton.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
  }
}

function startTimer(): void {
  stopTimer(); // Clear any existing timer

  timerInterval = window.setInterval(() => {
    if ((state.mode !== 'timer' && state.mode !== 'challenge') || state.status !== 'playing' || state.timerStartedAt === null) {
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

      // Update challenge stats if in challenge mode
      if (state.mode === 'challenge' && state.challengeStats) {
        const statsText = timerDisplay.querySelector('.challenge-stats');
        if (statsText) {
          statsText.textContent = ` | Solved: ${state.challengeStats.puzzlesSolved}`;
        }
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
