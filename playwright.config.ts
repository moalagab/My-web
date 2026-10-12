import { defineConfig, devices } from "@playwright/test";

// Runs against the production build (`npm run build` first), served as static
// files with the same SPA fallback Vercel uses.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      // Locally, reuse the installed Google Chrome; CI downloads Chromium.
      use: { ...devices["Desktop Chrome"], ...(process.env.CI ? {} : { channel: "chrome" }) },
    },
  ],
});
