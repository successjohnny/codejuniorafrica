
"use strict";

const STORAGE_KEY = "codejuniorafrica_python_progress_v1";
const PROFILE_STORAGE_KEY = "codejuniorafrica_learner_profile_v1";
const DEFAULT_DISPLAY_NAME = "Young Coder";
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;
const LEARNING_PATH_LIMIT = 3;

const lessonTitles = [
    "What Is Coding?",
    "Your First Python Program",
    "Understanding Variables",
    "Numbers and Calculations",
    "Your First Coding Challenge",
    "Understanding Python Data Types",
    "Working with Strings",
    "Making Decisions with if and else",
    "Repeating Actions with Loops",
    "Creating Your Own Functions"
];

const achievements = [
    {
        id: "first-step",
        icon: "🌱",
        title: "First Step",
        description: "Complete your first lesson.",
        requiredLessons: 1
    },
    {
        id: "halfway-hero",
        icon: "⭐",
        title: "Halfway Hero",
        description: "Complete five Python lessons.",
        requiredLessons: 5
    },
    {
        id: "python-champion",
        icon: "🏆",
        title: "Python Champion",
        description: "Complete all ten Python lessons.",
        requiredLessons: 10
    }
];

/**
 * Find an element and verify its HTML element type.
 *
 * The generic type T preserves the specific element type for TypeScript.
 * Both the tag name and runtime constructor are checked.
 *
 * @template {HTMLElement} T
 * @param {string} id
 * @param {string} elementType
 * @param {new () => T} expectedConstructor
 * @returns {T}
 */
function getRequiredElement(id, elementType, expectedConstructor) {
    const element = document.getElementById(id);

    if (
        !element ||
        element.tagName.toLowerCase() !== elementType ||
        !(element instanceof expectedConstructor)
    ) {
        throw new Error(`Missing or invalid HTML element: #${id}`);
    }

    return element;
}

/**
 * Read a saved display name.
 * @returns {string}
 */
function loadDisplayName() {
    try {
        const savedName = localStorage.getItem(PROFILE_STORAGE_KEY);

        if (savedName === null) {
            return DEFAULT_DISPLAY_NAME;
        }

        const trimmedName = savedName.trim();

        if (
            trimmedName.length < MIN_NAME_LENGTH ||
            trimmedName.length > MAX_NAME_LENGTH
        ) {
            return DEFAULT_DISPLAY_NAME;
        }

        return trimmedName;
    } catch (error) {
        console.error("Unable to read the learner profile:", error);
        return DEFAULT_DISPLAY_NAME;
    }
}

/**
 * Check whether a lesson index is valid.
 * @param {unknown} index
 * @returns {index is number}
 */
function isValidLessonIndex(index) {
    return (
        typeof index === "number" &&
        Number.isInteger(index) &&
        index >= 0 &&
        index < lessonTitles.length
    );
}

/**
 * Read saved lesson progress.
 * Invalid, duplicated, and out-of-range indexes are ignored.
 * @returns {number[]}
 */
function loadProgress() {
    try {
        const savedProgress = localStorage.getItem(STORAGE_KEY);

        if (savedProgress === null) {
            return [];
        }

        /** @type {unknown} */
        const parsedProgress = JSON.parse(savedProgress);

        if (!Array.isArray(parsedProgress)) {
            return [];
        }

        const validIndexes = parsedProgress.filter(isValidLessonIndex);

        return [...new Set(validIndexes)].sort((a, b) => a - b);
    } catch (error) {
        console.error(
            "Unable to read saved learning progress:",
            error
        );
        return [];
    }
}

const welcomeHeading = getRequiredElement(
    "welcome-heading",
    "h1",
    HTMLHeadingElement
);

const profileForm = getRequiredElement(
    "profile-form",
    "form",
    HTMLFormElement
);

const displayNameInput = getRequiredElement(
    "display-name",
    "input",
    HTMLInputElement
);

const profileFeedback = getRequiredElement(
    "profile-feedback",
    "p",
    HTMLParagraphElement
);

const completedCountElement = getRequiredElement(
    "completed-count",
    "strong",
    HTMLElement
);

const percentageElement = getRequiredElement(
    "progress-percentage",
    "strong",
    HTMLElement
);

const badgesCountElement = getRequiredElement(
    "badges-count",
    "strong",
    HTMLElement
);

const remainingCountElement = getRequiredElement(
    "remaining-count",
    "strong",
    HTMLElement
);

const progressTrack = getRequiredElement(
    "progress-track",
    "div",
    HTMLDivElement
);

const progressFill = getRequiredElement(
    "progress-fill",
    "div",
    HTMLDivElement
);

const progressLabel = getRequiredElement(
    "progress-label",
    "strong",
    HTMLElement
);

const progressMessage = getRequiredElement(
    "progress-message",
    "p",
    HTMLParagraphElement
);

const nextLessonTitle = getRequiredElement(
    "next-lesson-title",
    "h3",
    HTMLHeadingElement
);

const nextLessonMessage = getRequiredElement(
    "next-lesson-message",
    "p",
    HTMLParagraphElement
);

const nextLessonButton = getRequiredElement(
    "next-lesson-button",
    "a",
    HTMLAnchorElement
);

const resumeButton = getRequiredElement(
    "resume-button",
    "a",
    HTMLAnchorElement
);

const achievementList = getRequiredElement(
    "achievement-list",
    "div",
    HTMLDivElement
);

const completedLessonsList = getRequiredElement(
    "completed-lessons",
    "ul",
    HTMLUListElement
);

const learningPathList = getRequiredElement(
    "learning-path-list",
    "div",
    HTMLDivElement
);

const learningPathMessage = getRequiredElement(
    "learning-path-message",
    "p",
    HTMLParagraphElement
);

const currentYearElement = getRequiredElement(
    "current-year",
    "span",
    HTMLSpanElement
);

/**
 * Update the welcome heading using the learner's display name.
 * @param {string} name
 * @returns {void}
 */
function renderWelcome(name) {
    welcomeHeading.textContent = `Welcome back, ${name}! 👋`;
}

/**
 * Show feedback below the profile form.
 * @param {string} message
 * @param {"success" | "error" | "info"} type
 * @returns {void}
 */
function showProfileFeedback(message, type) {
    profileFeedback.textContent = message;
    profileFeedback.className = "profile-feedback";

    if (type === "success") {
        profileFeedback.classList.add("success");
    } else if (type === "error") {
        profileFeedback.classList.add("error");
    }
}

/**
 * Save the learner's display name.
 * @returns {void}
 */
function saveDisplayName() {
    const name = displayNameInput.value.trim();

    if (
        name.length < MIN_NAME_LENGTH ||
        name.length > MAX_NAME_LENGTH
    ) {
        showProfileFeedback(
            `Please enter a name between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`,
            "error"
        );

        displayNameInput.focus();
        return;
    }

    try {
        localStorage.setItem(PROFILE_STORAGE_KEY, name);
        renderWelcome(name);
        displayNameInput.value = name;

        showProfileFeedback(
            `Your display name has been saved. Welcome, ${name}!`,
            "success"
        );
    } catch (error) {
        console.error("Unable to save the learner profile:", error);

        showProfileFeedback(
            "Your name could not be saved in this browser. Please check your browser storage settings and try again.",
            "error"
        );
    }
}

/**
 * Update overview statistics and the progress bar.
 * @param {number[]} completedLessons
 * @returns {void}
 */
function renderStatistics(completedLessons) {
    const completedCount = completedLessons.length;
    const totalLessons = lessonTitles.length;
    const remainingCount = totalLessons - completedCount;
    const percentage = Math.round(
        (completedCount / totalLessons) * 100
    );

    completedCountElement.textContent = String(completedCount);
    percentageElement.textContent = `${percentage}%`;
    remainingCountElement.textContent = String(remainingCount);

    const earnedAchievements = achievements.filter(
        (achievement) => completedCount >= achievement.requiredLessons
    );

    badgesCountElement.textContent = String(earnedAchievements.length);

    progressLabel.textContent =
        `${completedCount} of ${totalLessons} lessons`;

    progressFill.style.width = `${percentage}%`;
    progressTrack.setAttribute("aria-valuenow", String(percentage));

    if (completedCount === totalLessons) {
        progressMessage.textContent =
            "Amazing work! You completed all ten Python lessons. You're a Python Champion! 🎉";
    } else if (completedCount === 0) {
        progressMessage.textContent =
            "Your coding adventure starts here. Complete your first lesson!";
    } else {
        progressMessage.textContent =
            `Fantastic progress! You've completed ${completedCount} lesson${completedCount === 1 ? "" : "s"}. Keep going!`;
    }
}

/**
 * Render earned and locked achievements.
 * @param {number} completedCount
 * @returns {void}
 */
function renderAchievements(completedCount) {
    achievementList.replaceChildren();

    achievements.forEach((achievement) => {
        const earned =
            completedCount >= achievement.requiredLessons;

        const card = document.createElement("article");
        card.className =
            `achievement-card ${earned ? "earned" : "locked"}`;

        const icon = document.createElement("span");
        icon.className = "achievement-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = achievement.icon;

        const title = document.createElement("h3");
        title.textContent = achievement.title;

        const description = document.createElement("p");
        description.textContent = achievement.description;

        const status = document.createElement("span");
        status.className = "achievement-status";
        status.textContent = earned ? "✓ Earned" : "🔒 Locked";

        card.append(icon, title, description, status);
        achievementList.append(card);
    });
}

/**
 * Find the next incomplete lesson and update navigation.
 * @param {number[]} completedLessons
 * @returns {void}
 */
function renderNextLesson(completedLessons) {
    const nextIndex = lessonTitles.findIndex(
        (_title, index) => !completedLessons.includes(index)
    );

    if (nextIndex === -1) {
        nextLessonTitle.textContent =
            "You've completed the adventure! 🏆";

        nextLessonMessage.textContent =
            "All ten lessons are complete. Keep practising your Python skills!";

        nextLessonButton.textContent = "Review Lessons →";
        nextLessonButton.href = "../lessons/index.html";

        resumeButton.textContent = "Review Lessons →";
        resumeButton.href = "../lessons/index.html";
        return;
    }

    const lessonNumber = nextIndex + 1;
    const title = lessonTitles[nextIndex];
    const lessonUrl = `../lessons/index.html?lesson=${lessonNumber}`;

    nextLessonTitle.textContent =
        `Lesson ${lessonNumber}: ${title}`;

    nextLessonMessage.textContent =
        `You're ready for your next step: ${title}.`;

    nextLessonButton.textContent = "Continue This Lesson →";
    nextLessonButton.href = lessonUrl;
    resumeButton.href = lessonUrl;
}

/**
 * Render up to three incomplete lessons.
 * This function reads progress but never changes saved progress.
 * @param {number[]} completedLessons
 * @returns {void}
 */
function renderLearningPath(completedLessons) {
    learningPathList.replaceChildren();

    const completedSet = new Set(completedLessons);

    const recommendedLessons = lessonTitles
        .map((title, index) => ({
            index,
            title
        }))
        .filter((lesson) => !completedSet.has(lesson.index))
        .slice(0, LEARNING_PATH_LIMIT);

    if (recommendedLessons.length === 0) {
        learningPathMessage.textContent =
            "Congratulations! You have completed all ten Python lessons. Your Python learning journey is just beginning!";
        return;
    }

    learningPathMessage.textContent =
        "Here are your next recommended lessons. Complete them at your own pace.";

    recommendedLessons.forEach((lesson) => {
        const lessonNumber = lesson.index + 1;

        const card = document.createElement("article");
        card.className = "learning-path-item";

        const number = document.createElement("span");
        number.className = "learning-path-number";
        number.setAttribute("aria-hidden", "true");
        number.textContent = String(lessonNumber);

        const content = document.createElement("div");
        content.className = "learning-path-content";

        const title = document.createElement("h3");
        title.textContent =
            `Lesson ${lessonNumber}: ${lesson.title}`;

        const description = document.createElement("p");
        description.textContent =
            "Continue building your Python skills.";

        const link = document.createElement("a");
        link.className = "learning-path-link";
        link.href = `../lessons/index.html?lesson=${lessonNumber}`;
        link.textContent = "Start lesson →";
        link.setAttribute(
            "aria-label",
            `Start Lesson ${lessonNumber}: ${lesson.title}`
        );

        content.append(title, description, link);
        card.append(number, content);
        learningPathList.append(card);
    });
}

/**
 * Display completed lessons.
 * @param {number[]} completedLessons
 * @returns {void}
 */
function renderCompletedLessons(completedLessons) {
    completedLessonsList.replaceChildren();

    if (completedLessons.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent =
            "No lessons completed yet. Finish your first lesson and it will appear here.";

        completedLessonsList.append(emptyMessage);
        return;
    }

    completedLessons
        .slice()
        .sort((a, b) => a - b)
        .forEach((lessonIndex) => {
            const item = document.createElement("li");

            const check = document.createElement("span");
            check.className = "completed-check";
            check.setAttribute("aria-hidden", "true");
            check.textContent = "✓";

            const title = document.createElement("span");
            title.textContent =
                `Lesson ${lessonIndex + 1}: ${lessonTitles[lessonIndex]}`;

            item.append(check, title);
            completedLessonsList.append(item);
        });
}

/**
 * Render the dashboard from saved lesson progress.
 * @returns {void}
 */
function renderDashboard() {
    const completedLessons = loadProgress();
    const completedCount = completedLessons.length;

    renderStatistics(completedLessons);
    renderAchievements(completedCount);
    renderNextLesson(completedLessons);
    renderLearningPath(completedLessons);
    renderCompletedLessons(completedLessons);
}

currentYearElement.textContent = String(new Date().getFullYear());

const savedDisplayName = loadDisplayName();

renderWelcome(savedDisplayName);

displayNameInput.value =
    savedDisplayName === DEFAULT_DISPLAY_NAME
        ? ""
        : savedDisplayName;

profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveDisplayName();
});

// Render immediately from local storage.
renderDashboard();

/*
 * Synchronize with the backend, then refresh the dashboard.
 * If the API is unavailable, the helper retains local progress.
 */
if (
    window.CodeJuniorProgress &&
    typeof window.CodeJuniorProgress.syncProgress === "function"
) {
    void window.CodeJuniorProgress.syncProgress()
        .then(() => {
            renderDashboard();
        })
        .catch((error) => {
            console.error(
                "Unable to synchronize dashboard progress:",
                error
            );
        });
}

/*
 * Refresh lesson progress if it changes in another browser tab.
 */
window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
        renderDashboard();
    }

    if (
        event.key === PROFILE_STORAGE_KEY ||
        event.key === null
    ) {
        const name = loadDisplayName();

        renderWelcome(name);

        displayNameInput.value =
            name === DEFAULT_DISPLAY_NAME ? "" : name;
    }
});