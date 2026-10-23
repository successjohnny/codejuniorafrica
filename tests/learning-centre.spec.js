
// @ts-check
"use strict";

const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/lessons/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("displays the first Python lesson", async ({ page }) => {
  await expect(page.locator("#lesson-title")).toHaveText(
    "What Is Coding?"
  );

  await expect(page.locator("#progress-text")).toHaveText(
    "0 of 5 lessons completed"
  );
});

test("shows a hint for an incorrect answer", async ({ page }) => {
  await page.locator("#quiz-options button").nth(1).click();

  await expect(page.locator("#quiz-feedback")).toContainText(
    "Not quite!"
  );

  await expect(page.locator("#next-btn")).toBeDisabled();
});

test("unlocks the next lesson after a correct answer", async ({ page }) => {
  await page.locator("#quiz-options button").nth(0).click();

  await expect(page.locator("#quiz-feedback")).toContainText(
    "🎉"
  );

  await expect(page.locator("#next-btn")).toBeEnabled();

  await page.locator("#next-btn").click();

  await expect(page.locator("#lesson-title")).toHaveText(
    "Your First Python Program"
  );
});

test("saves completed progress after refreshing", async ({ page }) => {
  await page.locator("#quiz-options button").nth(0).click();

  await expect(page.locator("#progress-text")).toHaveText(
    "1 of 5 lessons completed"
  );

  await page.reload();

  await expect(page.locator("#progress-text")).toHaveText(
    "1 of 5 lessons completed"
  );

  await expect(
    page.locator(".lesson-item.completed")
  ).toHaveCount(1);
});

test("updates progress after completing two lessons", async ({ page }) => {
  await page.locator("#quiz-options button").nth(0).click();
  await page.locator("#next-btn").click();

  await page.locator("#quiz-options button").nth(1).click();

  await expect(page.locator("#progress-text")).toHaveText(
    "2 of 5 lessons completed"
  );

  await expect(page.locator("#progress-track")).toHaveAttribute(
    "aria-valuenow",
    "40"
  );
});