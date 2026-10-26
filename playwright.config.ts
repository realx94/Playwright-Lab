import { defineConfig, devices } from "@playwright/test";

// LAB_BUGS=BUG-01,BUG-02 tiêm bug vào lab qua cookie lab_bugs (dùng cho kiểm tra đáp án và chấm điểm).
const bugs = process.env.LAB_BUGS;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    storageState: bugs
      ? {
          cookies: [
            {
              name: "lab_bugs",
              value: bugs,
              domain: "localhost",
              path: "/",
              expires: -1,
              httpOnly: false,
              secure: false,
              sameSite: "Lax",
            },
          ],
          origins: [],
        }
      : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
