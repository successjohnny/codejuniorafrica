
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

test("shows locked achievement badges and the next lesson at the start", async ({ page }) => {
  await expect(page.locator(".achievement-card")).toHaveCount(3);
  await expect(page.locator('[data-achievement-id="first-step"]')).toHaveClass(/locked/);
  await expect(page.locator("#next-lesson-text")).toContainText(
    "Lesson 1 — What Is Coding?"
  );
});

test("unlocks the first badge after completing one lesson and keeps it after refresh", async ({ page }) => {
  await page.locator("#quiz-options button").nth(0).click();

  await expect(page.locator('[data-achievement-id="first-step"]')).toHaveClass(/unlocked/);
  await expect(page.locator('[data-achievement-id="halfway-hero"]')).toHaveClass(/locked/);
  await expect(page.locator("#next-lesson-text")).toContainText(
    "Lesson 2 — Your First Python Program"
  );

  await page.reload();

  await expect(page.locator('[data-achievement-id="first-step"]')).toHaveClass(/unlocked/);
  await expect(page.locator("#progress-text")).toHaveText(
    "1 of 10 lessons completed"
  );
});

test("continue learning opens the next incomplete lesson", async ({ page }) => {
  await page.locator(".lesson-item").nth(0).click();
  await page.locator("#quiz-options button").nth(0).click();
  await page.locator(".lesson-item").nth(2).click();
  await page.locator("#quiz-options button").nth(1).click();

  await page.locator("#continue-learning-btn").click();

  await expect(page.locator("#lesson-title")).toHaveText(
    "Your First Python Program"
  );
});

test("shows the course-complete state when all lessons are completed", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      "codejuniorafrica_python_progress_v1",
      JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    );
  });
  await page.reload();

  await expect(page.locator('[data-achievement-id="first-step"]')).toHaveClass(/unlocked/);
  await expect(page.locator('[data-achievement-id="halfway-hero"]')).toHaveClass(/unlocked/);
  await expect(page.locator('[data-achievement-id="python-champion"]')).toHaveClass(/unlocked/);
  await expect(page.locator("#continue-learning-btn")).toBeDisabled();
  await expect(page.locator("#next-lesson-text")).toContainText(
    "completed every Python lesson"
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

test.describe("Python Playground page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      class MockWorker {
        onmessage = null;
        onerror = null;
        constructor() {
          window.setTimeout(() => {
            this.onmessage?.({ data: { type: "ready" } });
          }, 0);
        }
        postMessage(message) {
          if (message.type === "initialize") return;
          if (message.type === "run") {
            const code = message.code;
            let stdout = "Program finished without printing anything.";
            let stderr = "";
            let hasError = false;
            if (code.includes("print(") && code.includes("Hello from Python!")) {
              stdout = "Hello from Python!";
            } else if (code.includes("raise ValueError")) {
              stdout = "";
              stderr = "ValueError: example error";
              hasError = true;
            }
            window.setTimeout(() => {
              this.onmessage?.({ data: { type: "result", stdout, stderr, hasError } });
            }, 0);
          }
        }
        terminate() {}
      }
      // @ts-ignore - replace Worker with a predictable test double.
      window.Worker = MockWorker;
    });
    await page.goto("/playground/index.html");
  });

  test("loads the editor and starter examples", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Python Playground" })).toBeVisible();
    await expect(page.locator("#python-code")).toHaveValue(/Hello, Africa!/);
    await expect(page.locator("button[data-example]")).toHaveCount(5);
    await expect(page.locator("#run-code")).toBeEnabled();
  });

  test("loads a data types example into the editor", async ({ page }) => {
    await page.locator('[data-example="types"]').click();
    await expect(page.locator("#python-code")).toHaveValue(/is_learning = True/);
    await expect(page.locator("#python-code")).toHaveValue(/type\(name\)/);
  });

  test("shows program output after Run Code is clicked", async ({ page }) => {
    await page.locator("#python-code").fill('print("Hello from Python!")');
    await page.locator("#run-code").click();
    await expect(page.locator("#python-output")).toHaveText("Hello from Python!");
  });

  test("shows an error returned by the Python runtime", async ({ page }) => {
    await page.locator("#python-code").fill("raise ValueError('example error')");
    await page.locator("#run-code").click();
    await expect(page.locator("#python-output")).toContainText("ValueError: example error");
    await expect(page.locator("#python-output")).toHaveAttribute("data-state", "error");
  });
});
