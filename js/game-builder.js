
"use strict";

(() => {
  // =========================================================
  // 1. DOM ELEMENTS
  // =========================================================

  const canvas = document.getElementById("game-canvas");
  const scoreElement = document.getElementById("score");
  const starTotalElement = document.getElementById("star-total");
  const statusElement = document.getElementById("game-status");

  const startButton = document.getElementById("start-game");
  const restartButton = document.getElementById("restart-game");
  const playAgainButton = document.getElementById("play-again");
  const nextLevelButton = document.getElementById("next-level");

  const startOverlay = document.getElementById("start-overlay");
  const winOverlay = document.getElementById("win-overlay");

  const levelTitle = document.getElementById("level-title");
  const levelLabel = document.getElementById("level-label");
  const levelDescription = document.getElementById("level-description");

  const startTitle = document.getElementById("start-title");
  const startDescription = document.getElementById("start-description");
  const winTitle = document.getElementById("win-title");
  const winDescription = document.getElementById("win-description");
  const completionStars = document.getElementById("completion-stars");

  const levelList = document.getElementById("level-list");
  const completedLevelsElement = document.getElementById("completed-levels");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");

  const achievementCount = document.getElementById("achievement-count");
  const achievementScreen = document.getElementById("achievement-screen");
  const achievementGrid = document.getElementById("achievement-grid");
  const openAchievementsButton = document.getElementById("open-achievements");
  const closeAchievementsButton = document.getElementById("close-achievements");
  const viewAchievementsButton = document.getElementById("view-achievements");

  const missionSteps = document.getElementById("mission-steps");

  const requiredElements = [
    canvas,
    scoreElement,
    starTotalElement,
    statusElement,
    startButton,
    restartButton,
    playAgainButton,
    nextLevelButton,
    startOverlay,
    winOverlay,
    levelTitle,
    levelLabel,
    levelDescription,
    startTitle,
    startDescription,
    winTitle,
    winDescription,
    completionStars,
    levelList,
    completedLevelsElement,
    progressBar,
    progressFill,
    achievementCount,
    achievementScreen,
    achievementGrid,
    openAchievementsButton,
    closeAchievementsButton,
    viewAchievementsButton,
    missionSteps
  ];

  if (requiredElements.some((element) => !element)) {
    console.error(
      "Jungle Treasure Adventure could not find all required page elements."
    );
    return;
  }

  if (!(canvas instanceof HTMLCanvasElement)) {
    console.error("The game canvas is invalid.");
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    statusElement.textContent =
      "This browser cannot display the game canvas.";
    return;
  }

  // =========================================================
  // 2. GAME CONFIGURATION
  // =========================================================

  /**
   * @typedef {{ x: number, y: number }} Position
   */

  /**
   * @typedef {Object} Obstacle
   * @property {number} x
   * @property {number} y
   * @property {number} collisionRadius
   * @property {string} emoji
   */

  /**
   * @typedef {Object} LevelConfig
   * @property {string} id
   * @property {string} title
   * @property {string} difficulty
   * @property {string} description
   * @property {string} instructions
   * @property {string} startTitle
   * @property {string} startDescription
   * @property {number} speed
   * @property {string|null} background
   * @property {[string, string, string]} colors
   * @property {Position[]} stars
   * @property {Obstacle[]} obstacles
   * @property {Position} playerStart
   * @property {Position} treasure
   */

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  const PLAYER_SIZE = 28;
  const STAR_COLLECTION_RADIUS = 42;
  const TREASURE_RADIUS = 48;

  const STORAGE_KEY = "codejuniorafrica.adventure.progress";
  const STORAGE_VERSION = 1;

  const LEVELS = [
    {
      id: "jungle-explorer",
      title: "Jungle Explorer",
      difficulty: "Beginner",
      description:
        "Explore the jungle, collect three stars and find the hidden treasure.",
      instructions:
        "Collect all three glowing stars, avoid the jungle logs and reach the treasure chest!",
      startTitle: "Ready, explorer?",
      startDescription:
        "Three stars are hidden in the jungle. Find them, then discover the treasure!",
      speed: 210,
      background: "../assets/jungle-treasure-adventure.png",
      colors: ["#166534", "#15803d", "#14532d"],
      playerStart: { x: 65, y: 65 },
      stars: [
        { x: 270, y: 110 },
        { x: 500, y: 420 },
        { x: 735, y: 155 }
      ],
      obstacles: [
        { x: 355, y: 215, collisionRadius: 38, emoji: "🌿" },
        { x: 590, y: 300, collisionRadius: 38, emoji: "🌿" },
        { x: 170, y: 360, collisionRadius: 38, emoji: "🌿" }
      ],
      treasure: { x: 860, y: 440 }
    },
    {
      id: "ancient-temple",
      title: "Ancient Temple",
      difficulty: "Intermediate",
      description:
        "Explore an ancient temple filled with stone obstacles and hidden stars.",
      instructions:
        "Navigate around ancient pillars, collect all three stars and reach the golden temple!",
      startTitle: "Welcome to the temple!",
      startDescription:
        "Ancient pillars guard this temple. Collect the stars and uncover its secret treasure!",
      speed: 235,
      background: null,
      colors: ["#78350f", "#a16207", "#713f12"],
      playerStart: { x: 65, y: 65 },
      stars: [
        { x: 275, y: 110 },
        { x: 500, y: 420 },
        { x: 750, y: 155 }
      ],
      obstacles: [
        { x: 350, y: 215, collisionRadius: 43, emoji: "🏛️" },
        { x: 590, y: 300, collisionRadius: 43, emoji: "🏛️" },
        { x: 170, y: 360, collisionRadius: 43, emoji: "🏛️" },
        { x: 735, y: 380, collisionRadius: 43, emoji: "🪨" }
      ],
      treasure: { x: 870, y: 465 }
    },
    {
      id: "lost-treasure",
      title: "Lost Treasure",
      difficulty: "Advanced",
      description:
        "Take on the toughest challenge and discover the legendary lost treasure.",
      instructions:
        "Watch out for dangerous ancient ruins. Collect every star and find the legendary treasure!",
      startTitle: "The final challenge awaits!",
      startDescription:
        "Only the bravest explorers reach the lost treasure. Are you ready?",
      speed: 260,
      background: null,
      colors: ["#312e81", "#4338ca", "#1e1b4b"],
      playerStart: { x: 65, y: 65 },
      stars: [
        { x: 280, y: 110 },
        { x: 500, y: 420 },
        { x: 750, y: 155 }
      ],
      obstacles: [
        { x: 350, y: 215, collisionRadius: 45, emoji: "🪨" },
        { x: 590, y: 300, collisionRadius: 45, emoji: "🪨" },
        { x: 170, y: 360, collisionRadius: 45, emoji: "🪨" },
        { x: 735, y: 380, collisionRadius: 45, emoji: "🏛️" },
        { x: 440, y: 80, collisionRadius: 42, emoji: "🪨" }
      ],
      treasure: { x: 870, y: 465 }
    }
  ];

  const ACHIEVEMENTS = [
    {
      id: "first-level",
      title: "First Steps",
      description: "Complete your first adventure.",
      emoji: "🌴"
    },
    {
      id: "three-levels",
      title: "Star Collector",
      description: "Complete all three adventures.",
      emoji: "⭐"
    },
    {
      id: "all-stars",
      title: "Perfect Explorer",
      description: "Collect every star in every level.",
      emoji: "💎"
    }
  ];

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

  // =========================================================
  // 3. VALIDATED PROGRESS STORAGE
  // =========================================================

  function createFreshProgress() {
    return {
      version: STORAGE_VERSION,
      levels: LEVELS.map(() => ({
        completed: false,
        bestStars: 0
      }))
    };
  }

  /**
   * Validate saved progress before using it.
   *
   * Invalid or outdated data is rejected completely.
   *
   * @param {unknown} value
   * @returns {boolean}
   */
  function isValidProgress(value) {
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value)
    ) {
      return false;
    }

    const candidate = /** @type {Record<string, unknown>} */ (value);

    if (candidate.version !== STORAGE_VERSION) {
      return false;
    }

    if (
      !Array.isArray(candidate.levels) ||
      candidate.levels.length !== LEVELS.length
    ) {
      return false;
    }

    return candidate.levels.every((entry, index) => {
      if (
        typeof entry !== "object" ||
        entry === null ||
        Array.isArray(entry)
      ) {
        return false;
      }

      const level = /** @type {Record<string, unknown>} */ (entry);

      if (typeof level.completed !== "boolean") {
        return false;
      }

      if (
        !Number.isInteger(level.bestStars) ||
        typeof level.bestStars !== "number" ||
        level.bestStars < 0 ||
        level.bestStars > LEVELS[index].stars.length
      ) {
        return false;
      }

      // A level is complete exactly when all its stars have been earned.
      if (
        level.completed !==
        (level.bestStars === LEVELS[index].stars.length)
      ) {
        return false;
      }

      // A completed level requires every earlier level to be completed.
      if (
        level.completed &&
        !candidate.levels.slice(0, index).every((previous) => {
          if (
            typeof previous !== "object" ||
            previous === null ||
            Array.isArray(previous)
          ) {
            return false;
          }

          return (
            /** @type {Record<string, unknown>} */ (previous).completed ===
            true
          );
        })
      ) {
        return false;
      }

      return true;
    });
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved === null) {
        return createFreshProgress();
      }

      const parsed = JSON.parse(saved);

      if (!isValidProgress(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return createFreshProgress();
      }

      return parsed;
    } catch (error) {
      console.warn("Could not load saved adventure progress.", error);
      return createFreshProgress();
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn("Could not save adventure progress.", error);

      setStatus(
        "Your adventure is complete, but your browser could not save the progress."
      );
    }
  }

  /** @type {{ version: number, levels: { completed: boolean, bestStars: number }[] }} */
  let progress = loadProgress();

  // =========================================================
  // 4. GAME STATE
  // =========================================================

  let currentLevelIndex = 0;

  /** @type {Position} */
  let player = { ...LEVELS[0].playerStart };

  /** @type {Position[]} */
  let stars = [];

  /** @type {Set<string>} */
  const pressedKeys = new Set();

  /** @type {Map<number, string>} */
  const activePointers = new Map();

  let background = null;
  let started = false;
  let won = false;

  let animationFrameId = 0;
  let previousFrameTime = 0;
  let blockedNoticeShown = false;

  const currentLevel = () => LEVELS[currentLevelIndex];

  function setStatus(message) {
    statusElement.textContent = message;
  }

  function isLevelUnlocked(index) {
    if (index === 0) return true;

    return progress.levels
      .slice(0, index)
      .every((level) => level.completed);
  }

  function getCompletedLevelCount() {
    return progress.levels.filter((level) => level.completed).length;
  }

  function getUnlockedAchievements() {
    const completed = getCompletedLevelCount();

    const allLevelsCompleted = progress.levels.every(
      (level) => level.completed
    );

    const allStarsCollected = progress.levels.every(
      (level, index) =>
        level.bestStars === LEVELS[index].stars.length
    );

    const unlocked = [];

    if (completed >= 1) {
      unlocked.push("first-level");
    }

    if (allLevelsCompleted) {
      unlocked.push("three-levels");
    }

    if (allStarsCollected && allLevelsCompleted) {
      unlocked.push("all-stars");
    }

    return unlocked;
  }

  // =========================================================
  // 5. USER INTERFACE UPDATES
  // =========================================================

  function updateScore() {
    scoreElement.textContent = String(
      currentLevel().stars.length - stars.length
    );

    starTotalElement.textContent = String(
      currentLevel().stars.length
    );
  }

  function updateProgressUI() {
    const completed = getCompletedLevelCount();
    const percentage = (completed / LEVELS.length) * 100;

    completedLevelsElement.textContent = String(completed);
    progressFill.style.width = `${percentage}%`;

    progressBar.setAttribute("aria-valuenow", String(completed));

    document.querySelectorAll("[data-level-select]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;

      const index = Number(button.dataset.levelSelect);
      const unlocked = isLevelUnlocked(index);
      const record = progress.levels[index];

      button.disabled = !unlocked;

      button.classList.toggle("is-current", index === currentLevelIndex);
      button.classList.toggle("is-locked", !unlocked);
      button.classList.toggle("is-completed", record.completed);

      if (index === currentLevelIndex && unlocked) {
        button.setAttribute("aria-current", "step");
      } else {
        button.removeAttribute("aria-current");
      }

      const state = button.querySelector("[data-level-state]");

      if (!state) return;

      if (record.completed) {
        state.textContent = `✓ Completed · ${record.bestStars} stars`;
      } else if (unlocked && index === currentLevelIndex) {
        state.textContent = "Currently selected";
      } else if (unlocked) {
        state.textContent = "Ready to play";
      } else {
        state.textContent = "🔒 Locked";
      }

      const level = LEVELS[index];

      button.setAttribute(
        "aria-label",
        `Level ${index + 1}, ${level.title}, ${
          record.completed
            ? "completed"
            : unlocked
              ? "unlocked"
              : "locked"
        }`
      );
    });
  }

  function updateAchievementsUI() {
    const unlocked = getUnlockedAchievements();

    achievementCount.textContent = String(unlocked.length);

    achievementGrid
      .querySelectorAll("[data-achievement]")
      .forEach((card) => {
        const id = card.dataset.achievement;
        const isUnlocked = unlocked.includes(id);

        card.classList.toggle("is-locked", !isUnlocked);

        const state = card.querySelector(".achievement-state");

        if (state) {
          state.textContent = isUnlocked
            ? "✓ Unlocked"
            : "🔒 Locked";
        }
      });
  }

  function updateInterface() {
    const level = currentLevel();

    levelTitle.textContent = level.title;
    levelLabel.textContent =
      `LEVEL ${currentLevelIndex + 1} · ${level.difficulty.toUpperCase()}`;

    levelDescription.textContent = level.description;

    startTitle.textContent = level.startTitle;
    startDescription.textContent = level.startDescription;

    missionSteps.innerHTML = `
      <li><span>1</span><p>Use the <strong>arrow keys</strong> or <strong>W A S D</strong> to move.</p></li>
      <li><span>2</span><p>${level.instructions}</p></li>
      <li><span>3</span><p>Avoid obstacles and plan your route carefully.</p></li>
      <li><span>4</span><p>Reach the treasure to complete this level!</p></li>
    `;

    updateScore();
    updateProgressUI();
    updateAchievementsUI();
  }

  // =========================================================
  // 6. DRAWING AND RENDERING
  // =========================================================

  function roundedRect(x, y, width, height, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  }

  function drawFallbackBackground() {
    const colors = currentLevel().colors;

    const gradient = context.createLinearGradient(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);

    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    for (let index = 0; index < 34; index += 1) {
      const x = (index * 173) % WIDTH;
      const y = (index * 97) % HEIGHT;

      context.globalAlpha = 0.16;

      context.fillStyle =
        index % 2 === 0 ? "#ffffff" : "#000000";

      context.beginPath();
      context.ellipse(
        x,
        y,
        35,
        13,
        index,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.globalAlpha = 1;
  }

  function drawBackground() {
    if (background && background.complete && background.naturalWidth > 0) {
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

  function drawObstacles() {
    currentLevel().obstacles.forEach((obstacle) => {
      const isJungle = currentLevelIndex === 0;

      roundedRect(
        obstacle.x - 28,
        obstacle.y - 13,
        56,
        26,
        12,
        isJungle
          ? "#713f12"
          : currentLevelIndex === 1
            ? "#57534e"
            : "#3730a3"
      );

      context.strokeStyle = isJungle ? "#d6a15d" : "#cbd5e1";
      context.lineWidth = 3;

      context.beginPath();
      context.moveTo(obstacle.x - 18, obstacle.y - 5);
      context.lineTo(obstacle.x + 18, obstacle.y + 5);
      context.stroke();

      context.font = "22px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";

      context.fillText(
        obstacle.emoji,
        obstacle.x,
        obstacle.y - 24
      );
    });
  }

  function drawTreasure() {
    context.save();

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "48px Arial";

    context.fillText(
      stars.length === 0 ? "💎" : "🧰",
      currentLevel().treasure.x,
      currentLevel().treasure.y
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
    drawObstacles();
    drawStars();
    drawTreasure();
    drawPlayer();

    canvas.dataset.playerX = String(player.x);
    canvas.dataset.playerY = String(player.y);
    canvas.dataset.level = String(currentLevelIndex + 1);
  }

  // =========================================================
  // 7. MOVEMENT AND COLLISION
  // =========================================================

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  // Measures the shortest distance from a point to the player's
  // entire movement path. This prevents stars being skipped.
  function distanceToSegment(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return distance(point, start);
    }

    const projection =
      ((point.x - start.x) * dx +
        (point.y - start.y) * dy) /
      lengthSquared;

    const positionOnSegment = Math.max(
      0,
      Math.min(1, projection)
    );

    const closestPoint = {
      x: start.x + positionOnSegment * dx,
      y: start.y + positionOnSegment * dy
    };

    return distance(point, closestPoint);
  }

  function isBlocked(position) {
    return currentLevel().obstacles.some(
      (obstacle) =>
        distance(position, obstacle) <
        obstacle.collisionRadius
    );
  }

  function stopMovement() {
    pressedKeys.clear();
    activePointers.clear();
  }

  // =========================================================
  // 8. LEVEL COMPLETION AND PROGRESSION
  // =========================================================

  function finishGame() {
    if (won) return;

    won = true;
    started = false;

    stopMovement();

    const levelRecord = progress.levels[currentLevelIndex];

    const collectedStars = currentLevel().stars.length;

    levelRecord.completed = true;

    levelRecord.bestStars = Math.max(
      levelRecord.bestStars,
      collectedStars
    );

    saveProgress();

    const isFinalLevel =
      currentLevelIndex === LEVELS.length - 1;

    winTitle.textContent = isFinalLevel
      ? "Legendary explorer!"
      : "Level completed!";

    winDescription.textContent = isFinalLevel
      ? "You conquered all three adventures and discovered the legendary treasure!"
      : `Amazing work! You completed ${currentLevel().title}. Your next adventure is now unlocked!`;

    completionStars.textContent = "⭐".repeat(collectedStars);

    completionStars.setAttribute(
      "aria-label",
      `${collectedStars} stars collected`
    );

    nextLevelButton.textContent = isFinalLevel
      ? "View final achievements 🏆"
      : "Continue to next level →";

    winOverlay.classList.remove("is-hidden");

    updateProgressUI();
    updateAchievementsUI();

    setStatus(
      `Congratulations! You completed ${currentLevel().title}.`
    );
  }

  function selectLevel(index) {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= LEVELS.length
    ) {
      return;
    }

    if (!isLevelUnlocked(index)) {
      setStatus("Complete the previous level to unlock this adventure.");
      return;
    }

    currentLevelIndex = index;

    resetGame();

    achievementScreen.classList.add("is-hidden");

    updateInterface();
  }

  // =========================================================
  // 9. PLAYER MOVEMENT
  // =========================================================

  function movePlayer(dx, dy) {
    if (!started || won) return false;

    const next = {
      x: Math.max(
        PLAYER_SIZE / 2,
        Math.min(
          WIDTH - PLAYER_SIZE / 2,
          player.x + dx
        )
      ),
      y: Math.max(
        PLAYER_SIZE / 2,
        Math.min(
          HEIGHT - PLAYER_SIZE / 2,
          player.y + dy
        )
      )
    };

    if (isBlocked(next)) {
      if (!blockedNoticeShown) {
        setStatus(
          "An obstacle is blocking your way. Try another path!"
        );

        blockedNoticeShown = true;
      }

      return false;
    }

    blockedNoticeShown = false;

    const previousPosition = player;

    player = next;

    // Check the complete movement path for star collection.
    const remainingStars = stars.filter(
      (star) =>
        distanceToSegment(
          star,
          previousPosition,
          player
        ) >= STAR_COLLECTION_RADIUS
    );

    const collected = stars.length - remainingStars.length;

    stars = remainingStars;

    if (collected > 0) {
      updateScore();

      setStatus(
        stars.length === 0
          ? "All stars collected! Find the treasure."
          : "Wonderful! You found a star. Keep exploring!"
      );
    }

    if (
      stars.length === 0 &&
      distance(player, currentLevel().treasure) < TREASURE_RADIUS
    ) {
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

    const magnitude = Math.hypot(dx, dy);

    return {
      x: dx / magnitude,
      y: dy / magnitude
    };
  }

  // =========================================================
  // 10. GAME LOOP
  // =========================================================

  function gameLoop(timestamp) {
    if (!started || won) {
      animationFrameId = 0;
      return;
    }

    if (previousFrameTime === 0) {
      previousFrameTime = timestamp;
    }

    const elapsed = Math.min(
      (timestamp - previousFrameTime) / 1000,
      0.05
    );

    previousFrameTime = timestamp;

    const direction = getMovementDirection();

    if (direction) {
      const distanceToMove =
        currentLevel().speed * elapsed;

      movePlayer(
        direction.x * distanceToMove,
        direction.y * distanceToMove
      );
    }

    if (started && !won) {
      animationFrameId =
        window.requestAnimationFrame(gameLoop);
    } else {
      animationFrameId = 0;
    }
  }

  // =========================================================
  // 11. BACKGROUND MANAGEMENT
  // =========================================================

  function loadLevelBackground() {
    background = null;

    const backgroundPath = currentLevel().background;

    if (!backgroundPath) {
      canvas.dataset.background = "fallback";
      render();
      return;
    }

    const levelIndex = currentLevelIndex;
    const image = new Image();

    background = image;

    image.addEventListener("load", () => {
      if (levelIndex !== currentLevelIndex) return;

      render();
    });

    image.addEventListener("error", () => {
      if (levelIndex !== currentLevelIndex) return;

      canvas.dataset.background = "fallback";

      setStatus(
        "The jungle artwork could not load. Playing with the built-in background."
      );

      render();
    });

    image.src = backgroundPath;

    canvas.dataset.background = "fallback";

    render();
  }

  // =========================================================
  // 12. START, RESET AND RESTART
  // =========================================================

  function startGame() {
    if (started && !won) return;

    if (won) return;

    started = true;
    previousFrameTime = 0;

    startOverlay.classList.add("is-hidden");

    canvas.focus();

    setStatus(
      `Adventure started! ${currentLevel().instructions}`
    );

    if (animationFrameId === 0) {
      animationFrameId =
        window.requestAnimationFrame(gameLoop);
    }
  }

  function resetGame() {
    if (animationFrameId !== 0) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    stopMovement();

    player = { ...currentLevel().playerStart };

    stars = currentLevel().stars.map(
      (star) => ({ ...star })
    );

    started = false;
    won = false;

    previousFrameTime = 0;
    blockedNoticeShown = false;

    startOverlay.classList.remove("is-hidden");
    winOverlay.classList.add("is-hidden");

    achievementScreen.classList.add("is-hidden");

    setStatus("Press Start Adventure when you're ready.");

    updateInterface();

    loadLevelBackground();
  }

  // =========================================================
  // 13. ACHIEVEMENT SCREEN
  // =========================================================

  function openAchievements() {
    stopMovement();

    if (animationFrameId !== 0) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    started = false;

    updateAchievementsUI();

    achievementScreen.classList.remove("is-hidden");

    achievementScreen.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function closeAchievements() {
    achievementScreen.classList.add("is-hidden");
  }

  // =========================================================
  // 14. KEYBOARD CONTROLS
  // =========================================================

  function normalizeKey(key) {
    return key.length === 1
      ? key.toLowerCase()
      : key;
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

  // =========================================================
  // 15. TOUCH CONTROLS
  // =========================================================

  function releasePointer(event) {
    activePointers.delete(event.pointerId);
  }

  document.querySelectorAll("[data-direction]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;

    const direction = button.dataset.direction;

    if (
      !["up", "down", "left", "right"].includes(direction)
    ) {
      return;
    }

    button.addEventListener("pointerdown", (event) => {
      if (!started || won) return;

      event.preventDefault();

      activePointers.set(event.pointerId, direction);

      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture may not be supported.
      }
    });

    button.addEventListener("pointerup", releasePointer);
    button.addEventListener("pointercancel", releasePointer);
    button.addEventListener("lostpointercapture", releasePointer);
  });

  // =========================================================
  // 16. LEVEL SELECTION EVENTS
  // =========================================================

  levelList.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const button = target.closest("[data-level-select]");

    if (!(button instanceof HTMLButtonElement)) return;

    const index = Number(button.dataset.levelSelect);

    selectLevel(index);
  });

  // =========================================================
  // 17. OTHER EVENT LISTENERS
  // =========================================================

  window.addEventListener("blur", stopMovement);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopMovement();
    }
  });

  startButton.addEventListener("click", startGame);

  restartButton.addEventListener("click", resetGame);

  playAgainButton.addEventListener("click", resetGame);

  nextLevelButton.addEventListener("click", () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      selectLevel(currentLevelIndex + 1);
    } else {
      openAchievements();
    }
  });

  openAchievementsButton.addEventListener(
    "click",
    openAchievements
  );

  viewAchievementsButton.addEventListener(
    "click",
    openAchievements
  );

  closeAchievementsButton.addEventListener(
    "click",
    closeAchievements
  );

  // =========================================================
  // 18. INITIALIZE THE GAME
  // =========================================================

  resetGame();
})();