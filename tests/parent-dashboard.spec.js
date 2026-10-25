
 // @ts-check
"use strict";

const { test, expect } = require("@playwright/test");

const PROGRESS_KEY = "codejuniorafrica_python_progress_v1";
const PROFILE_KEY = "codejuniorafrica_learner_profile_v1";

test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/parent.html");

    await page.evaluate(({ progressKey, profileKey }) => {
        localStorage.removeItem(progressKey);
        localStorage.removeItem(profileKey);
    }, {
        progressKey: PROGRESS_KEY,
        profileKey: PROFILE_KEY
    });

    await page.reload();
});

test("shows an empty report for a new learner", async ({ page }) => {
    await expect(page.locator("#parent-learner-name"))
        .toHaveText("Young Coder");

    await expect(page.locator("#parent-completed-count"))
        .toHaveText("0 of 10");

    await expect(page.locator("#parent-progress-percentage"))
        .toHaveText("0%");

    await expect(page.locator("#parent-remaining-count"))
        .toHaveText("10");

    await expect(page.locator("#parent-badges-count"))
        .toHaveText("0 of 3");

    await expect(page.locator("#parent-progress-track"))
        .toHaveAttribute("aria-valuenow", "0");
});

test("shows the saved learner name and lesson progress", async ({ page }) => {
    await page.evaluate(({ progressKey, profileKey }) => {
        localStorage.setItem(profileKey, "StarCoder");
        localStorage.setItem(progressKey, JSON.stringify([0, 1, 3]));
    }, {
        progressKey: PROGRESS_KEY,
        profileKey: PROFILE_KEY
    });

    await page.reload();

    await expect(page.locator("#parent-learner-name"))
        .toHaveText("StarCoder");

    await expect(page.locator("#parent-completed-count"))
        .toHaveText("3 of 10");

    await expect(page.locator("#parent-progress-percentage"))
        .toHaveText("30%");

    await expect(page.locator("#parent-remaining-count"))
        .toHaveText("7");

    await expect(page.locator("#parent-progress-track"))
        .toHaveAttribute("aria-valuenow", "30");

    await expect(page.locator("#parent-completed-lessons li"))
        .toHaveCount(3);

    await expect(page.locator("#parent-next-lesson"))
        .toContainText("Lesson 3: Understanding Variables");
});

test("shows earned achievements at the correct milestone", async ({ page }) => {
    await page.evaluate((key) => {
        localStorage.setItem(key, JSON.stringify([0, 1, 2, 3, 4]));
    }, PROGRESS_KEY);

    await page.reload();

    await expect(page.locator("#parent-badges-count"))
        .toHaveText("2 of 3");

    await expect(page.locator(".achievement-card.earned"))
        .toHaveCount(2);

    await expect(
        page.locator(".achievement-card.earned").filter({
            hasText: "Halfway Hero"
        })
    ).toHaveCount(1);
});

test("handles a fully completed course", async ({ page }) => {
    await page.evaluate((key) => {
        localStorage.setItem(
            key,
            JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        );
    }, PROGRESS_KEY);

    await page.reload();

    await expect(page.locator("#parent-completed-count"))
        .toHaveText("10 of 10");

    await expect(page.locator("#parent-progress-percentage"))
        .toHaveText("100%");

    await expect(page.locator("#parent-remaining-count"))
        .toHaveText("0");

    await expect(page.locator("#parent-badges-count"))
        .toHaveText("3 of 3");

    await expect(page.locator(".achievement-card.earned"))
        .toHaveCount(3);

    await expect(page.locator("#parent-next-lesson"))
        .toContainText("All ten lessons are complete");
});

test("ignores invalid and duplicate lesson indexes", async ({ page }) => {
    await page.evaluate((key) => {
        localStorage.setItem(
            key,
            JSON.stringify([0, 0, 2, -1, 10, "3", null])
        );
    }, PROGRESS_KEY);

    await page.reload();

    await expect(page.locator("#parent-completed-count"))
        .toHaveText("2 of 10");

    await expect(page.locator("#parent-progress-percentage"))
        .toHaveText("20%");

    await expect(page.locator("#parent-completed-lessons li"))
        .toHaveCount(2);
});

test("does not change the learner's saved progress", async ({ page }) => {
    const originalProgress = JSON.stringify([0, 2, 4]);

    await page.evaluate(({ progressKey, profileKey, progress }) => {
        localStorage.setItem(progressKey, progress);
        localStorage.setItem(profileKey, "Code Explorer");
    }, {
        progressKey: PROGRESS_KEY,
        profileKey: PROFILE_KEY,
        progress: originalProgress
    });

    await page.reload();

    await expect.poll(async () => {
        return page.evaluate(
            (key) => localStorage.getItem(key),
            PROGRESS_KEY
        );
    }).toBe(originalProgress);
});

test("explains the limits of browser-local progress", async ({ page }) => {
    await expect(page.getByRole("heading", {
        name: "About this progress report"
    })).toBeVisible();

    await expect(page.locator(".privacy-note"))
        .toContainText("does not send reports to a parent");

    await expect(page.locator(".privacy-note"))
        .toContainText("does not");
});