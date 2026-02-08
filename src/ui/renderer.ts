import { GameState, Difficulty, DIFFICULTY_CONFIGS, Operation, GameMode, SolutionStep } from '../game/types';

export function render(state: GameState, container: HTMLElement): void {
  container.innerHTML = '';

  container.appendChild(createHeader());
  container.appendChild(createModeSelector(state.mode));
  container.appendChild(createDifficultySelector(state.difficulty));
  container.appendChild(createTarget(state.target));
  if ((state.mode === 'timer' || state.mode === 'challenge') && state.timeRemaining !== null) {
    container.appendChild(createTimer(state.timeRemaining, state.mode === 'challenge' ? state.challengeStats : null));
  }
  container.appendChild(createNumberTiles(state));
  container.appendChild(createOperationButtons(state));
  container.appendChild(createMoveInfo(state));
  container.appendChild(createActionButtons(state.mode));

  if (state.message && state.status !== 'won' && state.status !== 'timeout') {
    container.appendChild(createMessage(state.message));
  }

  if (state.status === 'won') {
    container.appendChild(createWinOverlay(state.moveCount));
  }

  if (state.status === 'timeout') {
    if (state.mode === 'challenge' && state.challengeStats) {
      container.appendChild(createChallengeResultsOverlay(state.challengeStats, state.difficulty));
    } else {
      container.appendChild(createTimeoutOverlay());
    }
  }
}

function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'game-header';
  header.innerHTML = '<h1>Digits for Kids</h1>';
  return header;
}

function createModeSelector(current: GameMode): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'mode-selector';

  const modes: { id: GameMode; label: string }[] = [
    { id: 'classic', label: 'Classic' },
    { id: 'timer', label: 'Timer (60s)' },
    { id: 'challenge', label: 'Challenge' },
  ];

  for (const mode of modes) {
    const btn = document.createElement('button');
    btn.textContent = mode.label;
    btn.className = `mode-btn ${mode.id === current ? 'active' : ''}`;
    btn.dataset.mode = mode.id;
    wrapper.appendChild(btn);
  }

  return wrapper;
}

function createDifficultySelector(current: Difficulty): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'difficulty-selector';

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  for (const d of difficulties) {
    const btn = document.createElement('button');
    btn.textContent = DIFFICULTY_CONFIGS[d].label;
    btn.className = `difficulty-btn ${d === current ? 'active' : ''}`;
    btn.dataset.difficulty = d;
    wrapper.appendChild(btn);
  }

  return wrapper;
}

function createTarget(target: number): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'target-display';
  wrapper.innerHTML = `<span class="target-label">Target</span><span class="target-number">${target}</span>`;
  return wrapper;
}

function createTimer(timeRemaining: number, challengeStats: { puzzlesSolved: number; puzzlesSkipped: number } | null = null): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'timer-display';
  wrapper.id = 'timer-display';

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const timerSpan = document.createElement('span');
  timerSpan.className = 'timer-text';
  timerSpan.textContent = timeText;

  wrapper.appendChild(timerSpan);

  // Add stats for challenge mode
  if (challengeStats) {
    const statsSpan = document.createElement('span');
    statsSpan.className = 'challenge-stats';
    statsSpan.textContent = ` | Solved: ${challengeStats.puzzlesSolved}`;
    wrapper.appendChild(statsSpan);
  }

  return wrapper;
}

function createNumberTiles(state: GameState): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = `number-tiles ${state.difficulty === 'hard' ? 'hard-mode' : ''}`;

  for (let i = 0; i < state.numbers.length; i++) {
    const tile = document.createElement('button');
    tile.className = 'number-tile';
    tile.textContent = String(state.numbers[i]);
    tile.dataset.index = String(i);

    if (state.selectedIndices.includes(i)) {
      tile.classList.add('selected');
      if (state.selectedIndices[0] === i) tile.classList.add('first');
      if (state.selectedIndices[1] === i) tile.classList.add('second');
    }

    wrapper.appendChild(tile);
  }

  return wrapper;
}

function createOperationButtons(state: GameState): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'operation-buttons';

  const config = DIFFICULTY_CONFIGS[state.difficulty];
  const opLabels: Record<Operation, string> = {
    '+': '+',
    '-': '\u2212',
    '*': '\u00d7',
    '/': '\u00f7',
  };

  for (const op of config.operations) {
    const btn = document.createElement('button');
    btn.className = `op-btn op-${op === '+' ? 'add' : op === '-' ? 'sub' : op === '*' ? 'mul' : 'div'}`;
    btn.textContent = opLabels[op];
    btn.dataset.operation = op;

    if (state.selectedOperation === op) {
      btn.classList.add('selected');
    }

    wrapper.appendChild(btn);
  }

  return wrapper;
}

function createMoveInfo(state: GameState): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'move-info';

  // Show equation preview
  if (state.selectedIndices.length === 2 && state.selectedOperation) {
    const a = state.numbers[state.selectedIndices[0]];
    const b = state.numbers[state.selectedIndices[1]];
    const opLabels: Record<Operation, string> = {
      '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7',
    };
    wrapper.innerHTML = `<span class="preview">${a} ${opLabels[state.selectedOperation]} ${b}</span>`;
  } else {
    wrapper.innerHTML = `<span class="moves">Moves: ${state.moveCount}</span>`;
  }

  return wrapper;
}

function createActionButtons(mode: GameMode): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'action-buttons';

  let actions: Array<{ id: string; label: string }>;

  if (mode === 'challenge') {
    actions = [
      { id: 'undo', label: 'Undo' },
      { id: 'skip', label: 'Skip' },
      { id: 'explain', label: 'Explain' },
      { id: 'new-puzzle', label: 'New Puzzle' },
    ];
  } else {
    actions = [
      { id: 'undo', label: 'Undo' },
      { id: 'restart', label: 'Restart' },
      { id: 'explain', label: 'Explain' },
      { id: 'new-puzzle', label: 'New Puzzle' },
    ];
  }

  for (const action of actions) {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.id = action.id;
    btn.textContent = action.label;
    wrapper.appendChild(btn);
  }

  return wrapper;
}

function createMessage(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'game-message';
  el.textContent = text;
  return el;
}

function createWinOverlay(moveCount: number): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'win-overlay';

  const content = document.createElement('div');
  content.className = 'win-content';

  const stars = document.createElement('div');
  stars.className = 'win-stars';
  stars.textContent = '\u{2B50} \u{2B50} \u{2B50}';

  const heading = document.createElement('h2');
  heading.textContent = 'You got it!';

  const paragraph = document.createElement('p');
  paragraph.textContent = `Solved in ${moveCount} move${moveCount !== 1 ? 's' : ''}!`;

  const button = document.createElement('button');
  button.className = 'action-btn win-new-puzzle';
  button.id = 'win-new-puzzle';
  button.textContent = 'Play Again';

  content.appendChild(stars);
  content.appendChild(heading);
  content.appendChild(paragraph);
  content.appendChild(button);
  overlay.appendChild(content);

  return overlay;
}

function createTimeoutOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'timeout-overlay';

  const content = document.createElement('div');
  content.className = 'timeout-content';

  const icon = document.createElement('div');
  icon.className = 'timeout-icon';
  icon.textContent = '\u{23F1}';

  const heading = document.createElement('h2');
  heading.textContent = 'Time\'s Up!';

  const paragraph = document.createElement('p');
  paragraph.textContent = 'Try again with a new puzzle!';

  const button = document.createElement('button');
  button.className = 'action-btn timeout-new-puzzle';
  button.id = 'timeout-new-puzzle';
  button.textContent = 'New Puzzle';

  content.appendChild(icon);
  content.appendChild(heading);
  content.appendChild(paragraph);
  content.appendChild(button);
  overlay.appendChild(content);

  return overlay;
}

function createChallengeResultsOverlay(stats: { puzzlesSolved: number; puzzlesSkipped: number }, difficulty: Difficulty): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'challenge-results-overlay';
  overlay.dataset.difficulty = difficulty;

  const content = document.createElement('div');
  content.className = 'challenge-results-content';

  const icon = document.createElement('div');
  icon.className = 'challenge-icon';
  icon.textContent = '\u{1F389}';

  const heading = document.createElement('h2');
  heading.textContent = 'Time\'s Up! Great Job!';

  const statsBox = document.createElement('div');
  statsBox.className = 'challenge-stats-box';

  const solvedLine = document.createElement('div');
  solvedLine.className = 'stat-line';
  const solvedLabel = document.createElement('span');
  solvedLabel.className = 'stat-label';
  solvedLabel.textContent = 'Puzzles Solved:';
  const solvedValue = document.createElement('span');
  solvedValue.className = 'stat-value';
  solvedValue.textContent = String(stats.puzzlesSolved);
  solvedLine.appendChild(solvedLabel);
  solvedLine.appendChild(document.createTextNode(' '));
  solvedLine.appendChild(solvedValue);

  const skippedLine = document.createElement('div');
  skippedLine.className = 'stat-line';
  const skippedLabel = document.createElement('span');
  skippedLabel.className = 'stat-label';
  skippedLabel.textContent = 'Puzzles Skipped:';
  const skippedValue = document.createElement('span');
  skippedValue.className = 'stat-value';
  skippedValue.textContent = String(stats.puzzlesSkipped);
  skippedLine.appendChild(skippedLabel);
  skippedLine.appendChild(document.createTextNode(' '));
  skippedLine.appendChild(skippedValue);

  statsBox.appendChild(solvedLine);
  statsBox.appendChild(skippedLine);

  const buttonWrapper = document.createElement('div');
  buttonWrapper.className = 'challenge-buttons';

  const playAgainButton = document.createElement('button');
  playAgainButton.className = 'action-btn challenge-play-again';
  playAgainButton.id = 'challenge-play-again';
  playAgainButton.textContent = 'Play Again';

  const shareButton = document.createElement('button');
  shareButton.className = 'action-btn challenge-share';
  shareButton.id = 'challenge-share';
  shareButton.textContent = 'Share';

  buttonWrapper.appendChild(playAgainButton);
  buttonWrapper.appendChild(shareButton);

  content.appendChild(icon);
  content.appendChild(heading);
  content.appendChild(statsBox);
  content.appendChild(buttonWrapper);
  overlay.appendChild(content);

  return overlay;
}

export function createExplanationOverlay(solution: SolutionStep[], target: number, initialNumbers: number[]): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'explanation-overlay';
  overlay.id = 'explanation-overlay';

  const content = document.createElement('div');
  content.className = 'explanation-content';

  const icon = document.createElement('div');
  icon.className = 'explanation-icon';
  icon.textContent = '\u{1F4A1}';

  const heading = document.createElement('h2');
  heading.textContent = 'How to Solve This Puzzle';

  const intro = document.createElement('p');
  intro.className = 'explanation-intro';
  intro.textContent = `Starting with: ${initialNumbers.join(', ')}`;

  const stepsBox = document.createElement('div');
  stepsBox.className = 'explanation-steps';

  const opLabels: Record<Operation, string> = {
    '+': '+',
    '-': '\u2212',
    '*': '\u00d7',
    '/': '\u00f7',
  };

  for (let i = 0; i < solution.length; i++) {
    const step = solution[i];
    const stepDiv = document.createElement('div');
    stepDiv.className = 'explanation-step';

    const stepNumber = document.createElement('span');
    stepNumber.className = 'step-number';
    stepNumber.textContent = `Step ${i + 1}:`;

    const stepText = document.createElement('span');
    stepText.className = 'step-text';
    stepText.textContent = `${step.operand1} ${opLabels[step.operation]} ${step.operand2} = ${step.result}`;

    stepDiv.appendChild(stepNumber);
    stepDiv.appendChild(stepText);
    stepsBox.appendChild(stepDiv);
  }

  const targetInfo = document.createElement('p');
  targetInfo.className = 'explanation-target';
  targetInfo.textContent = `The result ${solution[solution.length - 1]?.result || target} is the target!`;

  const closeButton = document.createElement('button');
  closeButton.className = 'action-btn explanation-close';
  closeButton.id = 'explanation-close';
  closeButton.textContent = 'Got It!';

  content.appendChild(icon);
  content.appendChild(heading);
  content.appendChild(intro);
  content.appendChild(stepsBox);
  content.appendChild(targetInfo);
  content.appendChild(closeButton);
  overlay.appendChild(content);

  return overlay;
}
