import { test, expect } from "@playwright/test";

const PAGES: [string, string][] = [
  ["/learn/0-1-tong-quan-automation", "Kim tự tháp kiểm thử"],
  ["/learn/1-01-git-co-ban", "Ba vùng của Git"],
  ["/learn/2-01-html-dom", "Cây DOM"],
  ["/learn/4-01-page-object-model", "Page Object Model"],
  ["/learn/5-01-ci-cd-github-actions", "Luồng CI"],
  ["/learn/2-05-locator-huong-nguoi-dung", "Thứ tự ưu tiên chọn locator"],
];

for (const [url, label] of PAGES) {
  test(`sơ đồ trên ${url} hiển thị, có mô tả và không bị cắt`, async ({ page }) => {
    await page.goto(url);
    const svg = page.getByRole("img", { name: new RegExp(label) });
    await expect(svg).toBeVisible();
    await expect(page.getByTestId("diagram").first().locator("figcaption")).not.toBeEmpty();
    // Không có khối code thô chứa tên sơ đồ
    await expect(page.locator("pre", { hasText: /^(pyramid|git-areas|dom-tree|pom|ci-flow|locator-priority)$/ })).toHaveCount(0);
    const box = await svg.boundingBox();
    expect(box!.width).toBeGreaterThan(200);
    expect(box!.height).toBeGreaterThan(80);
  });
}

test("sơ đồ đổi màu theo chế độ sáng và tối", async ({ page }) => {
  await page.goto("/learn/1-01-git-co-ban");
  const rect = page.getByTestId("diagram").first().locator("rect").first();
  const fill = () => rect.evaluate((el) => getComputedStyle(el).fill);
  await page.evaluate(() => document.documentElement.classList.remove("dark"));
  const light = await fill();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  const dark = await fill();
  expect(light).not.toBe(dark);
});

test("không có chữ tràn ra ngoài khung SVG", async ({ page }) => {
  for (const [url] of PAGES) {
    await page.goto(url);
    const bad = await page.getByTestId("diagram").first().evaluate((fig) => {
      const svg = fig.querySelector("svg")!;
      const vb = svg.viewBox.baseVal;
      return [...svg.querySelectorAll("text")]
        .map((t) => ({ t: t.textContent, b: t.getBBox() }))
        .filter(({ b }) => b.x < -1 || b.x + b.width > vb.width + 1 || b.y < -1 || b.y + b.height > vb.height + 1)
        .map((x) => x.t);
    });
    expect(bad, url).toEqual([]);
  }
});
