"use strict";

(() => {
  const canvas = document.getElementById("game-canvas");
  const addPlayerButton = document.getElementById("add-player");
  const addObstacleButton = document.getElementById("add-obstacle");
  const runGameButton = document.getElementById("run-game");
  const gameStatus = document.getElementById("game-status");

  if (
    !(canvas instanceof HTMLCanvasElement) ||
    !(addPlayerButton instanceof HTMLButtonElement) ||
    !(addObstacleButton instanceof HTMLButtonElement) ||
    !(runGameButton instanceof HTMLButtonElement) ||
    !(gameStatus instanceof HTMLElement)
  ) {
    console.error("The game builder could not initialize.");
    return;
  }

  const context = canvas.getContext("2d");

  if (context === null) {
    console.error("The game canvas is not supported in this browser.");
    return;
  }

  const CELL_SIZE = 40;
  const COLUMNS = canvas.width / CELL_SIZE;
  const ROWS = canvas.height / CELL_SIZE;
  const BLOCK_PADDING = 4;

  const BOARD_COLOR = "#f0fdf4";
  const GRID_COLOR = "#dcfce7";
  const PLAYER_COLOR = "#2563eb";
  const PLAYER_BORDER = "#1d4ed8";
  const OBSTACLE_COLOR = "#dc2626";
  const OBSTACLE_BORDER = "#b91c1c";

  /** @typedef {{ x: number, y: number }} Cell */

  /** @type {Cell | null} */
  let player = null;

  /** @type {Cell[]} */
  let obstacles = [];

  const moves = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  };

  /**
   * @param {string} message
   * @returns {void}
   */
  function setStatus(message) {
    gameStatus.textContent = message;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  function isInsideBoard(x, y) {
    return x >= 0 && x < COLUMNS && y >= 0 && y < ROWS;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  function isObstacleAt(x, y) {
    return obstacles.some(
      (obstacle) => obstacle.x === x && obstacle.y === y
    );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  function isCellFree(x, y) {
    if (!isInsideBoard(x, y) || isObstacleAt(x, y)) {
      return false;
    }

    return !(player && player.x === x && player.y === y);
  }

  /**
   * @returns {Cell | null}
   */
  function findFreeCell() {
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLUMNS; x += 1) {
        if (isCellFree(x, y)) {
          return { x, y };
        }
      }
    }

    return null;
  }

  /**
   * @returns {void}
   */
  function drawBackground() {
    context.fillStyle = BOARD_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = GRID_COLOR;
    context.lineWidth = 1;

    for (let column = 0; column <= COLUMNS; column += 1) {
      const x = column * CELL_SIZE + 0.5;

      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }

    for (let row = 0; row <= ROWS; row += 1) {
      const y = row * CELL_SIZE + 0.5;

      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
  }

  /**
   * @param {Cell} cell
   * @param {string} fillColor
   * @param {string} borderColor
   * @returns {void}
   */
  function drawBlock(cell, fillColor, borderColor) {
    const x = cell.x * CELL_SIZE + BLOCK_PADDING;
    const y = cell.y * CELL_SIZE + BLOCK_PADDING;
    const size = CELL_SIZE - BLOCK_PADDING * 2;

    context.fillStyle = fillColor;
    context.fillRect(x, y, size, size);

    context.strokeStyle = borderColor;
    context.lineWidth = 3;
    context.strokeRect(x, y, size, size);
  }

  /**
   * @returns {void}
   */
  function render() {
    drawBackground();

    obstacles.forEach((obstacle) => {
      drawBlock(obstacle, OBSTACLE_COLOR, OBSTACLE_BORDER);
    });

    if (player) {
      drawBlock(player, PLAYER_COLOR, PLAYER_BORDER);
    }
  }

  /**
   * @returns {void}
   */
  function addPlayer() {
    if (player) {
      setStatus("The player is already on the board. Use the arrow keys to move it.");
      canvas.focus();
      return;
    }

    const startCell = findFreeCell();

    if (startCell === null) {
      setStatus("The board is full. Reset the page to start again.");
      return;
    }

    player = startCell;
    render();
    setStatus("Player added! Use the arrow keys to move the blue square.");
    canvas.focus();
  }

  /**
   * @returns {void}
   */
  function addObstacle() {
    const freeCell = findFreeCell();

    if (freeCell === null) {
      setStatus("There are no free spaces left for another obstacle.");
      return;
    }

    obstacles.push(freeCell);
    render();
    setStatus(
      `Obstacle added. There ${obstacles.length === 1 ? "is" : "are"} ` +
      `${obstacles.length} obstacle${obstacles.length === 1 ? "" : "s"} on the board.`
    );
  }

  /**
   * @param {number} deltaX
   * @param {number} deltaY
   * @returns {void}
   */
  function movePlayer(deltaX, deltaY) {
    if (!player) {
      setStatus("Add a player block before moving.");
      return;
    }

    const nextX = player.x + deltaX;
    const nextY = player.y + deltaY;

    if (!isInsideBoard(nextX, nextY)) {
      setStatus("The player cannot leave the board.");
      return;
    }

    if (isObstacleAt(nextX, nextY)) {
      setStatus("Blocked! An obstacle is in the way.");
      return;
    }

    player = { x: nextX, y: nextY };
    render();
    setStatus(`Player moved to column ${nextX + 1}, row ${nextY + 1}.`);
  }

  addPlayerButton.addEventListener("click", addPlayer);
  addObstacleButton.addEventListener("click", addObstacle);

  runGameButton.addEventListener("click", () => {
    if (!player) {
      setStatus("Add a player block first, then run the game.");
      return;
    }

    canvas.focus();
    setStatus("Game running! Use the arrow keys to move the blue square.");
  });

  window.addEventListener("keydown", (event) => {
    const move = moves[event.key];

    if (!move || !player) {
      return;
    }

    event.preventDefault();
    movePlayer(move[0], move[1]);
  });

  render();
})();
