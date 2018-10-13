const ROW_COUNT = 100;
const COLUMN_COUNT = 150;
const CELL_SIZE = 5;

let state;

document.addEventListener('DOMContentLoaded', () => init());

function init() {
  const canvas = document.getElementById('root');
  canvas.height = ROW_COUNT * CELL_SIZE;
  canvas.width = COLUMN_COUNT * CELL_SIZE;

  canvas.addEventListener('mousedown', handleMousedown);
  canvas.addEventListener('mouseup', handleMouseup);
  canvas.addEventListener('mousemove', handleMousemove);

  state = getInitialState();

  requestAnimationFrame(() => render(canvas));
}

function getInitialState(randomize = false) {
  return {
    grid: Array.from({ length: ROW_COUNT }).map((_, i) => (
      Array.from({ length: COLUMN_COUNT }).map((_, j) => ({ i, j, alive: Math.random() < (randomize ? 0.1 : 0) }))
    )),
    running: false,
    mouseDown: false,
    generations: 0,
  };
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
}

function stopRun() {
  state.running = false;
}

function reset() {
  const randomize = document.getElementById('randomize').checked;
  state = getInitialState(randomize);
}

function render(canvas) {
  paintGrid(canvas);

  if (state.running) {
    state.grid = tick();
    state.generations += 1;
  }

  updateStatusText();
  updateGenerationCount();

  requestAnimationFrame(() => render(canvas));
}

function updateStatusText() {
  const statusText = document.getElementById('status');
  statusText.innerText = state.running ? 'Running' : 'Stopped';
}

function updateGenerationCount() {
  const generationText = document.getElementById('generations');
  generationText.innerText = state.generations;
}

function paintGrid(canvas) {
  const ctx = canvas.getContext('2d');

  state.grid.forEach(row => (
    row.forEach((cell) => {
      ctx.fillStyle = cell.alive ? 'black' : 'white';
      ctx.fillRect(cell.j * CELL_SIZE, cell.i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    })
  ));
}

function tick() {
  return state.grid.map((row, rowIndex) => (
    row.map((cell, columnIndex) => {
      const liveNeighbors = liveNeighborCount(rowIndex, columnIndex);
      return {
        ...cell,
        alive: cell.alive ? [2, 3].includes(liveNeighbors)
                          : liveNeighbors === 3
      };
    })
  ));
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
