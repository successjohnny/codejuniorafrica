
// @ts-check
"use strict";

const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/lessons/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("displays the first Python lesson and ten lessons in total", async ({ page }) => {
  await expect(page.locator("#lesson-title")).toHaveText(
    "What Is Coding?"
  );

  await expect(page.locator("#lesson-number")).toHaveText(
    "Lesson 1 of 10"
  );

  await expect(page.locator(".lesson-item")).toHaveCount(10);

  await expect(page.locator("#progress-text")).toHaveText(
    "0 of 10 lessons completed"
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
    "1 of 10 lessons completed"
  );

  await page.reload();

  await expect(page.locator("#progress-text")).toHaveText(
    "1 of 10 lessons completed"
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
    "2 of 10 lessons completed"
  );

  await expect(page.locator("#progress-track")).toHaveAttribute(
    "aria-valuenow",
    "20"
  );
});

test("displays the data types lesson", async ({ page }) => {
  await page.locator(".lesson-item").nth(5).click();

  await expect(page.locator("#lesson-title")).toHaveText(
    "Understanding Python Data Types"
  );

  await expect(page.locator("#lesson-code")).toContainText(
    "is_learning = True"
  );

  await expect(page.locator("#lesson-explanation")).toContainText(
    "bool"
  );
});

test("displays the strings lesson", async ({ page }) => {
  await page.locator(".lesson-item").nth(6).click();

  await expect(page.locator("#lesson-title")).toHaveText(
    "Working with Strings"
  );

  await expect(page.locator("#lesson-code")).toContainText(
    "name.upper()"
  );
});

test("displays the if and else lesson", async ({ page }) => {
  await page.locator(".lesson-item").nth(7).click();

  await expect(page.locator("#lesson-title")).toHaveText(
    "Making Decisions with if and else"
  );

  await expect(page.locator("#lesson-code")).toContainText(
    "if age >= 10:"
  );
});

test("displays the loops lesson", async ({ page }) => {
  await page.locator(".lesson-item").nth(8).click();

  await expect(page.locator("#lesson-title")).toHaveText(
    "Repeating Actions with Loops"
  );

  await expect(page.locator("#lesson-code")).toContainText(
    "range(1, 4)"
  );
});

test("displays the functions lesson", async ({ page }) => {
  await page.locator(".lesson-item").nth(9).click();

  await expect(page.locator("#lesson-title")).toHaveText(
    "Creating Your Own Functions"
  );

  await expect(page.locator("#lesson-code")).toContainText(
    "def greet(name: str) -> str:"
  );
});

test("completes the data types lesson and updates progress", async ({ page }) => {
  await page.locator(".lesson-item").nth(5).click();

  await page.locator("#quiz-options button").nth(0).click();

  await expect(page.locator("#quiz-feedback")).toContainText(
    "🎉"
  );

  await expect(page.locator("#progress-text")).toHaveText(
    "1 of 10 lessons completed"
  );

  await expect(page.locator("#progress-track")).toHaveAttribute(
    "aria-valuenow",
    "10"
  );
});