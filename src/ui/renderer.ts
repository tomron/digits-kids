import { GameState, Difficulty, DIFFICULTY_CONFIGS, Operation, GameMode } from '../game/types';

export function render(state: GameState, container: HTMLElement): void {
  container.innerHTML = '';

  container.appendChild(createHeader());
  container.appendChild(createModeSelector(state.mode));
  container.appendChild(createDifficultySelector(state.difficulty));
  container.appendChild(createTarget(state.target));
  if (state.mode === 'timer' && state.timeRemaining !== null) {
    container.appendChild(createTimer(state.timeRemaining));
  }
  container.appendChild(createNumberTiles(state));
  container.appendChild(createOperationButtons(state));
  container.appendChild(createMoveInfo(state));
  container.appendChild(createActionButtons());

  if (state.message && state.status !== 'won' && state.status !== 'timeout') {
    container.appendChild(createMessage(state.message));
  }

  if (state.status === 'won') {
    container.appendChild(createWinOverlay(state.moveCount));
  }

  if (state.status === 'timeout') {
    container.appendChild(createTimeoutOverlay());
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

function createTimer(timeRemaining: number): HTMLElement {
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

function createActionButtons(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'action-buttons';

  const actions = [
    { id: 'undo', label: 'Undo' },
    { id: 'restart', label: 'Restart' },
    { id: 'new-puzzle', label: 'New Puzzle' },
  ];

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
