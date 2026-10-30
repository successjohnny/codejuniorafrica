
const { test, expect } = require("@playwright/test");

test.describe("Personal Profile Challenge", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/website-course/challenges/profile.html");
    });

    test("loads the starter HTML and CSS", async ({ page }) => {
        await expect(page.locator("#html-code")).toHaveValue(
            /Hello, I'm Alex!/
        );
        await expect(page.locator("#css-code")).toHaveValue(/\.profile/);
        await expect(page.locator("#website-preview")).toBeVisible();
    });

    test("updates the preview when HTML is changed", async ({ page }) => {
        await page.locator("#html-code").fill(
            "<main><h1>Hello, John!</h1></main>"
        );

        await page.locator("#preview-button").click();

        const preview = page.frameLocator("#website-preview");

        await expect(preview.locator("h1")).toHaveText("Hello, John!");
        await expect(page.locator("#editor-message")).toContainText(
            "Preview updated"
        );
    });

    test("applies CSS changes to the preview", async ({ page }) => {
        await page.locator("#html-code").fill("<h1>Test heading</h1>");
        await page.locator("#css-code").fill(
            "h1 { color: rgb(255, 0, 0); }"
        );

        await page.locator("#preview-button").click();

        const heading = page.frameLocator("#website-preview").locator("h1");

        await expect(heading).toHaveText("Test heading");
        await expect(heading).toHaveCSS("color", "rgb(255, 0, 0)");
    });

    test("updates the checklist completion message", async ({ page }) => {
        const items = page.locator(
            '.check-item input[type="checkbox"]'
        );

        await expect(items).toHaveCount(5);

        await items.nth(0).check();

        await expect(page.locator("#checklist-message")).toContainText(
            "1 of 5"
        );

        for (let index = 1; index < 5; index += 1) {
            await items.nth(index).check();
        }

        await expect(page.locator("#checklist-message")).toContainText(
            "completed every challenge checklist item"
        );
    });

    test("resets the starter code and checklist", async ({ page }) => {
        await page.locator("#html-code").fill(
            "<h1>My custom profile</h1>"
        );
        await page.locator("#css-code").fill(
            "body { background: pink; }"
        );

        const items = page.locator(
            '.check-item input[type="checkbox"]'
        );

        await items.nth(0).check();
        await items.nth(2).check();

        await page.locator("#reset-button").click();

        await expect(page.locator("#html-code")).toHaveValue(
            /Hello, I'm Alex!/
        );
        await expect(page.locator("#css-code")).toHaveValue(/\.profile/);

        for (let index = 0; index < 5; index += 1) {
            await expect(items.nth(index)).not.toBeChecked();
        }

        await expect(page.locator("#checklist-message")).toContainText(
            "0 of 5"
        );

        await expect(page.locator("#editor-message")).toContainText(
            "Starter code restored"
        );

        const preview = page.frameLocator("#website-preview");

        await expect(preview.locator("h1")).toHaveText(
            "Hello, I'm Alex!"
        );
    });
});