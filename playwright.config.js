
// @ts-check
"use strict";

const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "retain-on-failure"
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],

  webServer: {
    command: "python3 -m http.server 8000 --bind 127.0.0.1",
    url: "http://127.0.0.1:8000",
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});