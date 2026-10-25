
"use strict";

const STORAGE_KEY = "codejuniorafrica_python_progress_v1";

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
 * Find an element and verify that it has the expected HTML element type.
 * @param {string} id
 * @param {string} elementType
 * @returns {HTMLElement}
 */
function getRequiredElement(id, elementType) {
    const element = document.getElementById(id);

    if (!element || element.tagName.toLowerCase() !== elementType) {
        throw new Error(`Missing or invalid HTML element: #${id}`);
    }

    return element;
}

/**
 * Check whether a stored lesson index is valid.
 * Lesson indexes are zero-based: 0 to 9.
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
 * Read the existing Python lesson progress.
 * Invalid or duplicated lesson indexes are ignored.
 * @returns {number[]}
 */
function loadProgress() {
    try {
        const savedProgress = localStorage.getItem(STORAGE_KEY);

        if (savedProgress === null) {
            return [];
        }

        const parsedProgress = JSON.parse(savedProgress);

        if (!Array.isArray(parsedProgress)) {
            return [];
        }

        return [...new Set(parsedProgress.filter(isValidLessonIndex))];
    } catch (error) {
        console.error("Unable to read saved learning progress:", error);
        return [];
    }
}

const completedCountElement = getRequiredElement("completed-count", "strong");
const percentageElement = getRequiredElement("progress-percentage", "strong");
const badgesCountElement = getRequiredElement("badges-count", "strong");
const remainingCountElement = getRequiredElement("remaining-count", "strong");
const progressTrack = getRequiredElement("progress-track", "div");
const progressFill = getRequiredElement("progress-fill", "div");
const progressLabel = getRequiredElement("progress-label", "strong");
const progressMessage = getRequiredElement("progress-message", "p");
const nextLessonTitle = getRequiredElement("next-lesson-title", "h3");
const nextLessonMessage = getRequiredElement("next-lesson-message", "p");
const nextLessonButton = getRequiredElement("next-lesson-button", "a");
const resumeButton = getRequiredElement("resume-button", "a");
const achievementList = getRequiredElement("achievement-list", "div");
const completedLessonsList = getRequiredElement("completed-lessons", "ul");
const currentYearElement = getRequiredElement("current-year", "span");

/**
 * Update the four overview statistics and progress bar.
 * @param {number[]} completedLessons
 */
function renderStatistics(completedLessons) {
    const completedCount = completedLessons.length;
    const totalLessons = lessonTitles.length;
    const remainingCount = totalLessons - completedCount;
    const percentage = Math.round((completedCount / totalLessons) * 100);

    completedCountElement.textContent = String(completedCount);
    percentageElement.textContent = `${percentage}%`;
    remainingCountElement.textContent = String(remainingCount);

    const earnedAchievements = achievements.filter(
        (achievement) => completedCount >= achievement.requiredLessons
    );

    badgesCountElement.textContent = String(earnedAchievements.length);

    progressLabel.textContent = `${completedCount} of ${totalLessons} lessons`;
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
 */
function renderAchievements(completedCount) {
    achievementList.replaceChildren();

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
        status.textContent = earned ? "✓ Earned" : "🔒 Locked";

        card.append(icon, title, description, status);
        achievementList.append(card);
    });
}

/**
 * Find the next incomplete lesson and update navigation.
 * The lesson page must read the lesson query parameter.
 * @param {number[]} completedLessons
 */
function renderNextLesson(completedLessons) {
    const nextIndex = lessonTitles.findIndex(
        (_title, index) => !completedLessons.includes(index)
    );

    if (nextIndex === -1) {
        nextLessonTitle.textContent = "You've completed the adventure! 🏆";
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

    nextLessonTitle.textContent = `Lesson ${lessonNumber}: ${title}`;
    nextLessonMessage.textContent =
        `You're ready for your next step: ${title}.`;
    nextLessonButton.textContent = "Continue This Lesson →";
    nextLessonButton.href = lessonUrl;
    resumeButton.href = lessonUrl;
}

/**
 * Display the titles of completed lessons.
 * @param {number[]} completedLessons
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
 * Render the dashboard from the existing saved lesson progress.
 */
function renderDashboard() {
    const completedLessons = loadProgress();
    const completedCount = completedLessons.length;

    renderStatistics(completedLessons);
    renderAchievements(completedCount);
    renderNextLesson(completedLessons);
    renderCompletedLessons(completedLessons);
}

currentYearElement.textContent = String(new Date().getFullYear());

renderDashboard();

/*
 * If lesson progress changes in another browser tab, refresh the dashboard.
 */
window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
        renderDashboard();
    }
});