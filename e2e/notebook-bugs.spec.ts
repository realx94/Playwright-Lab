import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const LESSON = "/learn/0-1-tong-quan-automation";

async function askTerm(page: Page, context: import("@playwright/test").BrowserContext, text: string) {
  await page.goto(LESSON);
  await page.getByRole("heading", { name: "Giải thích dễ hiểu" }).scrollIntoViewIfNeeded();
  await page.locator("[data-ask-ai] strong", { hasText: text }).first().selectText();
  const btn = page.getByRole("button", { name: "Hỏi Google AI" }).first();
  await expect(btn).toBeVisible();
  await Promise.all([context.waitForEvent("page"), btn.click()]);
}

test.describe("Sổ tay của tôi", () => {
  test("trống lúc đầu, lưu thuật ngữ đã hỏi, hỏi lại tăng số lần, xoá được", async ({ page, context }) => {
    await page.goto("/stats");
    await expect(page.getByTestId("notebook-empty")).toBeVisible();

    await askTerm(page, context, "manual");
    await page.goto("/stats");
    await expect(page.getByTestId("notebook-item")).toHaveCount(1);
    await expect(page.getByTestId("notebook-term")).toHaveText("manual testing");
    await expect(page.getByTestId("notebook-item")).toContainText("hỏi 1 lần");
    await expect(page.getByTestId("stat-asks")).toHaveText("1");

    const [popup] = await Promise.all([context.waitForEvent("page"), page.getByRole("button", { name: "Hỏi lại: manual testing" }).click()]);
    expect(popup.url()).toContain("google.com/search");
    await expect(page.getByTestId("notebook-item")).toContainText("hỏi 2 lần");
    await expect(page.getByTestId("notebook-item")).toHaveCount(1); // cùng một từ được gộp, không thêm dòng

    await page.getByRole("button", { name: "Xoá khỏi sổ tay: manual testing" }).click();
    await expect(page.getByTestId("notebook-empty")).toBeVisible();
    await expect(page.getByTestId("stat-asks")).toHaveText("0");
  });
});

test.describe("Bug đã tìm", () => {
  const attempt = (exerciseId: string, labSlug: string, checked: number, total: number) => ({
    id: `${exerciseId}-${checked}`, exerciseId, labSlug, checked, total, hintsUsed: 0, solutionViewed: false, takenAt: 1_700_000_000_000, graded: true,
  });

  async function importAttempts(page: Page, attempts: unknown[]) {
    await page.goto("/stats");
    await page.getByTestId("import-input").setInputFiles({
      name: "data.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ schemaVersion: 1, exportedAt: 1, lessonProgress: [], quizAttempts: [], askAiHistory: [], exerciseAttempts: attempts })),
    });
  }

  test("bắt đầu từ 0 và liệt kê mọi lab có bài bắt bug", async ({ page }) => {
    await page.goto("/stats");
    await expect(page.getByTestId("bug-total")).toHaveText(/^Bạn đã tìm 0\/\d+ bug$/);
    expect(await page.getByTestId("bug-row").count()).toBeGreaterThan(20);
  });

  test("chỉ bài đạt đủ tiêu chí mới được tính, mỗi bug một lần, lab nhiều bug xếp trên", async ({ page }) => {
    await importAttempts(page, [
      attempt("login-3", "login", 4, 4), // BUG-02 của login: đạt
      attempt("login-3", "login", 3, 4), // cùng bài nhưng lần khác chưa đạt: không làm tăng gấp đôi
      attempt("login-1", "login", 2, 4), // chưa đạt
    ]);
    await expect(page.getByTestId("bug-total")).toHaveText(/^Bạn đã tìm 1\/\d+ bug$/);
    const first = page.getByTestId("bug-row").first();
    await expect(first).toHaveAttribute("data-lab", "login");
    await expect(first.getByTestId("bug-found")).toHaveText(/^1\/\d+$/);
  });
});

test.describe("Kiểm tra nội dung (npm run check:content)", () => {
  const script = path.join(process.cwd(), "scripts", "check-content.mjs");
  const run = (root: string) => {
    try {
      return { code: 0, out: execFileSync("node", [script], { env: { ...process.env, CONTENT_ROOT: root }, encoding: "utf8" }) };
    } catch (e) {
      const err = e as { status: number; stderr: string };
      return { code: err.status, out: err.stderr };
    }
  };

  function fixture(files: Record<string, string>) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "content-"));
    fs.mkdirSync(path.join(root, "src", "content", "learn"), { recursive: true });
    fs.mkdirSync(path.join(root, "src", "lib", "labs"), { recursive: true });
    fs.writeFileSync(path.join(root, "src", "lib", "labs", "registry.ts"), '{ slug: "login" },');
    for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(root, "src", "content", "learn", name), body);
    return root;
  }
  const fm = (order: number) => `---\ntitle: A\nlevel: 1\norder: ${order}\nminutes: 5\nsummary: s\nkeywords: [x]\n---\n`;

  test("nội dung thật của repo hợp lệ", () => {
    const r = run(process.cwd());
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(/Nội dung hợp lệ: \d+ bài học, \d+ lab/);
  });

  test("phát hiện link hỏng, code fence lẻ, thiếu frontmatter và trùng thứ tự", () => {
    const root = fixture({
      "1-01-a.md": `${fm(1)}Xem [lab](/labs/khong-co) và \`/lab/login\` và [bài](/learn/1-99-x).\n\`\`\`ts\nlet a = 1;\n`,
      "1-02-b.md": "không có frontmatter",
      "1-03-c.md": `${fm(1)}ok`,
    });
    const r = run(root);
    expect(r.code).toBe(1);
    expect(r.out).toContain("link nội bộ hỏng: /labs/khong-co");
    expect(r.out).toContain("link nội bộ hỏng: /learn/1-99-x");
    expect(r.out).not.toContain("/lab/login"); // đường dẫn hợp lệ không bị báo
    expect(r.out).toContain("code fence");
    expect(r.out).toContain("thiếu frontmatter");
    expect(r.out).toContain("trùng level/order 1.1");
  });

  test("link hợp lệ và code mẫu có chứa link giả không bị báo", () => {
    const root = fixture({ "1-01-a.md": `${fm(1)}[ok](/labs/login) [trang](/starter)\n\`\`\`md\n[giả](/labs/khong-co)\n\`\`\`\n` });
    const r = run(root);
    expect(r.code, r.out).toBe(0);
  });
});
