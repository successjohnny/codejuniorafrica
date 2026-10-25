
"use strict";

const PROGRESS_STORAGE_KEY = "codejuniorafrica_python_progress_v1";
const PROFILE_STORAGE_KEY = "codejuniorafrica_learner_profile_v1";
const DEFAULT_DISPLAY_NAME = "Young Coder";
const TOTAL_LESSONS = 10;
const MAX_DISPLAY_NAME_LENGTH = 30;

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
 * Find a required HTML element.
 * @param {string} id
 * @returns {HTMLElement}
 */
function getRequiredElement(id) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Missing required element: #${id}`);
    }

    return element;
}

/**
 * Read and validate lesson indexes from localStorage.
 * @returns {number[]}
 */
function loadCompletedLessons() {
    try {
        const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);

        if (saved === null) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return [...new Set(
            parsed.filter(
                (index) =>
                    typeof index === "number" &&
                    Number.isInteger(index) &&
                    index >= 0 &&
                    index < TOTAL_LESSONS
            )
        )].sort((a, b) => a - b);
    } catch (error) {
        console.error("Unable to read lesson progress:", error);
        return [];
    }
}

/**
 * Read the learner's saved display name.
 * @returns {string}
 */
function loadLearnerName() {
    try {
        const saved = localStorage.getItem(PROFILE_STORAGE_KEY);

        if (saved === null) {
            return DEFAULT_DISPLAY_NAME;
        }

        const name = saved.trim();

        if (name.length < 2 || name.length > MAX_DISPLAY_NAME_LENGTH) {
            return DEFAULT_DISPLAY_NAME;
        }

        return name;
    } catch (error) {
        console.error("Unable to read learner profile:", error);
        return DEFAULT_DISPLAY_NAME;
    }
}

/**
 * Render summary counts and progress bar.
 * @param {number[]} completedLessons
 */
function renderSummary(completedLessons) {
    const completedCount = completedLessons.length;
    const remainingCount = TOTAL_LESSONS - completedCount;
    const percentage = Math.round(
        (completedCount / TOTAL_LESSONS) * 100
    );

    getRequiredElement("parent-completed-count").textContent =
        `${completedCount} of ${TOTAL_LESSONS}`;

    getRequiredElement("parent-progress-percentage").textContent =
        `${percentage}%`;

    getRequiredElement("parent-remaining-count").textContent =
        String(remainingCount);

    const earnedCount = achievements.filter(
        (achievement) => completedCount >= achievement.requiredLessons
    ).length;

    getRequiredElement("parent-badges-count").textContent =
        `${earnedCount} of ${achievements.length}`;

    getRequiredElement("parent-progress-label").textContent =
        `${completedCount} of ${TOTAL_LESSONS} lessons`;

    getRequiredElement("parent-progress-fill").style.width =
        `${percentage}%`;

    getRequiredElement("parent-progress-track").setAttribute(
        "aria-valuenow",
        String(percentage)
    );

    let message;

    if (completedCount === TOTAL_LESSONS) {
        message =
            "All ten lessons are complete. Congratulations to your Python Champion! 🎉";
    } else if (completedCount === 0) {
        message =
            "The learning journey is ready to begin. Encourage your learner to try the first lesson.";
    } else {
        message =
            `${completedCount} lesson${completedCount === 1 ? "" : "s"} completed. ` +
            `${remainingCount} more to go. Keep encouraging steady practice!`;
    }

    getRequiredElement("parent-progress-message").textContent = message;
}

/**
 * Render earned and locked milestones.
 * @param {number} completedCount
 */
function renderAchievements(completedCount) {
    const container = getRequiredElement("parent-achievements");
    container.replaceChildren();

    achievements.forEach((achievement) => {
        const earned = completedCount >= achievement.requiredLessons;

        const card = document.createElement("article");
        card.className = `achievement-card ${earned ? "earned" : "locked"}`;

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
        status.textContent = earned ? "✓ Earned" : "Not yet earned";

        card.append(icon, title, description, status);
        container.append(card);
    });
}

/**
 * Render completed lessons and the suggested next lesson.
 * @param {number[]} completedLessons
 */
function renderLessonDetails(completedLessons) {
    const list = getRequiredElement("parent-completed-lessons");
    list.replaceChildren();

    if (completedLessons.length === 0) {
        const item = document.createElement("li");
        item.className = "empty-message";
        item.textContent =
            "No completed lessons yet. Encourage your learner to begin with Lesson 1.";
        list.append(item);
    } else {
        completedLessons.forEach((index) => {
            const item = document.createElement("li");

            const check = document.createElement("span");
            check.className = "lesson-check";
            check.setAttribute("aria-hidden", "true");
            check.textContent = "✓";

            const title = document.createElement("span");
            title.textContent = `Lesson ${index + 1}: ${lessonTitles[index]}`;

            item.append(check, title);
            list.append(item);
        });
    }

    const nextIndex = lessonTitles.findIndex(
        (_title, index) => !completedLessons.includes(index)
    );

    if (nextIndex === -1) {
        getRequiredElement("parent-next-lesson").textContent =
            "All ten lessons are complete! Celebrate this milestone and encourage further practice.";
    } else {
        getRequiredElement("parent-next-lesson").textContent =
            `Lesson ${nextIndex + 1}: ${lessonTitles[nextIndex]}. ` +
            "This is the next incomplete lesson in the course.";
    }
}

/**
 * Refresh the report from saved browser data.
 */
function renderParentReport() {
    const name = loadLearnerName();
    const completedLessons = loadCompletedLessons();

    getRequiredElement("parent-learner-name").textContent = name;

    renderSummary(completedLessons);
    renderAchievements(completedLessons.length);
    renderLessonDetails(completedLessons);

    getRequiredElement("parent-status").textContent =
        "Progress loaded from this browser.";
}

getRequiredElement("parent-current-year").textContent =
    String(new Date().getFullYear());

renderParentReport();

/*
 * Refresh when the learner changes progress or their profile
 * in another tab using the same browser storage.
 */
window.addEventListener("storage", (event) => {
    if (
        event.key === PROGRESS_STORAGE_KEY ||
        event.key === PROFILE_STORAGE_KEY ||
        event.key === null
    ) {
        renderParentReport();
    }
});