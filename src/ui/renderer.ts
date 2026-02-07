import { GameState, Difficulty, DIFFICULTY_CONFIGS, Operation } from '../game/types';

export function render(state: GameState, container: HTMLElement): void {
  container.innerHTML = '';

  container.appendChild(createHeader());
  container.appendChild(createDifficultySelector(state.difficulty));
  container.appendChild(createTarget(state.target));
  container.appendChild(createNumberTiles(state));
  container.appendChild(createOperationButtons(state));
  container.appendChild(createMoveInfo(state));
  container.appendChild(createActionButtons());

  if (state.message && state.status !== 'won') {
    container.appendChild(createMessage(state.message));
  }

  if (state.status === 'won') {
    container.appendChild(createWinOverlay(state.moveCount));
  }
}

function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'game-header';
  header.innerHTML = '<h1>Digits for Kids</h1>';
  return header;
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

function createNumberTiles(state: GameState): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'number-tiles';

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
  overlay.innerHTML = `
    <div class="win-content">
      <div class="win-stars">&#11088; &#11088; &#11088;</div>
      <h2>You got it!</h2>
      <p>Solved in ${moveCount} move${moveCount !== 1 ? 's' : ''}!</p>
      <button class="action-btn win-new-puzzle" id="win-new-puzzle">Play Again</button>
    </div>
  `;
  return overlay;
}
