
"use strict";

(() => {
    const PROGRESS_KEY = "codejuniorafrica_python_progress_v1";
    const LEARNER_ID_KEY = "codejuniorafrica_learner_id_v1";
    const LESSON_COUNT = 10;

    const isLocalHost =
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "localhost";

    /** @type {string} */
    const API_BASE_URL =
        window.CODEJUNIOR_API_BASE_URL ||
        (isLocalHost
            ? "http://127.0.0.1:8000"
            : "https://codejuniorafrica.onrender.com");

    /**
     * Validate, deduplicate, and sort lesson indexes.
     * @param {unknown} value
     * @returns {number[]}
     */
    function normalizeProgress(value) {
        if (!Array.isArray(value)) {
            return [];
        }

        return [
            ...new Set(
                value.filter(
                    (index) =>
                        typeof index === "number" &&
                        Number.isInteger(index) &&
                        index >= 0 &&
                        index < LESSON_COUNT
                )
            )
        ].sort((a, b) => a - b);
    }

    /**
     * Read progress from local storage.
     * @returns {number[]}
     */
    function readLocalProgress() {
        try {
            const stored = localStorage.getItem(PROGRESS_KEY);

            if (stored === null) {
                return [];
            }

            /** @type {unknown} */
            const parsed = JSON.parse(stored);

            return normalizeProgress(parsed);
        } catch (error) {
            console.warn("Could not read cached progress.", error);
            return [];
        }
    }

    /**
     * Validate and cache progress locally.
     * @param {unknown} value
     * @returns {number[]}
     */
    function writeLocalProgress(value) {
        const progress = normalizeProgress(value);

        try {
            localStorage.setItem(
                PROGRESS_KEY,
                JSON.stringify(progress)
            );
        } catch (error) {
            console.warn("Could not cache learner progress.", error);
        }

        return progress;
    }

    /**
     * Get or create a browser-specific learner ID.
     * This ID is not an authentication mechanism.
     * @returns {string}
     */
    function getLearnerId() {
        try {
            const existing = localStorage.getItem(LEARNER_ID_KEY);

            if (existing && existing.trim()) {
                return existing;
            }

            const learnerId =
                window.crypto &&
                typeof window.crypto.randomUUID === "function"
                    ? `learner-${window.crypto.randomUUID()}`
                    : `learner-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2)}`;

            localStorage.setItem(LEARNER_ID_KEY, learnerId);

            return learnerId;
        } catch (error) {
            console.warn("Could not persist the learner ID.", error);
            return "learner-local-session";
        }
    }

    /**
     * Save validated progress locally and to the API.
     * @param {number[]} completedLessons
     * @returns {Promise<boolean>}
     */
    async function saveProgress(completedLessons) {
        const progress = writeLocalProgress(completedLessons);

        try {
            const response = await fetch(`${API_BASE_URL}/api/progress`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    learner_id: getLearnerId(),
                    completed_lessons: progress
                })
            });

            if (!response.ok) {
                console.warn(
                    `Progress API save failed: HTTP ${response.status}.`
                );

                return false;
            }

            return true;
        } catch (error) {
            console.warn(
                "Progress API unavailable; local progress is retained.",
                error
            );

            return false;
        }
    }

    /**
     * Synchronize local and backend progress.
     *
     * Local progress is re-read after network requests so that
     * changes made while a request is pending are not overwritten
     * by an earlier, stale snapshot.
     *
     * @returns {Promise<number[]>}
     */
    async function syncProgress() {
        const learnerId = getLearnerId();

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/progress/${encodeURIComponent(learnerId)}`
            );

            // Re-read local progress only after the network request
            // completes. The original snapshot may now be outdated.
            const latestLocalProgress = readLocalProgress();

            if (response.status === 404) {
                // No backend record exists. Preserve and upload the
                // latest locally saved progress.
                await saveProgress(latestLocalProgress);

                // Return the current local value in case it changed
                // while the save request was pending.
                return readLocalProgress();
            }

            if (!response.ok) {
                throw new Error(
                    `Progress API load failed: HTTP ${response.status}.`
                );
            }

            /** @type {unknown} */
            const payload = await response.json();

            if (
                typeof payload !== "object" ||
                payload === null ||
                !("completed_lessons" in payload)
            ) {
                throw new Error(
                    "Progress API returned an invalid response."
                );
            }

            /** @type {unknown} */
            const backendProgress = payload.completed_lessons;

            const normalizedBackend =
                normalizeProgress(backendProgress);

            // Local progress takes priority when it exists.
            if (latestLocalProgress.length > 0) {
                await saveProgress(latestLocalProgress);

                return readLocalProgress();
            }

            // Re-check before restoring backend progress. If the
            // learner saved progress while the response body was
            // being processed, preserve that newer local progress.
            const currentLocalProgress = readLocalProgress();

            if (currentLocalProgress.length > 0) {
                await saveProgress(currentLocalProgress);

                return readLocalProgress();
            }

            // Restore backend progress only when local progress
            // is still empty.
            return writeLocalProgress(normalizedBackend);
        } catch (error) {
            console.warn(
                "Could not synchronize progress; using local cache.",
                error
            );

            // Do not return an old snapshot after a network failure.
            return readLocalProgress();
        }
    }

    window.CodeJuniorProgress = Object.freeze({
        getLearnerId,
        readLocalProgress,
        writeLocalProgress,
        saveProgress,
        syncProgress
    });
})();