
"use strict";

(() => {
  const canvas = document.getElementById("game-canvas");
  const scoreElement = document.getElementById("score");
  const statusElement = document.getElementById("game-status");
  const startButton = document.getElementById("start-game");
  const restartButton = document.getElementById("restart-game");
  const playAgainButton = document.getElementById("play-again");
  const startOverlay = document.getElementById("start-overlay");
  const winOverlay = document.getElementById("win-overlay");

  if (
    !(canvas instanceof HTMLCanvasElement) ||
    !(scoreElement instanceof HTMLElement) ||
    !(statusElement instanceof HTMLElement) ||
    !(startButton instanceof HTMLButtonElement) ||
    !(restartButton instanceof HTMLButtonElement) ||
    !(playAgainButton instanceof HTMLButtonElement) ||
    !(startOverlay instanceof HTMLElement) ||
    !(winOverlay instanceof HTMLElement)
  ) {
    console.error(
      "Jungle Treasure Adventure could not find all required page elements."
    );
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    statusElement.textContent =
      "This browser cannot display the game canvas.";
    return;
  }

  /** @typedef {{ x: number, y: number }} Position */

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const PLAYER_SIZE = 28;
  const PLAYER_SPEED = 210;
  const PLAYER_START = Object.freeze({ x: 65, y: 65 });

  /** @type {Position[]} */
  const STAR_STARTS = [
    { x: 270, y: 110 },
    { x: 500, y: 420 },
    { x: 735, y: 155 }
  ];

  /** @type {Position[]} */
  const LOGS = [
    { x: 355, y: 215 },
    { x: 590, y: 300 },
    { x: 170, y: 360 }
  ];

  const TREASURE = Object.freeze({ x: 860, y: 440 });

  const DIRECTIONS = Object.freeze({
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    w: [0, -1],
    s: [0, 1],
    a: [-1, 0],
    d: [1, 0]
  });

  const background = new Image();
  background.src = "../assets/jungle-treasure-adventure.png";

  /** @type {Position} */
  let player = { ...PLAYER_START };

  /** @type {Position[]} */
  let stars = STAR_STARTS.map((star) => ({ ...star }));

  /** @type {Set<string>} */
  const pressedKeys = new Set();

  /** @type {Map<number, string>} */
  const activePointers = new Map();

  let started = false;
  let won = false;
  let animationFrameId = 0;
  let previousFrameTime = 0;
  let blockedNoticeShown = false;

  function setStatus(message) {
    statusElement.textContent = message;
  }

  function updateScore() {
    scoreElement.textContent = String(STAR_STARTS.length - stars.length);
  }

  function roundedRect(x, y, width, height, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  }

  function drawFallbackBackground() {
    const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT);

    gradient.addColorStop(0, "#166534");
    gradient.addColorStop(0.5, "#15803d");
    gradient.addColorStop(1, "#14532d");

    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    for (let index = 0; index < 34; index += 1) {
      const x = (index * 173) % WIDTH;
      const y = (index * 97) % HEIGHT;

      context.globalAlpha = 0.18;
      context.fillStyle =
        index % 2 === 0 ? "#bbf7d0" : "#052e16";

      context.beginPath();
      context.ellipse(x, y, 35, 13, index, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
  }

  function drawBackground() {
    if (background.complete && background.naturalWidth > 0) {
      canvas.dataset.background = "image";
      context.drawImage(background, 0, 0, WIDTH, HEIGHT);
    } else {
      canvas.dataset.background = "fallback";
      drawFallbackBackground();
    }

    context.fillStyle = "rgba(4, 35, 18, 0.13)";
    context.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawStars() {
    stars.forEach((star) => {
      context.save();
      context.shadowColor = "#fde047";
      context.shadowBlur = 22;
      context.fillStyle = "#fde047";
      context.font = "34px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("★", star.x, star.y);
      context.restore();
    });
  }

  function drawLogs() {
    LOGS.forEach((log) => {
      roundedRect(
        log.x - 28,
        log.y - 13,
        56,
        26,
        12,
        "#713f12"
      );

      context.strokeStyle = "#d6a15d";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(log.x - 18, log.y - 5);
      context.lineTo(log.x + 18, log.y + 5);
      context.stroke();

      context.font = "22px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("🌿", log.x, log.y - 24);
    });
  }

  function drawTreasure() {
    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "48px Arial";
    context.fillText(
      stars.length === 0 ? "💎" : "🧰",
      TREASURE.x,
      TREASURE.y
    );
    context.restore();
  }

  function drawPlayer() {
    context.save();
    context.shadowColor = "rgba(0,0,0,.35)";
    context.shadowBlur = 8;
    context.fillStyle = "#fbbf24";
    context.beginPath();
    context.arc(
      player.x,
      player.y,
      PLAYER_SIZE / 2,
      0,
      Math.PI * 2
    );
    context.fill();

    context.shadowBlur = 0;
    context.font = "29px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("🧑‍🚀", player.x, player.y - 3);
    context.restore();
  }

  function render() {
    drawBackground();
    drawLogs();
    drawStars();
    drawTreasure();
    drawPlayer();

    // Expose useful state for reliable automated browser tests.
    canvas.dataset.playerX = String(player.x);
    canvas.dataset.playerY = String(player.y);
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function isBlocked(position) {
    return LOGS.some((log) => distance(position, log) < 38);
  }

  function stopMovement() {
    pressedKeys.clear();
    activePointers.clear();
  }

  function finishGame() {
    won = true;
    stopMovement();

    winOverlay.classList.remove("is-hidden");
    setStatus("Adventure complete! You found the treasure.");
  }

  function movePlayer(dx, dy) {
    if (!started || won) return false;

    const next = {
      x: Math.max(
        PLAYER_SIZE / 2,
        Math.min(WIDTH - PLAYER_SIZE / 2, player.x + dx)
      ),
      y: Math.max(
        PLAYER_SIZE / 2,
        Math.min(HEIGHT - PLAYER_SIZE / 2, player.y + dy)
      )
    };

    if (isBlocked(next)) {
      if (!blockedNoticeShown) {
        setStatus(
          "A jungle log is blocking the way. Try another path!"
        );
        blockedNoticeShown = true;
      }

      return false;
    }

    blockedNoticeShown = false;
    player = next;

    const remaining = stars.filter(
      (star) => distance(player, star) >= 30
    );

    const collected = stars.length - remaining.length;
    stars = remaining;

    if (collected > 0) {
      updateScore();

      setStatus(
        stars.length === 0
          ? "All stars collected! Find the treasure chest."
          : "Wonderful! You found a star. Keep exploring!"
      );
    }

    if (stars.length === 0 && distance(player, TREASURE) < 48) {
      finishGame();
    }

    render();
    return true;
  }

  function getMovementDirection() {
    let dx = 0;
    let dy = 0;

    pressedKeys.forEach((key) => {
      const direction = DIRECTIONS[key];

      if (!direction) return;

      dx += direction[0];
      dy += direction[1];
    });

    activePointers.forEach((directionName) => {
      const direction = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
      }[directionName];

      if (!direction) return;

      dx += direction[0];
      dy += direction[1];
    });

    if (dx === 0 && dy === 0) {
      return null;
    }

    // Normalization prevents diagonal movement from being faster.
    const magnitude = Math.hypot(dx, dy);

    return {
      x: dx / magnitude,
      y: dy / magnitude
    };
  }

  function gameLoop(timestamp) {
    if (!started || won) {
      animationFrameId = 0;
      return;
    }

    if (previousFrameTime === 0) {
      previousFrameTime = timestamp;
    }

    // Limit the time step to prevent large jumps after a paused tab.
    const elapsed = Math.min(
      (timestamp - previousFrameTime) / 1000,
      0.05
    );

    previousFrameTime = timestamp;

    const direction = getMovementDirection();

    if (direction) {
      const distanceToMove = PLAYER_SPEED * elapsed;

      movePlayer(
        direction.x * distanceToMove,
        direction.y * distanceToMove
      );
    }

    if (started && !won) {
      animationFrameId = window.requestAnimationFrame(gameLoop);
    } else {
      animationFrameId = 0;
    }
  }

  function startGame() {
    if (started && !won) return;

    started = true;
    previousFrameTime = 0;

    startOverlay.classList.add("is-hidden");
    canvas.focus();

    setStatus("Adventure started! Collect all three stars.");

    if (animationFrameId === 0) {
      animationFrameId = window.requestAnimationFrame(gameLoop);
    }
  }

  function resetGame() {
    if (animationFrameId !== 0) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    stopMovement();

    player = { ...PLAYER_START };
    stars = STAR_STARTS.map((star) => ({ ...star }));

    started = false;
    won = false;
    previousFrameTime = 0;
    blockedNoticeShown = false;

    updateScore();

    startOverlay.classList.remove("is-hidden");
    winOverlay.classList.add("is-hidden");

    setStatus("Press Start Adventure when you're ready.");

    render();
  }

  function normalizeKey(key) {
    return key.length === 1 ? key.toLowerCase() : key;
  }

  window.addEventListener("keydown", (event) => {
    const key = normalizeKey(event.key);

    if (!(key in DIRECTIONS)) return;
    if (!started || won) return;

    event.preventDefault();
    pressedKeys.add(key);
  });

  window.addEventListener("keyup", (event) => {
    pressedKeys.delete(normalizeKey(event.key));
  });

  function releasePointer(event) {
    activePointers.delete(event.pointerId);
  }

  document.querySelectorAll("[data-direction]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;

    const direction = button.dataset.direction;

    if (!["up", "down", "left", "right"].includes(direction)) {
      return;
    }

    button.addEventListener("pointerdown", (event) => {
      if (!started || won) return;

      event.preventDefault();

      activePointers.set(event.pointerId, direction);

      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // Some browsers may not support pointer capture.
      }
    });

    button.addEventListener("pointerup", releasePointer);
    button.addEventListener("pointercancel", releasePointer);
    button.addEventListener("lostpointercapture", releasePointer);
  });

  window.addEventListener("blur", stopMovement);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopMovement();
    }
  });

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", resetGame);
  playAgainButton.addEventListener("click", resetGame);

  background.addEventListener("load", render);

  background.addEventListener("error", () => {
    canvas.dataset.background = "fallback";

    setStatus(
      "The jungle artwork could not load. Playing with the built-in jungle background."
    );

    render();
  });

  updateScore();
  render();
})();