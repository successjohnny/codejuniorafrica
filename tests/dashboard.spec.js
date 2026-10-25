
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

test("shows the correct starting state for a new learner", async ({ page }) => {
  await expect(page.locator("#welcome-heading")).toHaveText(
    "Welcome back, Young Coder! 👋"
  );
  await expect(page.locator("#completed-count")).toHaveText("0");
  await expect(page.locator("#progress-percentage")).toHaveText("0%");
  await expect(page.locator("#badges-count")).toHaveText("0");
  await expect(page.locator("#remaining-count")).toHaveText("10");
  await expect(page.locator("#progress-track")).toHaveAttribute(
    "aria-valuenow",
    "0"
  );
});

test("saves a display name and keeps it after reload", async ({ page }) => {
  await page.locator("#display-name").fill("  StarCoder  ");
  await page.getByRole("button", { name: "Save Name" }).click();

  await expect(page.locator("#welcome-heading")).toHaveText(
    "Welcome back, StarCoder! 👋"
  );
  await expect(page.locator("#profile-feedback")).toContainText(
    "Your display name has been saved"
  );
  await expect(page.locator("#display-name")).toHaveValue("StarCoder");

  await expect.poll(async () => {
    return page.evaluate(
      (key) => localStorage.getItem(key),
      PROFILE_STORAGE_KEY
    );
  }).toBe("StarCoder");

  await page.reload();

  await expect(page.locator("#welcome-heading")).toHaveText(
    "Welcome back, StarCoder! 👋"
  );
  await expect(page.locator("#display-name")).toHaveValue("StarCoder");
});

test("rejects a display name that is too short", async ({ page }) => {
  await page.locator("#display-name").fill("A");

  // Dispatch submit directly to test JavaScript validation even when
  // the browser's built-in minlength validation would block a click.
  await page.locator("#profile-form").evaluate((form) => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
  });

  await expect(page.locator("#profile-feedback")).toContainText(
    "Please enter a name between 2 and 30 characters"
  );
  await expect(page.locator("#welcome-heading")).toHaveText(
    "Welcome back, Young Coder! 👋"
  );
  await expect.poll(async () => {
    return page.evaluate(
      (key) => localStorage.getItem(key),
      PROFILE_STORAGE_KEY
    );
  }).toBeNull();
});

test("does not save a blank display name", async ({ page }) => {
  await page.locator("#display-name").fill("   ");

  await page.locator("#profile-form").evaluate((form) => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
  });

  await expect(page.locator("#profile-feedback")).toContainText(
    "Please enter a name"
  );

  await expect.poll(async () => {
    return page.evaluate(
      (key) => localStorage.getItem(key),
      PROFILE_STORAGE_KEY
    );
  }).toBeNull();
});

test("changing the profile does not change lesson progress", async ({ page }) => {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify([0, 1, 3]));
  }, STORAGE_KEY);

  await page.reload();

  await page.locator("#display-name").fill("Code Explorer");
  await page.getByRole("button", { name: "Save Name" }).click();

  await expect(page.locator("#completed-count")).toHaveText("3");

  await expect.poll(async () => {
    return page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY
    );
  }).toBe(JSON.stringify([0, 1, 3]));
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