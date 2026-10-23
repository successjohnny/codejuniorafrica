
// @ts-check
"use strict";

// =====================================
// CODEJUNIORAFRICA - HOMEPAGE JAVASCRIPT
// Type-safe DOM access and validation
// =====================================

/**
 * Find a required HTML element and validate its type.
 *
 * @template {HTMLElement} T
 * @param {string} id
 * @param {new (...args: any[]) => T} elementType
 * @returns {T}
 */
function getRequiredElement(id, elementType) {
  const element = document.getElementById(id);

  if (!(element instanceof elementType)) {
    throw new Error(
      `Required element "${id}" is missing or has the wrong type.`
    );
  }

  return element;
}

// =====================================
// MOBILE NAVIGATION
// =====================================

/** @type {HTMLButtonElement} */
const menuToggle = getRequiredElement(
  "menu-toggle",
  HTMLButtonElement
);

/** @type {HTMLUListElement} */
const navLinks = getRequiredElement(
  "nav-links",
  HTMLUListElement
);

/**
 * Close the mobile navigation menu.
 *
 * @returns {void}
 */
function closeMenu() {
  navLinks.classList.remove("active");

  menuToggle.setAttribute(
    "aria-expanded",
    "false"
  );

  menuToggle.setAttribute(
    "aria-label",
    "Open navigation menu"
  );
}

// Toggle navigation visibility.
menuToggle.addEventListener("click", () => {
  /** @type {boolean} */
  const isOpen = navLinks.classList.toggle("active");

  menuToggle.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  menuToggle.setAttribute(
    "aria-label",
    isOpen
      ? "Close navigation menu"
      : "Open navigation menu"
  );
});

// Close navigation after clicking a link.

/** @type {NodeListOf<HTMLAnchorElement>} */
const navigationLinks =
  navLinks.querySelectorAll("a");

navigationLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Close navigation using Escape.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

// =====================================
// INTERACTIVE CODING QUIZ
// =====================================

/** @type {NodeListOf<HTMLButtonElement>} */
const quizOptions = document.querySelectorAll(
  "button.quiz-option"
);

/** @type {HTMLElement} */
const quizFeedback = getRequiredElement(
  "quiz-feedback",
  HTMLElement
);

/** @type {HTMLButtonElement} */
const resetQuiz = getRequiredElement(
  "reset-quiz",
  HTMLButtonElement
);

/**
 * Validate an answer value.
 *
 * @param {unknown} answer
 * @returns {answer is "correct" | "wrong"}
 */
function isValidAnswer(answer) {
  return answer === "correct" || answer === "wrong";
}

/**
 * Disable quiz choices and show the correct answer.
 *
 * @returns {void}
 */
function disableQuizOptions() {
  quizOptions.forEach((button) => {
    button.disabled = true;

    if (button.dataset.answer === "correct") {
      button.classList.add("correct");
    }
  });
}

/**
 * Handle a student's selected answer.
 *
 * @param {HTMLButtonElement} option
 * @returns {void}
 */
function handleQuizAnswer(option) {
  /** @type {string | undefined} */
  const answer = option.dataset.answer;

  if (!isValidAnswer(answer)) {
    quizFeedback.textContent =
      "This answer is unavailable. Please try another option.";

    quizFeedback.classList.remove("success");
    quizFeedback.classList.add("error");

    return;
  }

  /** @type {boolean} */
  const isCorrect = answer === "correct";

  disableQuizOptions();

  quizFeedback.classList.remove(
    "success",
    "error"
  );

  if (isCorrect) {
    quizFeedback.textContent =
      "🎉 Excellent! Python calculates 2 + 3 and displays 5.";

    quizFeedback.classList.add("success");
  } else {
    option.classList.add("incorrect");

    quizFeedback.textContent =
      "Good try! The correct answer is 5 because Python adds the two numbers.";

    quizFeedback.classList.add("error");
  }
}

// Register quiz event handlers.
quizOptions.forEach((option) => {
  option.addEventListener("click", () => {
    handleQuizAnswer(option);
  });
});

/**
 * Reset the coding challenge.
 *
 * @returns {void}
 */
function resetChallenge() {
  quizOptions.forEach((option) => {
    option.disabled = false;

    option.classList.remove(
      "correct",
      "incorrect"
    );
  });

  quizFeedback.textContent = "";

  quizFeedback.classList.remove(
    "success",
    "error"
  );
}

resetQuiz.addEventListener(
  "click",
  resetChallenge
);

// =====================================
// AUTOMATIC COPYRIGHT YEAR
// =====================================

/** @type {HTMLElement} */
const currentYear = getRequiredElement(
  "current-year",
  HTMLElement
);

/** @type {number} */
const year = new Date().getFullYear();

currentYear.textContent = String(year);