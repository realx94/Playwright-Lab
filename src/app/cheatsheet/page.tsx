import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Cheat sheet Playwright" };

interface Section {
  title: string;
  items: { code: string; note: string }[];
}

const SECTIONS: Section[] = [
  {
    title: "Locator (ưu tiên từ trên xuống)",
    items: [
      { code: 'page.getByRole("button", { name: "Đăng nhập" })', note: "Theo vai trò và tên truy cập được" },
      { code: 'page.getByLabel("Email")', note: "Ô nhập theo nhãn" },
      { code: 'page.getByPlaceholder("Mã giảm giá")', note: "Theo chữ gợi ý trong ô nhập" },
      { code: 'page.getByText("Tổng cộng")', note: "Theo chữ hiển thị (cẩn thận trùng lặp)" },
      { code: 'page.getByTestId("dashboard")', note: "Theo data-testid" },
      { code: 'card.getByRole("button").filter({ hasText: "Thêm" })', note: "Chaining và lọc" },
    ],
  },
  {
    title: "Thao tác",
    items: [
      { code: 'await locator.fill("text")', note: "Điền ô nhập (thay nội dung cũ)" },
      { code: "await locator.click()", note: "Bấm" },
      { code: "await locator.check() / uncheck()", note: "Checkbox, radio, switch" },
      { code: 'await locator.selectOption("vn")', note: "Thẻ select native" },
      { code: 'await locator.setInputFiles({ name, mimeType, buffer })', note: "Upload tệp" },
      { code: 'await locator.press("Enter")', note: "Nhấn phím" },
      { code: "await locator.hover()", note: "Di chuột lên phần tử" },
      { code: "await source.dragTo(target)", note: "Kéo thả" },
    ],
  },
  {
    title: "Assertion (web-first, tự thử lại)",
    items: [
      { code: "await expect(locator).toBeVisible()", note: "Đang hiển thị" },
      { code: "await expect(locator).toBeHidden()", note: "Ẩn hoặc không tồn tại" },
      { code: 'await expect(locator).toHaveText("...")', note: "Khớp toàn bộ chữ" },
      { code: 'await expect(locator).toContainText("...")', note: "Chứa đoạn chữ" },
      { code: 'await expect(locator).toHaveValue("...")', note: "Giá trị của ô nhập" },
      { code: "await expect(locator).toHaveCount(3)", note: "Số lượng phần tử" },
      { code: "await expect(locator).toBeEnabled() / toBeChecked()", note: "Trạng thái" },
      { code: 'await expect(page).toHaveURL(/dashboard/)', note: "Địa chỉ hiện tại" },
    ],
  },
  {
    title: "Cấu trúc test",
    items: [
      { code: 'test("tên", async ({ page }) => { ... })', note: "Một test" },
      { code: 'test.describe("nhóm", () => { ... })', note: "Nhóm test" },
      { code: "test.beforeEach(async ({ page }) => { ... })", note: "Chạy trước mỗi test" },
      { code: 'await test.step("bước", async () => { ... })', note: "Chia bước trong báo cáo" },
      { code: "test.fixme / test.skip / test.only", note: "Bỏ qua, nhắc việc, chỉ chạy test này" },
    ],
  },
  {
    title: "Dòng lệnh",
    items: [
      { code: "npx playwright test", note: "Chạy tất cả" },
      { code: 'npx playwright test -g "tên"', note: "Lọc theo tên/tag" },
      { code: "npx playwright test --headed", note: "Hiện cửa sổ trình duyệt" },
      { code: "npx playwright test --ui", note: "UI Mode" },
      { code: "npx playwright test --debug", note: "Inspector, chạy từng bước" },
      { code: "npx playwright show-report", note: "Mở báo cáo HTML" },
      { code: "npx playwright show-trace trace.zip", note: "Mở trace" },
      { code: "npx playwright codegen <url>", note: "Ghi thao tác thành code" },
    ],
  },
  {
    title: "playwright.config.ts",
    items: [
      { code: 'use: { baseURL: "http://localhost:3000" }', note: "Địa chỉ gốc" },
      { code: 'use: { trace: "on-first-retry" }', note: "Ghi trace khi retry" },
      { code: 'use: { screenshot: "only-on-failure" }', note: "Chụp ảnh khi lỗi" },
      { code: "retries: process.env.CI ? 2 : 0", note: "Thử lại trên CI" },
      { code: "fullyParallel: true", note: "Chạy song song cả trong file" },
      { code: 'reporter: [["list"], ["html", { open: "never" }]]', note: "Nhiều reporter" },
    ],
  },
];

export default function CheatsheetPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Cheat sheet Playwright</h1>
      <p className="mt-2 text-muted-foreground">Tra cứu nhanh locator, thao tác, assertion và lệnh thường dùng.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {s.items.map((i) => (
                  <li key={i.code}>
                    <code className="block overflow-x-auto rounded bg-muted px-2 py-1 text-xs">{i.code}</code>
                    <span className="text-xs text-muted-foreground">{i.note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
