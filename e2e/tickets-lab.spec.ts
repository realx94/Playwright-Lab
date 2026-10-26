import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const T0 = new Date("2026-03-02T08:00:00Z");
const later = (context: BrowserContext, seconds: number) => context.clock.setFixedTime(new Date(T0.getTime() + seconds * 1000));

async function open(page: Page, context: BrowserContext, query = "") {
  await context.clock.setFixedTime(T0);
  await page.goto("/lab/tickets" + query);
  await page.getByTestId("reset-data").click();
}

async function create(
  page: Page,
  f: { title?: string; description?: string; priority?: string; file?: { name: string; mimeType: string; buffer: Buffer } } = {},
) {
  await page.getByLabel("Tiêu đề").fill(f.title ?? "Không đăng nhập được");
  await page.getByLabel("Mô tả").fill(f.description ?? "Khách báo lỗi 500 khi đăng nhập");
  await page.getByLabel("Mức ưu tiên").selectOption(f.priority ?? "medium");
  if (f.file) await page.getByLabel("Tệp đính kèm").setInputFiles(f.file);
  await page.getByRole("button", { name: "Tạo ticket" }).click();
}

const status = (page: Page) => page.getByTestId("ticket-status");
const move = (page: Page, to: string) => page.getByRole("button", { name: `Chuyển sang ${to}` }).click();

test("tạo ticket: mã, trạng thái Mới, hạn xử lý và SLA", async ({ page, context }) => {
  await open(page, context);
  await create(page, { file: { name: "loi.txt", mimeType: "text/plain", buffer: Buffer.from("log") } });
  await expect(page.getByTestId("ticket-message")).toHaveText("Đã tạo ticket T0001");
  await expect(page.getByTestId("ticket-row")).toHaveCount(1);
  await expect(status(page)).toHaveText("Mới");
  await expect(page.getByTestId("detail-attachment")).toHaveText("Tệp đính kèm: loi.txt");
  await expect(page.getByTestId("ticket-deadline")).toHaveText("Hạn xử lý: 2026-03-02 16:00 UTC");
  await expect(page.getByTestId("ticket-sla")).toHaveText("SLA: Còn 8 giờ 0 phút");
});

const sla: [string, string][] = [
  ["urgent", "2026-03-02 09:00"],
  ["high", "2026-03-02 12:00"],
  ["medium", "2026-03-02 16:00"],
  ["low", "2026-03-03 08:00"],
];
for (const [priority, deadline] of sla) {
  test(`hạn xử lý theo mức ưu tiên ${priority}`, async ({ page, context }) => {
    await open(page, context);
    await create(page, { priority });
    await expect(page.getByTestId("ticket-deadline")).toHaveText(`Hạn xử lý: ${deadline} UTC`);
  });
}

test("kiểm tra dữ liệu tạo ticket và biên độ dài", async ({ page, context }) => {
  await open(page, context);
  await create(page, { title: "Lỗi", description: "ngắn quá", priority: "" });
  await expect(page.getByTestId("error-title")).toHaveText("Tiêu đề từ 5 đến 100 ký tự");
  await expect(page.getByTestId("error-description")).toHaveText("Mô tả từ 10 đến 1000 ký tự");
  await expect(page.getByTestId("error-priority")).toHaveText("Hãy chọn mức ưu tiên");

  await create(page, { title: "x".repeat(101), description: "y".repeat(1001), priority: "low" });
  await expect(page.getByTestId("error-title")).toBeVisible();
  await expect(page.getByTestId("error-description")).toBeVisible();

  await create(page, { title: "Năm 5", description: "Mười ký tự", priority: "low" }); // biên 5 và 10 (đã cắt khoảng trắng)
  await expect(page.getByTestId("ticket-message")).toHaveText("Đã tạo ticket T0001");
});

test("tệp đính kèm: sai định dạng, quá 1 MB, đúng 1 MB", async ({ page, context }) => {
  await open(page, context);
  await create(page, { file: { name: "virus.exe", mimeType: "application/octet-stream", buffer: Buffer.from("x") } });
  await expect(page.getByTestId("error-file")).toHaveText("Tệp đính kèm chỉ nhận PNG, JPG, PDF, TXT");

  await create(page, { file: { name: "lon.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(1024 * 1024 + 1) } });
  await expect(page.getByTestId("error-file")).toHaveText("Tệp đính kèm tối đa 1 MB");

  await create(page, { file: { name: "vua.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(1024 * 1024) } });
  await expect(page.getByTestId("ticket-message")).toHaveText("Đã tạo ticket T0001");
});

test("SLA đếm ngược theo đồng hồ: còn 30 phút, đúng hạn chưa quá hạn, quá một giây thì Quá hạn", async ({ page, context }) => {
  await open(page, context);
  await create(page, { priority: "urgent" });
  await expect(page.getByTestId("ticket-sla")).toHaveText("SLA: Còn 1 giờ 0 phút");

  await later(context, 30 * 60);
  await expect(page.getByTestId("ticket-sla")).toHaveText("SLA: Còn 0 giờ 30 phút");
  await later(context, 60 * 60);
  await expect(page.getByTestId("ticket-sla")).toHaveText("SLA: Còn 0 giờ 0 phút");
  await later(context, 60 * 60 + 1);
  await expect(page.getByTestId("ticket-sla")).toHaveText("SLA: Quá hạn");
  await expect(page.getByTestId("ticket-row")).toContainText("Quá hạn");
});

test("luồng trạng thái: chỉ hiện chuyển đổi hợp lệ, giải quyết cần bình luận, đóng thì khoá", async ({ page, context }) => {
  await open(page, context);
  await create(page);
  await expect(page.getByRole("button", { name: /^Chuyển sang/ })).toHaveText(["Chuyển sang Đang xử lý"]);

  await move(page, "Đang xử lý");
  await expect(status(page)).toHaveText("Đang xử lý");
  await expect(page.getByRole("button", { name: /^Chuyển sang/ })).toHaveText(["Chuyển sang Chờ khách", "Chuyển sang Đã giải quyết"]);

  await move(page, "Chờ khách");
  await expect(page.getByRole("button", { name: /^Chuyển sang/ })).toHaveText(["Chuyển sang Đang xử lý"]);
  await move(page, "Đang xử lý");

  await move(page, "Đã giải quyết");
  await expect(page.getByTestId("ticket-message")).toHaveText("Cần ít nhất một bình luận trước khi giải quyết");
  await expect(status(page)).toHaveText("Đang xử lý");

  await page.getByRole("button", { name: "Gửi bình luận" }).click();
  await expect(page.getByTestId("ticket-message")).toHaveText("Bình luận không được để trống");
  await page.getByLabel("Bình luận", { exact: true }).fill("Đã reset mật khẩu cho khách");
  await page.getByRole("button", { name: "Gửi bình luận" }).click();
  await expect(page.getByTestId("comment")).toHaveText(["Đã reset mật khẩu cho khách"]);

  await move(page, "Đã giải quyết");
  await expect(status(page)).toHaveText("Đã giải quyết");
  await expect(page.getByRole("button", { name: /^Chuyển sang/ })).toHaveText(["Chuyển sang Đóng", "Chuyển sang Đang xử lý"]);
  await expect(page.getByTestId("ticket-sla")).toHaveText("SLA: Giải quyết đúng hạn");

  await move(page, "Đóng");
  await expect(page.getByRole("button", { name: /^Chuyển sang/ })).toHaveCount(0);
  await page.getByLabel("Bình luận", { exact: true }).fill("Thêm nữa");
  await page.getByRole("button", { name: "Gửi bình luận" }).click();
  await expect(page.getByTestId("ticket-message")).toHaveText("Ticket đã đóng, không thể bình luận");
  await expect(page.getByTestId("comment")).toHaveCount(1);
});

test("giải quyết sau hạn được ghi nhận là trễ hạn", async ({ page, context }) => {
  await open(page, context);
  await create(page, { priority: "urgent" });
  await move(page, "Đang xử lý");
  await page.getByLabel("Bình luận", { exact: true }).fill("Đang kiểm tra");
  await page.getByRole("button", { name: "Gửi bình luận" }).click();
  await later(context, 2 * 3600);
  await move(page, "Đã giải quyết");
  await expect(page.getByTestId("ticket-sla")).toHaveText("SLA: Giải quyết trễ hạn");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page, context }) => {
  await open(page, context, "?bugs=BUG-01,BUG-02,BUG-03");
  await create(page, { priority: "high" });
  await expect(page.getByTestId("ticket-deadline")).toHaveText("Hạn xử lý: 2026-03-02 16:00 UTC"); // BUG-01: 8 giờ thay vì 4

  await later(context, 8 * 3600);
  await expect(page.getByTestId("ticket-sla")).toHaveText("SLA: Quá hạn"); // BUG-02: đúng hạn đã bị tính quá hạn

  await move(page, "Đang xử lý");
  await page.getByLabel("Bình luận", { exact: true }).fill("ok");
  await page.getByRole("button", { name: "Gửi bình luận" }).click();
  await move(page, "Đã giải quyết");
  await move(page, "Đóng");
  await page.getByLabel("Bình luận", { exact: true }).fill("sau khi đóng");
  await page.getByRole("button", { name: "Gửi bình luận" }).click();
  await expect(page.getByTestId("comment")).toHaveCount(2); // BUG-03: ticket đóng vẫn nhận bình luận
});
