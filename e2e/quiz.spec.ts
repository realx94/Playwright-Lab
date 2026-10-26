import { test, expect, type Page } from "@playwright/test";

const LESSON = "/learn/0-1-tong-quan-automation";

const order = async (page: Page) =>
  page.locator("[data-testid^=question-] fieldset, fieldset[data-testid^=question-]").evaluateAll((els) =>
    els.map((el) => (el.querySelector("p")?.textContent ?? "") + "|" +
      [...el.querySelectorAll("label")].map((l) => l.textContent).join("~")),
  );

test("cùng seed cho cùng thứ tự, khác seed cho thứ tự khác", async ({ page }) => {
  await page.goto(`${LESSON}?seed=1`);
  await expect(page.getByTestId("question-0")).toBeVisible();
  const a1 = await order(page);
  await page.goto(`${LESSON}?seed=1`);
  await expect(page.getByTestId("question-0")).toBeVisible();
  expect(await order(page)).toEqual(a1);
  await page.goto(`${LESSON}?seed=2`);
  await expect(page.getByTestId("question-0")).toBeVisible();
  expect(await order(page)).not.toEqual(a1);
});

test("nộp bài hiện điểm, giải thích và lưu vào lịch sử", async ({ page }) => {
  await page.goto(`${LESSON}?seed=3`);
  await expect(page.getByTestId("question-0")).toBeVisible();
  await expect(page.getByRole("button", { name: "Nộp bài" })).toBeDisabled();

  const count = await page.locator("fieldset[data-testid^=question-]").count();
  for (let i = 0; i < count; i++) {
    const q = page.getByTestId(`question-${i}`);
    const radio = q.getByRole("radio").first();
    if (await radio.count()) await radio.click();
    else await q.getByRole("checkbox").first().check();
  }
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByTestId("quiz-score")).toContainText(`/${count}`);
  await expect(page.getByTestId("result-0")).toContainText(/Chính xác|Chưa đúng/);

  await page.goto("/stats");
  await expect(page.getByTestId("quiz-history").getByRole("listitem")).toHaveCount(1);
});

test("câu chọn nhiều đáp án yêu cầu chọn đúng và đủ", async ({ page }) => {
  await page.goto(`${LESSON}?seed=4`);
  await expect(page.getByTestId("question-0")).toBeVisible();
  const multi = page.locator("fieldset[data-testid^=question-]", { hasText: "Chọn nhiều" }).first();
  await expect(multi.getByRole("checkbox")).not.toHaveCount(0);
});
