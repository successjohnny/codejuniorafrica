
 // @ts-check
"use strict";

const { test, expect } = require("@playwright/test");

test("runs real Python code using Pyodide", async ({ page }) => {
  // Pyodide needs time to download and initialize in the browser.
  test.setTimeout(120_000);

  await page.goto("/playground/index.html");

  // Wait for the real worker and Python runtime, not the mock worker.
  await expect(page.locator("#runtime-status")).toContainText(
    "Python is ready",
    { timeout: 70_000 }
  );

  // Verify actual Python execution and Python data types.
  await page.locator("#python-code").fill(
    'name = "Amina"\nage = 12\nprint(name)\nprint(type(age).__name__)'
  );

  await page.locator("#run-code").click();

  await expect(page.locator("#python-output")).toHaveText(
    "Amina\nint",
    { timeout: 15_000 }
  );

  await expect(page.locator("#python-output")).toHaveAttribute(
    "data-state",
    "success"
  );

  // Verify that a Python runtime error is displayed to the learner.
  await page.locator("#python-code").fill("print(1 / 0)");
  await page.locator("#run-code").click();

  await expect(page.locator("#python-output")).toContainText(
    "ZeroDivisionError",
    { timeout: 15_000 }
  );

  await expect(page.locator("#python-output")).toHaveAttribute(
    "data-state",
    "error"
  );
});