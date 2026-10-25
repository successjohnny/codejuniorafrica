
 // @ts-check
"use strict";

const { test, expect } = require("@playwright/test");

const STORAGE_KEY = "codejuniorafrica_python_progress_v1";
const PROFILE_STORAGE_KEY = "codejuniorafrica_learner_profile_v1";

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard/index.html");

  await page.evaluate(({ progressKey, profileKey }) => {
    localStorage.removeItem(progressKey);
    localStorage.removeItem(profileKey);
  }, {
    progressKey: STORAGE_KEY,
    profileKey: PROFILE_STORAGE_KEY
  });

  await page.reload();
});

test("recommends the first lesson to a new learner", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Your Personalised Learning Path" })
  ).toBeVisible();

  const recommendations = page.locator("#learning-path-list .learning-path-item");

  await expect(recommendations).toHaveCount(3);

  await expect(recommendations.nth(0)).toContainText(
    "Lesson 1: What Is Coding?"
  );

  await expect(recommendations.nth(0).getByRole("link")).toHaveAttribute(
    "href",
    "../lessons/index.html?lesson=1"
  );
});

test("recommends incomplete lessons based on saved progress", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify([0, 1, 3]));
  }, STORAGE_KEY);

  await page.reload();

  const recommendations = page.locator("#learning-path-list .learning-path-item");

  await expect(recommendations).toHaveCount(3);

  await expect(recommendations.nth(0)).toContainText(
    "Lesson 3: Understanding Variables"
  );

  await expect(recommendations.nth(1)).toContainText(
    "Lesson 5: Your First Coding Challenge"
  );

  await expect(recommendations.nth(2)).toContainText(
    "Lesson 6: Understanding Python Data Types"
  );
});

test("does not recommend lessons already completed", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify([0, 1, 3]));
  }, STORAGE_KEY);

  await page.reload();

  const recommendations = page.locator(
    "#learning-path-list .learning-path-item"
  );

  await expect(recommendations).toHaveCount(3);

  await expect(recommendations.nth(0)).toContainText(
    "Lesson 3: Understanding Variables"
  );

  await expect(recommendations.nth(1)).toContainText(
    "Lesson 5: Your First Coding Challenge"
  );

  await expect(recommendations.nth(2)).toContainText(
    "Lesson 6: Understanding Python Data Types"
  );

  await expect(
    page.locator("#learning-path-list")
  ).not.toContainText("Lesson 1: What Is Coding?");

  await expect(
    page.locator("#learning-path-list")
  ).not.toContainText("Lesson 2:");

  await expect(
    page.locator("#learning-path-list")
  ).not.toContainText("Lesson 4:");
});

test("shows a completion message when all lessons are complete", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    );
  }, STORAGE_KEY);

  await page.reload();

  await expect(
    page.locator("#learning-path-message")
  ).toContainText("completed all ten Python lessons");

  await expect(
    page.locator("#learning-path-list .learning-path-item")
  ).toHaveCount(0);
});

test("handles invalid saved progress without crashing", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(key, "not valid JSON");
  }, STORAGE_KEY);

  await page.reload();

  await expect(
    page.locator("#learning-path-list .learning-path-item")
  ).toHaveCount(3);

  await expect(
    page.locator("#learning-path-list .learning-path-item").first()
  ).toContainText("Lesson 1: What Is Coding?");
});

test("does not modify the learner's saved progress", async ({ page }) => {
  const savedProgress = [0, 1, 3];

  await page.evaluate(({ key, progress }) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {
    key: STORAGE_KEY,
    progress: savedProgress
  });

  await page.reload();

  await expect(
    page.locator("#learning-path-list .learning-path-item")
  ).toHaveCount(3);

  await expect.poll(async () => {
    return page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY
    );
  }).toBe(JSON.stringify(savedProgress));
});

test("offers only the remaining lessons when fewer than three remain", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7])
    );
  }, STORAGE_KEY);

  await page.reload();

  const recommendations = page.locator("#learning-path-list .learning-path-item");

  await expect(recommendations).toHaveCount(2);

  await expect(recommendations.nth(0)).toContainText(
    "Lesson 9: Repeating Actions with Loops"
  );

  await expect(recommendations.nth(1)).toContainText(
    "Lesson 10: Creating Your Own Functions"
  );
});