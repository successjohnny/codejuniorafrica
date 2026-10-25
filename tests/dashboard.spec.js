
 // @ts-check
"use strict";

const { test, expect } = require("@playwright/test");

const STORAGE_KEY = "codejuniorafrica_python_progress_v1";

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard/index.html");
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
});

test("shows the correct starting state for a new learner", async ({ page }) => {
  await expect(page.locator("#completed-count")).toHaveText("0");
  await expect(page.locator("#progress-percentage")).toHaveText("0%");
  await expect(page.locator("#badges-count")).toHaveText("0");
  await expect(page.locator("#remaining-count")).toHaveText("10");
  await expect(page.locator("#progress-track")).toHaveAttribute(
    "aria-valuenow",
    "0"
  );
});

test("shows saved progress and the next incomplete lesson", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify([0, 1, 3]));
  }, STORAGE_KEY);

  await page.reload();

  await expect(page.locator("#completed-count")).toHaveText("3");
  await expect(page.locator("#progress-percentage")).toHaveText("30%");
  await expect(page.locator("#remaining-count")).toHaveText("7");
  await expect(page.locator("#progress-track")).toHaveAttribute(
    "aria-valuenow",
    "30"
  );

  await expect(page.locator("#next-lesson-title")).toContainText(
    "Lesson 3: Understanding Variables"
  );

  await expect(page.locator("#next-lesson-button")).toHaveAttribute(
    "href",
    "../lessons/index.html?lesson=3"
  );

  await expect(page.locator("#completed-lessons li")).toHaveCount(3);
});

test("unlocks achievements at the correct milestones", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify([0]));
  }, STORAGE_KEY);

  await page.reload();

  await expect(page.locator(".achievement-card.earned")).toHaveCount(1);
  await expect(page.locator(".achievement-card.earned")).toContainText(
    "First Step"
  );

  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify([0, 1, 2, 3, 4]));
  }, STORAGE_KEY);

  await page.reload();

  await expect(page.locator(".achievement-card.earned")).toHaveCount(2);
  await expect(
    page.locator(".achievement-card.earned").filter({
      hasText: "Halfway Hero"
    })
  ).toHaveCount(1);

  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    );
  }, STORAGE_KEY);

  await page.reload();

  await expect(page.locator("#completed-count")).toHaveText("10");
  await expect(page.locator("#progress-percentage")).toHaveText("100%");
  await expect(page.locator("#remaining-count")).toHaveText("0");
  await expect(page.locator(".achievement-card.earned")).toHaveCount(3);
  await expect(page.locator("#next-lesson-title")).toContainText(
    "You've completed the adventure!"
  );
});

test("ignores invalid saved progress without crashing", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(key, "this is not valid JSON");
  }, STORAGE_KEY);

  await page.reload();

  await expect(page.locator("#completed-count")).toHaveText("0");
  await expect(page.locator("#progress-percentage")).toHaveText("0%");
});

test("provides dashboard navigation from the homepage and lessons page", async ({
  page
}) => {
  await page.goto("/index.html");

  await expect(
    page.getByRole("link", { name: "My Dashboard" })
  ).toHaveAttribute("href", "dashboard/index.html");

  await page.goto("/lessons/index.html");

  await expect(
    page.getByRole("link", { name: "My Dashboard" })
  ).toHaveAttribute("href", "../dashboard/index.html");
});