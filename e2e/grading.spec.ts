import { test, expect } from "@playwright/test";

const result = (over: Record<string, unknown> = {}) => ({
  version: 1,
  exerciseId: "login-4",
  lab: "login",
  cleanPassed: true,
  bugs: [{ id: "BUG-01", caught: true }],
  gradedAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

const upload = (page: import("@playwright/test").Page, body: unknown) =>
  page.getByTestId("grade-input").setInputFiles({
    name: "grade-login-4.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(body)),
  });

test("tải kết quả chấm tự động và hiện trong lịch sử với nhãn Chấm tự động", async ({ page }) => {
  await page.goto("/stats");
  await upload(page, result());
  const row = page.getByTestId("exercise-history").getByRole("listitem").first();
  await expect(row).toContainText("login-4");
  await expect(row).toContainText("Chấm tự động");
  await expect(row).toContainText("2/2");
});

test("bug lọt qua thì điểm thấp hơn; lab sạch chưa xanh thì bug không được tính", async ({ page }) => {
  await page.goto("/stats");
  await upload(page, result({ bugs: [{ id: "BUG-01", caught: false }] }));
  await expect(page.getByTestId("exercise-history").getByRole("listitem").first()).toContainText("1/2");

  await upload(page, result({ cleanPassed: false, bugs: [{ id: "BUG-01", caught: true }] }));
  await expect(page.getByTestId("exercise-history").getByRole("listitem").first()).toContainText("0/2");
});

test("file sai định dạng hoặc không khớp bài tập bị từ chối", async ({ page }) => {
  await page.goto("/stats");
  await upload(page, { hello: "world" });
  await expect(page.getByText("không phải kết quả chấm hợp lệ")).toBeVisible();

  await upload(page, result({ exerciseId: "khong-co" }));
  await expect(page.getByText(/Không biết bài tập/)).toBeVisible();

  await upload(page, result({ bugs: [] }));
  await expect(page.getByText(/không khớp phiên bản bài tập/)).toBeVisible();
  await expect(page.getByTestId("exercise-history")).toHaveCount(0);
});

test("bài tập hiển thị lệnh chấm tự động", async ({ page }) => {
  await page.goto("/labs/login");
  await page.getByTestId("exercise-login-4").getByRole("button").first().click();
  await expect(page.getByTestId("grade-hint-login-4")).toContainText("npm run grade -- --exercise login-4");
  await expect(page.getByTestId("grade-hint-login-4")).toContainText("BUG-01");
});
