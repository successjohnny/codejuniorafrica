
// @ts-check
"use strict";

// =====================================
// CODEJUNIORAFRICA - PYTHON LESSONS
// Type safety and runtime validation
// =====================================

/**
 * @typedef {Object} Lesson
 * @property {string} title
 * @property {string} description
 * @property {string} code
 * @property {string} explanation
 * @property {string} question
 * @property {string[]} options
 * @property {number} answer
 * @property {string} success
 * @property {string} hint
 */

/** @type {Lesson[]} */
const lessons = [
  {
    title: "What Is Coding?",
    description:
      "Coding means giving instructions to a computer. Just like following a recipe, a computer follows instructions step by step.",
    code: 'print("Hello, Africa!")',
    explanation:
      "The print() instruction tells Python to display something on the screen. Text inside quotation marks is called a string.",
    question: "What does coding mean?",
    options: [
      "Giving instructions to a computer",
      "Painting a picture",
      "Switching off a computer"
    ],
    answer: 0,
    success: "Correct! Coding means giving instructions to a computer.",
    hint: "Think about how we tell a computer what to do."
  },
  {
    title: "Your First Python Program",
    description:
      "Python is a programming language. We can use it to create games, websites and many other useful applications.",
    code: 'print("I am a young coder!")',
    explanation:
      "Python's print() function displays the message inside the quotation marks. The quotation marks themselves are not displayed.",
    question: "What will this Python program display?",
    options: [
      "print",
      "I am a young coder!",
      "Python"
    ],
    answer: 1,
    success: "Well done! You understand how print() works.",
    hint: "Look at the words inside the quotation marks."
  },
  {
    title: "Understanding Variables",
    description:
      "A variable is a name that refers to a value. We can use variables to store information such as names, ages and scores.",
    code: 'name = "Ada"\nprint(name)',
    explanation:
      'The variable name stores the text "Ada". When we use print(name), Python displays Ada.',
    question: "What will this program display?",
    options: [
      "name",
      "Ada",
      "Nothing"
    ],
    answer: 1,
    success: "Excellent! You know how variables work.",
    hint: "The variable name contains the value Ada."
  },
  {
    title: "Numbers and Calculations",
    description:
      "Python can work like a calculator. We can add, subtract, multiply and divide numbers.",
    code: "print(5 + 3)\nprint(10 - 4)\nprint(2 * 3)",
    explanation:
      "The + symbol means addition, - means subtraction and * means multiplication. Python calculates each expression before displaying the result.",
    question: "What is the result of print(5 + 3)?",
    options: [
      "53",
      "8",
      "2"
    ],
    answer: 1,
    success: "Fantastic! 5 + 3 equals 8.",
    hint: "Add five and three together."
  },
  {
    title: "Your First Coding Challenge",
    description:
      "You've learned about coding, print(), variables and calculations. Now combine your new skills!",
    code: 'name = "Junior Coder"\nscore = 10\nprint(name)\nprint(score + 5)',
    explanation:
      "Python first stores a name and a score. It then displays the name and calculates the score plus five.",
    question: "What number appears on the final output line?",
    options: [
      "10",
      "15",
      "105"
    ],
    answer: 1,
    success: "Amazing! You've completed your Python beginner adventure!",
    hint: "The score starts at 10, then we add 5."
  }
];

// =====================================
// DOM ELEMENT VALIDATION
// =====================================

/**
 * Get an HTML element and validate its type.
 *
 * @template {HTMLElement} T
 * @param {string} id
 * @param {new (...args: any[]) => T} elementType
 * @returns {T}
 */
function getLessonElement(id, elementType) {
  const element = document.getElementById(id);

  if (!(element instanceof elementType)) {
    throw new Error(
      `Missing or invalid HTML element: ${id}`
    );
  }

  return element;
}

/** @type {HTMLElement} */
const lessonList = getLessonElement(
  "lesson-list",
  HTMLElement
);

/** @type {HTMLElement} */
const lessonNumber = getLessonElement(
  "lesson-number",
  HTMLElement
);

/** @type {HTMLElement} */
const lessonTitle = getLessonElement(
  "lesson-title",
  HTMLElement
);

/** @type {HTMLElement} */
const lessonDescription = getLessonElement(
  "lesson-description",
  HTMLElement
);

/** @type {HTMLElement} */
const lessonCode = getLessonElement(
  "lesson-code",
  HTMLElement
);

/** @type {HTMLElement} */
const lessonExplanation = getLessonElement(
  "lesson-explanation",
  HTMLElement
);

/** @type {HTMLElement} */
const quizQuestion = getLessonElement(
  "quiz-question",
  HTMLElement
);

/** @type {HTMLElement} */
const quizOptions = getLessonElement(
  "quiz-options",
  HTMLElement
);

/** @type {HTMLElement} */
const quizFeedback = getLessonElement(
  "quiz-feedback",
  HTMLElement
);

/** @type {HTMLButtonElement} */
const previousBtn = getLessonElement(
  "previous-btn",
  HTMLButtonElement
);

/** @type {HTMLButtonElement} */
const nextBtn = getLessonElement(
  "next-btn",
  HTMLButtonElement
);

/** @type {HTMLElement} */
const progressTrack = getLessonElement(
  "progress-track",
  HTMLElement
);

/** @type {HTMLElement} */
const progressFill = getLessonElement(
  "progress-fill",
  HTMLElement
);

/** @type {HTMLElement} */
const progressText = getLessonElement(
  "progress-text",
  HTMLElement
);

/** @type {HTMLElement} */
const currentYearElement = getLessonElement(
  "current-year",
  HTMLElement
);

// =====================================
// LESSON DATA VALIDATION
// =====================================

/**
 * Validate a lesson object.
 *
 * @param {unknown} value
 * @returns {value is Lesson}
 */
function isValidLesson(value) {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const lesson = /** @type {Record<string, unknown>} */ (value);

  const textFields = [
    "title",
    "description",
    "code",
    "explanation",
    "question",
    "success",
    "hint"
  ];

  const validText = textFields.every(
    (field) =>
      typeof lesson[field] === "string" &&
      /** @type {string} */ (lesson[field]).trim().length > 0
  );

  if (!validText) {
    return false;
  }

  if (
    !Array.isArray(lesson.options) ||
    lesson.options.length < 2 ||
    !lesson.options.every(
      (option) =>
        typeof option === "string" &&
        option.trim().length > 0
    )
  ) {
    return false;
  }

  return (
    typeof lesson.answer === "number" &&
    Number.isInteger(lesson.answer) &&
    lesson.answer >= 0 &&
    lesson.answer < lesson.options.length
  );
}

/**
 * Validate all course lessons.
 *
 * @param {unknown} value
 * @returns {value is Lesson[]}
 */
function isValidLessonCollection(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(isValidLesson)
  );
}

if (!isValidLessonCollection(lessons)) {
  throw new Error("Invalid Python lesson data.");
}

// =====================================
// LEARNING STATE
// =====================================

/** @type {string} */
const STORAGE_KEY =
  "codejuniorafrica_python_progress_v1";

/** @type {number} */
let currentLesson = 0;

/** @type {number[]} */
let completedLessons = [];

/**
 * Validate a lesson index.
 *
 * @param {unknown} index
 * @returns {index is number}
 */
function isValidLessonIndex(index) {
  return (
    typeof index === "number" &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < lessons.length
  );
}

/**
 * Load and validate progress from browser storage.
 *
 * @returns {number[]}
 */
function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      return [];
    }

    /** @type {unknown} */
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const validIds = parsed.filter(isValidLessonIndex);

    return [...new Set(validIds)];
  } catch (error) {
    console.warn(
      "Saved progress could not be loaded.",
      error
    );

    return [];
  }
}

/**
 * Save completed lessons.
 *
 * @returns {void}
 */
function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(completedLessons)
    );
  } catch (error) {
    console.warn(
      "Lesson progress could not be saved.",
      error
    );
  }
}

completedLessons = loadProgress();

// =====================================
// UPDATE PROGRESS
// =====================================

/**
 * Update the course progress indicator.
 *
 * @returns {void}
 */
function updateProgress() {
  /** @type {number} */
  const completed = completedLessons.length;

  /** @type {number} */
  const percentage = Math.round(
    (completed / lessons.length) * 100
  );

  progressFill.style.width = `${percentage}%`;

  progressTrack.setAttribute(
    "aria-valuenow",
    String(percentage)
  );

  progressText.textContent =
    `${completed} of ${lessons.length} lessons completed`;

  if (completed === lessons.length) {
    progressText.textContent =
      "🎉 Congratulations! All lessons completed!";
  }
}

// =====================================
// DISPLAY LESSON MENU
// =====================================

/**
 * Render lesson navigation.
 *
 * @returns {void}
 */
function renderLessonList() {
  lessonList.replaceChildren();

  lessons.forEach((lesson, index) => {
    /** @type {HTMLButtonElement} */
    const button = document.createElement("button");

    button.type = "button";
    button.className = "lesson-item";

    button.textContent =
      `${index + 1}. ${lesson.title}`;

    if (index === currentLesson) {
      button.classList.add("active");
      button.setAttribute("aria-current", "step");
    }

    if (completedLessons.includes(index)) {
      button.classList.add("completed");
    }

    button.addEventListener("click", () => {
      if (isValidLessonIndex(index)) {
        currentLesson = index;
        renderLesson();
      }
    });

    lessonList.appendChild(button);
  });
}

// =====================================
// DISPLAY QUIZ
// =====================================

/**
 * Render a lesson's quiz.
 *
 * @param {Lesson} lesson
 * @returns {void}
 */
function renderQuiz(lesson) {
  quizQuestion.textContent = lesson.question;
  quizOptions.replaceChildren();

  quizFeedback.textContent = "";
  quizFeedback.className = "quiz-feedback";

  /** @type {boolean} */
  const alreadyCompleted =
    completedLessons.includes(currentLesson);

  lesson.options.forEach((option, index) => {
    /** @type {HTMLButtonElement} */
    const button = document.createElement("button");

    button.type = "button";
    button.className = "quiz-option";
    button.textContent = option;

    if (alreadyCompleted) {
      button.disabled = true;

      if (index === lesson.answer) {
        button.classList.add("correct");
      }
    }

    button.addEventListener("click", () => {
      checkAnswer(index);
    });

    quizOptions.appendChild(button);
  });

  if (alreadyCompleted) {
    quizFeedback.textContent =
      "✓ You've already completed this lesson!";

    quizFeedback.classList.add("success");
  }
}

// =====================================
// CHECK QUIZ ANSWERS
// =====================================

/**
 * Check a student's answer.
 *
 * @param {unknown} selectedIndex
 * @returns {void}
 */
function checkAnswer(selectedIndex) {
  if (!isValidLessonIndex(currentLesson)) {
    return;
  }

  const lesson = lessons[currentLesson];

  if (
    typeof selectedIndex !== "number" ||
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= lesson.options.length
  ) {
    quizFeedback.textContent =
      "Invalid answer. Please try again.";

    quizFeedback.className =
      "quiz-feedback error";

    return;
  }

  if (completedLessons.includes(currentLesson)) {
    return;
  }

  /** @type {NodeListOf<HTMLButtonElement>} */
  const buttons = quizOptions.querySelectorAll(
    "button.quiz-option"
  );

  quizFeedback.className = "quiz-feedback";

  buttons.forEach((button) => {
    button.classList.remove("incorrect");
  });

  if (selectedIndex === lesson.answer) {
    completedLessons.push(currentLesson);

    completedLessons = [
      ...new Set(completedLessons)
    ];

    saveProgress();

    buttons.forEach((button, index) => {
      button.disabled = true;

      if (index === lesson.answer) {
        button.classList.add("correct");
      }
    });

    quizFeedback.textContent =
      `🎉 ${lesson.success}`;

    quizFeedback.classList.add("success");

    updateProgress();
    renderLessonList();
    updateNavigation();
  } else {
    const selectedButton = buttons[selectedIndex];

    if (selectedButton) {
      selectedButton.classList.add("incorrect");
    }

    quizFeedback.textContent =
      `Not quite! ${lesson.hint} Try again.`;

    quizFeedback.classList.add("error");
  }
}

// =====================================
// NAVIGATION
// =====================================

/**
 * Update navigation button states.
 *
 * @returns {void}
 */
function updateNavigation() {
  previousBtn.disabled = currentLesson === 0;

  /** @type {boolean} */
  const isLastLesson =
    currentLesson === lessons.length - 1;

  nextBtn.textContent = isLastLesson
    ? "Adventure Complete! 🎉"
    : "Next Lesson →";

  nextBtn.disabled =
    isLastLesson ||
    !completedLessons.includes(currentLesson);
}

previousBtn.addEventListener("click", () => {
  if (currentLesson > 0) {
    currentLesson--;
    renderLesson();
  }
});

nextBtn.addEventListener("click", () => {
  if (
    currentLesson < lessons.length - 1 &&
    completedLessons.includes(currentLesson)
  ) {
    currentLesson++;
    renderLesson();
  }
});

// =====================================
// DISPLAY CURRENT LESSON
// =====================================

/**
 * Display the selected lesson.
 *
 * @returns {void}
 */
function renderLesson() {
  if (!isValidLessonIndex(currentLesson)) {
    throw new Error("Invalid lesson index.");
  }

  const lesson = lessons[currentLesson];

  lessonNumber.textContent =
    `Lesson ${currentLesson + 1} of ${lessons.length}`;

  lessonTitle.textContent = lesson.title;
  lessonDescription.textContent =
    lesson.description;

  lessonCode.textContent = lesson.code;
  lessonExplanation.textContent =
    lesson.explanation;

  renderLessonList();
  renderQuiz(lesson);
  updateNavigation();
  updateProgress();
}

// =====================================
// COPYRIGHT YEAR
// =====================================

/** @type {number} */
const currentYear = new Date().getFullYear();

currentYearElement.textContent =
  String(currentYear);

// =====================================
// INITIALIZE LEARNING CENTRE
// =====================================

renderLesson();