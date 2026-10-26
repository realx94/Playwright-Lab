import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

interface Q {
  prompt: string;
  type: "single" | "multi";
  options: { id: string; text: string }[];
  answer: string[];
}
const bank = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src", "content", "quiz", "placement.json"), "utf8"),
).questions as Q[];

/** Trả lời toàn bộ bài kiểm tra: đúng hết hoặc cố ý chọn sai hết. */
async function answerAll(page: Page, correct: boolean) {
  for (const q of bank) {
    const box = page.locator("fieldset", { hasText: q.prompt });
    const picks = q.options.filter((o) => q.answer.includes(o.id) === correct);
    // Với câu chọn nhiều, chọn sai = chỉ chọn một đáp án sai.
    const chosen = q.type === "multi" && !correct ? picks.slice(0, 1) : picks.slice(0, q.type === "single" ? 1 : picks.length);
    for (const o of chosen) {
      await box.getByRole(q.type === "single" ? "radio" : "checkbox", { name: o.text, exact: true }).click();
    }
  }
  await page.getByRole("button", { name: "Nộp bài" }).click();
}

test("làm đúng hết thì gợi ý bắt đầu từ Level 5", async ({ page }) => {
  await page.goto("/placement?seed=1");
  await expect(page.getByTestId("question-0")).toBeVisible();
  await answerAll(page, true);
  await expect(page.getByTestId("placement-result")).toContainText("Level 5");
  await expect(page.getByTestId("placement-level-1")).toHaveText(/3\/3/);
});

test("làm sai hết thì gợi ý bắt đầu từ Level 0 và dẫn tới bài đầu tiên", async ({ page }) => {
  await page.goto("/placement?seed=2");
  await expect(page.getByTestId("question-0")).toBeVisible();
  await answerAll(page, false);
  await expect(page.getByTestId("placement-result")).toContainText("Level 0");
  await page.getByTestId("placement-start").click();
  await expect(page).toHaveURL(/\/learn\/0-1-tong-quan-automation/);
});

test("trang Bài học có liên kết tới bài kiểm tra đầu vào", async ({ page }) => {
  await page.goto("/learn");
  await page.getByTestId("placement-link").click();
  await expect(page).toHaveURL(/\/placement/);
});

test("ngân hàng phỏng vấn: lọc theo chủ đề và mở đáp án", async ({ page }) => {
  await page.goto("/interview");
  await expect(page.getByTestId("interview-count")).toHaveText("24 câu hỏi");
  await page.getByRole("button", { name: "CI/CD", exact: true }).click();
  await expect(page.getByTestId("interview-count")).toHaveText("2 câu hỏi");

  await page.getByRole("button", { name: /Chạy test lúc 6 giờ sáng/ }).click();
  await expect(page.getByText("23:00 UTC hôm trước")).toBeVisible();
});

test("tìm kiếm Ctrl+K thấy câu hỏi phỏng vấn", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("open-search").click();
  await page.getByPlaceholder(/Tìm bài học/).fill("storageState");
  await expect(page.getByRole("option", { name: /đăng nhập một lần/i })).toBeVisible();
});
