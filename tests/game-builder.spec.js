
"use strict";

const { test, expect } = require("@playwright/test");

test.describe("Jungle Treasure Adventure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/game-builder/index.html");
  });

  async function getPlayerPosition(page) {
    return page.locator("#game-canvas").evaluate((canvas) => ({
      x: Number(canvas.dataset.playerX),
      y: Number(canvas.dataset.playerY)
    }));
  }

  test("shows the adventure title, mission and initial score", async ({
    page
  }) => {
    await expect(page).toHaveTitle(/Jungle Treasure Adventure/);

    await expect(
      page.getByRole("heading", { name: "Jungle Treasure Adventure" })
    ).toBeVisible();

    await expect(page.locator("#score")).toHaveText("0");
    await expect(page.locator("#start-overlay")).toBeVisible();

    expect(await getPlayerPosition(page)).toEqual({
      x: 65,
      y: 65
    });
  });

  test("loads the jungle artwork successfully", async ({ page }) => {
    const response = await page.request.get(
      "/assets/jungle-treasure-adventure.png"
    );

    expect(response.ok()).toBeTruthy();

    await expect(page.locator("#game-canvas")).toHaveAttribute(
      "data-background",
      "image"
    );
  });

  test("displays the fallback when jungle artwork fails to load", async ({
    page
  }) => {
    await page.route(
      "**/assets/jungle-treasure-adventure.png",
      (route) => route.abort()
    );

    await page.reload();

    await expect(page.locator("#game-status")).toContainText(
      "artwork could not load"
    );

    await expect(page.locator("#game-canvas")).toHaveAttribute(
      "data-background",
      "fallback"
    );
  });

  test("starts the adventure", async ({ page }) => {
    await page.getByRole("button", { name: /Start Adventure/ }).click();

    await expect(page.locator("#start-overlay")).toHaveClass(/is-hidden/);

    await expect(page.locator("#game-status")).toContainText(
      "Adventure started"
    );
  });

  test("moves the explorer with the keyboard", async ({ page }) => {
    await page.getByRole("button", { name: /Start Adventure/ }).click();

    const before = await getPlayerPosition(page);

    await page.keyboard.down("ArrowRight");

    await expect
      .poll(async () => {
        const position = await getPlayerPosition(page);
        return position.x;
      })
      .toBeGreaterThan(before.x);

    await page.keyboard.up("ArrowRight");

    const afterRelease = await getPlayerPosition(page);

    await page.waitForTimeout(150);

    const afterWaiting = await getPlayerPosition(page);

    expect(afterWaiting.x).toBeCloseTo(afterRelease.x, 0);
  });

  test("supports continuous movement with mobile direction controls", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.getByRole("button", { name: /Start Adventure/ }).click();

    const moveRightButton = page.getByRole("button", {
      name: "Move right"
    });

    await expect(moveRightButton).toBeVisible();

    const before = await getPlayerPosition(page);

    await moveRightButton.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0
    });

    await expect
      .poll(async () => {
        const position = await getPlayerPosition(page);
        return position.x;
      })
      .toBeGreaterThan(before.x + 15);

    await moveRightButton.dispatchEvent("pointerup", {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0
    });

    const afterRelease = await getPlayerPosition(page);

    await page.waitForTimeout(150);

    const afterWaiting = await getPlayerPosition(page);

    expect(afterWaiting.x).toBeCloseTo(afterRelease.x, 0);
  });

  test("restart returns the game to its initial state", async ({ page }) => {
    await page.getByRole("button", { name: /Start Adventure/ }).click();

    await page.keyboard.down("ArrowRight");

    await expect
      .poll(async () => {
        const position = await getPlayerPosition(page);
        return position.x;
      })
      .toBeGreaterThan(65);

    await page.keyboard.up("ArrowRight");

    await page.getByRole("button", { name: "Restart" }).click();

    await expect(page.locator("#score")).toHaveText("0");
    await expect(page.locator("#start-overlay")).toBeVisible();

    await expect(page.locator("#win-overlay")).toHaveClass(/is-hidden/);

    expect(await getPlayerPosition(page)).toEqual({
      x: 65,
      y: 65
    });
  });
});