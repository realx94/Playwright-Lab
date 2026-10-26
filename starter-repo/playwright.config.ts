import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Đọc BASE_URL từ file .env (xem .env.example). Mặc định chạy với site chạy local.
dotenv.config();

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

// LAB_BUGS=BUG-01 bật bug của lab qua cookie lab_bugs (do `npm run grade` dùng để kiểm tra test của bạn có bắt được lỗi).
const bugs = process.env.LAB_BUGS;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    storageState: bugs
      ? {
          cookies: [
            {
              name: "lab_bugs",
              value: bugs,
              domain: new URL(baseURL).hostname,
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
});
