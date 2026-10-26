import { test, expect, type BrowserContext, type Page } from "@playwright/test";

// Giờ giả cố định để ngày trong test luôn hợp lệ: thứ Hai 02/03/2026.
const NOW = new Date("2026-03-02T09:00:00");

async function open(page: Page, context: BrowserContext, query = "") {
  await context.clock.setFixedTime(NOW);
  await page.goto("/lab/leave" + query);
  await page.getByTestId("reset-data").click();
}

async function send(
  page: Page,
  o: { from: string; to: string; type?: string; reason?: string },
) {
  if (o.type) await page.getByLabel("Loại nghỉ").selectOption(o.type);
  await page.getByLabel("Từ ngày").fill(o.from);
  await page.getByLabel("Đến ngày").fill(o.to);
  await page.getByLabel("Lý do").fill(o.reason ?? "Đi công tác gia đình xa");
  await page.getByRole("button", { name: "Gửi đơn" }).click();
}

async function managerTab(context: BrowserContext) {
  const mgr = await context.newPage();
  await mgr.goto("/lab/leave");
  await mgr.getByLabel("Vai trò").selectOption("manager");
  return mgr;
}

const error = (page: Page) => page.getByTestId("leave-error");

test("gửi đơn hợp lệ: chờ duyệt, tính đủ 3 ngày, chưa trừ phép", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-03-09", to: "2026-03-11" });
  await expect(page.getByTestId("leave-status-1")).toHaveText("Chờ duyệt");
  await expect(page.getByTestId("leave-days-1")).toHaveText("3");
  await expect(page.getByTestId("leave-balance")).toHaveText("Phép năm còn 12/12 ngày");
});

test("hai tab: quản lý duyệt thì nhân viên thấy trạng thái và số dư đổi", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-03-09", to: "2026-03-11" });
  const mgr = await managerTab(context);
  await mgr.getByRole("button", { name: "Duyệt đơn #1" }).click();
  await expect(mgr.getByTestId("leave-status-1")).toHaveText("Đã duyệt");

  await expect(page.getByTestId("leave-status-1")).toHaveText("Đã duyệt");
  await expect(page.getByTestId("leave-balance")).toHaveText("Phép năm còn 9/12 ngày");
  await expect(page.getByRole("button", { name: "Huỷ đơn #1" })).toHaveCount(0);
});

test("từ chối bắt buộc có lý do", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-03-09", to: "2026-03-10" });
  const mgr = await managerTab(context);
  await mgr.getByRole("button", { name: "Từ chối đơn #1" }).click();
  await mgr.getByRole("button", { name: "Xác nhận từ chối" }).click();
  await expect(mgr.getByTestId("reject-error")).toHaveText("Vui lòng nhập lý do từ chối");
  await mgr.getByLabel("Lý do từ chối").fill("Trùng đợt cao điểm");
  await mgr.getByRole("button", { name: "Xác nhận từ chối" }).click();
  await expect(mgr.getByTestId("leave-status-1")).toHaveText("Từ chối");
  await expect(page.getByText("Lý do: Trùng đợt cao điểm")).toBeVisible();
});

test("nhân viên huỷ được đơn chờ duyệt", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-03-09", to: "2026-03-10" });
  await page.getByRole("button", { name: "Huỷ đơn #1" }).click();
  await expect(page.getByTestId("leave-status-1")).toHaveText("Đã huỷ");
});

test("ngày: quá khứ, kết thúc trước bắt đầu, lý do quá ngắn", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-03-01", to: "2026-03-03" });
  await expect(error(page)).toContainText("không được ở quá khứ");
  await send(page, { from: "2026-03-10", to: "2026-03-09" });
  await expect(error(page)).toContainText("sau hoặc bằng ngày bắt đầu");
  await send(page, { from: "2026-03-09", to: "2026-03-10", reason: "ngắn" });
  await expect(error(page)).toContainText("tối thiểu 10");
  await expect(page.getByTestId("leave-empty")).toBeVisible();
});

test("biên số dư phép năm: 12 ngày được, 13 ngày bị từ chối; nghỉ ốm không bị giới hạn", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-04-01", to: "2026-04-13" });
  await expect(error(page)).toContainText("vượt quá phép năm còn lại (12)");
  await send(page, { from: "2026-04-01", to: "2026-04-12" });
  await expect(page.getByTestId("leave-days-1")).toHaveText("12");
  await send(page, { from: "2026-06-01", to: "2026-06-20", type: "sick" });
  await expect(page.getByTestId("leave-status-2")).toHaveText("Chờ duyệt");
});

test("đơn trùng khoảng ngày bị từ chối", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-03-09", to: "2026-03-11" });
  await send(page, { from: "2026-03-11", to: "2026-03-12" });
  await expect(error(page)).toContainText("trùng với một đơn khác");
  await send(page, { from: "2026-03-12", to: "2026-03-13" });
  await expect(page.getByTestId("leave-row")).toHaveCount(2);
});

test("phân quyền: nhân viên không thấy nút Duyệt, quản lý thì có", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-03-09", to: "2026-03-10" });
  await expect(page.getByRole("button", { name: "Duyệt đơn #1" })).toHaveCount(0);
  const mgr = await managerTab(context);
  await expect(mgr.getByRole("button", { name: "Duyệt đơn #1" })).toBeVisible();
  await expect(mgr.getByRole("button", { name: "Gửi đơn" })).toHaveCount(0);
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page, context }) => {
  await open(page, context, "?bugs=BUG-01,BUG-02,BUG-03");
  await send(page, { from: "2026-03-09", to: "2026-03-11" });
  await expect(page.getByTestId("leave-days-1")).toHaveText("2"); // BUG-01: đáng lẽ 3
  await expect(page.getByRole("button", { name: "Duyệt đơn #1" })).toBeVisible(); // BUG-02: nhân viên thấy nút duyệt
  await send(page, { from: "2026-03-10", to: "2026-03-10" });
  await expect(page.getByTestId("leave-row")).toHaveCount(2); // BUG-03: đáng lẽ bị chặn vì trùng ngày
});

test("BR-08: duyệt lại số dư tại thời điểm duyệt, đơn thứ hai 12 ngày không được duyệt", async ({ page, context }) => {
  await open(page, context);
  await send(page, { from: "2026-04-01", to: "2026-04-12" }); // 12 ngày
  await send(page, { from: "2026-05-04", to: "2026-05-15" }); // 12 ngày, không trùng
  await expect(page.getByTestId("leave-row")).toHaveCount(2);

  const mgr = await managerTab(context);
  await mgr.getByRole("button", { name: "Duyệt đơn #1" }).click();
  await expect(mgr.getByTestId("leave-status-1")).toHaveText("Đã duyệt");
  await mgr.getByRole("button", { name: "Duyệt đơn #2" }).click();
  await expect(mgr.getByTestId("leave-approve-error")).toHaveText(
    "Không thể duyệt đơn #2: phép năm còn 0 ngày, đơn cần 12 ngày",
  );
  await expect(mgr.getByTestId("leave-status-2")).toHaveText("Chờ duyệt");
  await expect(page.getByTestId("leave-balance")).toHaveText("Phép năm còn 0/12 ngày");
});
