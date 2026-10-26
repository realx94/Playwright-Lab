import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

// Kiểm tra accessibility tự động (WCAG 2 A/AA). Chỉ chặn lỗi mức serious/critical.
const PAGES = [
  "/",
  "/learn",
  "/learn/2-05-locator-huong-nguoi-dung",
  "/labs",
  "/labs/login",
  "/stats",
  "/starter",
  "/glossary",
  "/cheatsheet",
  "/interview",
  "/placement",
  "/lab/login",
  "/lab/forms",
  "/lab/cart",
  "/lab/todo",
  "/lab/table",
  "/lab/playground",
  "/lab/otp",
  "/lab/inbox",
  "/lab/api",
];

for (const path of PAGES) {
  test(`a11y: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      blocking.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} phần tử, ví dụ ${v.nodes[0]?.target.join(" ")}`),
    ).toEqual([]);
  });
}
