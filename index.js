const ROW_COUNT = 100;
const COLUMN_COUNT = 150;
const CELL_SIZE = 5;

let state, canvas;

document.addEventListener('DOMContentLoaded', () => init());

function init() {
  canvas = document.getElementById('root');
  canvas.height = ROW_COUNT * CELL_SIZE;
  canvas.width = COLUMN_COUNT * CELL_SIZE;

  canvas.addEventListener('mousedown', handleMousedown);
  canvas.addEventListener('mouseup', handleMouseup);
  canvas.addEventListener('mousemove', handleMousemove);

  state = getInitialState(true);

  paintGrid();

  render();
}

function getInitialState(randomize = false) {
  return {
    grid: Array.from({ length: ROW_COUNT }).map((_, i) => (
      Array.from({ length: COLUMN_COUNT }).map((_, j) => ({ i, j, alive: Math.random() < (randomize ? currentRandomizationValue() : 0) }))
    )),
    running: false,
    mouseDown: false,
    generations: 0,
  };
}

function currentRandomizationValue() {
  return document.getElementById('randomizer-number').value / 100;
}

function handleMousedown(event) {
  state.mouseDown = true;
  handleMousemove(event);
}

function handleMouseup() {
  state.mouseDown = false;
}

function handleMousemove(event) {
  if (state.mouseDown) {
    const cells = cellsFromMouseEvent(event);
    cells.forEach(cell => cell.alive = true);
  }
}

function cellsFromMouseEvent(event) {
  const column = Math.floor(event.offsetX / CELL_SIZE);
  const row = Math.floor(event.offsetY / CELL_SIZE);

  return [
    getCell(row, column),
    getCell(row + 1, column),
    getCell(row + 1, column + 1),
    getCell(row, column + 1)
  ];
}

function startRun() {
  state.running = true;
  state.startTime = Date.now();
}

function stopRun() {
  state.running = false;
}

function reset() {
  const randomize = document.getElementById('randomize').checked;
  state = getInitialState(randomize);
  paintGrid()
}

function onRandomizeChange(event) {
  const randomizerFields = document.getElementById('randomizerFields');
  if (event.target.checked) {
    randomizerFields.removeClass('hidden');
  } else {
    randomizerFields.addClass('hidden');
  }
}

function render() {
  if (state.running) {
    tick();
    state.generations += 1;
  }

  updateStatusText();
  updateGenerationCount();
  updateFramesPerSecond();

  requestAnimationFrame(() => render());
}

function updateStatusText() {
  const statusText = document.getElementById('status');
  statusText.innerText = state.running ? 'Running' : 'Stopped';
}

function updateGenerationCount() {
  const generationText = document.getElementById('generations');
  generationText.innerText = state.generations;
}

function updateFramesPerSecond() {
  const fpsText = document.getElementById('frames-per-second');
  fpsText.innerText =
    state.running ? Math.floor(state.generations / ((Date.now() - state.startTime) / 1000))
                  : 0;
}

function paintGrid() {
  state.grid.forEach(row => (
    row.forEach((cell) => paintCell(cell.i, cell.j, cell.alive))
  ));
}

function paintCell(i, j, alive) {
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = alive ? 'black' : 'white';
  ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function tick() {
  state.grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const liveNeighbors = liveNeighborCount(rowIndex, columnIndex);
      cell.newAlive = cell.alive ? [2, 3].includes(liveNeighbors)
                                 : liveNeighbors === 3;
    });
  });

  state.grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.newAlive !== cell.alive) {
        paintCell(cell.i, cell.j, cell.newAlive);
        cell.alive = cell.newAlive;
      }
      cell.newAlive = undefined;
    });
  });
}

function getCell(i, j) {
  const row = loopedIndex(i, state.grid.length)
  const column = loopedIndex(j, state.grid[row].length)

  return state.grid[row][column];
};

function loopedIndex(index, length) {
  if (index < 0) return index + length;
  if (index >= length) return index - length;
  return index;
}

function liveNeighborCount(i, j) {
  const neighbors = [
    getCell(i - 1, j - 1),
    getCell(i - 1, j),
    getCell(i - 1, j + 1),
    getCell(i, j - 1),
    getCell(i, j + 1),
    getCell(i + 1, j - 1),
    getCell(i + 1, j),
    getCell(i + 1, j + 1),
  ];
  return neighbors.filter(c => c && c.alive).length;
}
