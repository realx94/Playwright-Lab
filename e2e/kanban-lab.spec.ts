import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, query = "") {
  await page.goto("/lab/kanban" + query);
  await page.getByTestId("reset-data").click();
}

const card = (page: Page, title: string) => page.getByTestId("card").filter({ hasText: title });
const titles = (page: Page, col: string) => page.getByTestId("col-" + col).getByTestId("card-title");
const msg = (page: Page) => page.getByTestId("kb-message");

async function edit(page: Page, title: string, text: string, key: string) {
  await card(page, title).getByTestId("card-title").dblclick();
  await page.getByTestId("title-input").fill(text);
  await page.getByTestId("title-input").press(key);
}

test("dữ liệu ban đầu: ba cột, thẻ và bộ đếm WIP", async ({ page }) => {
  await open(page);
  await expect(titles(page, "todo")).toHaveText(["Thiết kế trang đăng nhập", "Viết tài liệu API", "Sửa lỗi giỏ hàng"]);
  await expect(titles(page, "doing")).toHaveText(["Tối ưu truy vấn", "Review PR số 42"]);
  await expect(titles(page, "done")).toHaveText(["Cấu hình CI"]);
  await expect(page.getByTestId("count-doing")).toHaveText("2/3");
  await expect(card(page, "Viết tài liệu API").getByTestId("card-assignee")).toHaveText("Bình");
});

test("kéo thẻ sang cột khác (thả lên vùng trống) và lưu sau khi tải lại", async ({ page }) => {
  await open(page);
  await card(page, "Sửa lỗi giỏ hàng").dragTo(page.getByTestId("drop-done"));
  await expect(titles(page, "done")).toHaveText(["Cấu hình CI", "Sửa lỗi giỏ hàng"]);
  await expect(msg(page)).toHaveText("Đã chuyển “Sửa lỗi giỏ hàng” sang Xong");
  await page.reload();
  await expect(titles(page, "done")).toHaveText(["Cấu hình CI", "Sửa lỗi giỏ hàng"]);
});

test("kéo thả lên thẻ khác chèn trước thẻ đó, thả xuống cuối cột để xếp cuối", async ({ page }) => {
  await open(page);
  await card(page, "Sửa lỗi giỏ hàng").dragTo(card(page, "Thiết kế trang đăng nhập"));
  await expect(titles(page, "todo")).toHaveText(["Sửa lỗi giỏ hàng", "Thiết kế trang đăng nhập", "Viết tài liệu API"]);
  // thả xuống phần trống ở đáy vùng thả của cột
  const zone = page.getByTestId("drop-todo");
  const box = (await zone.boundingBox())!;
  await card(page, "Sửa lỗi giỏ hàng").dragTo(zone, { targetPosition: { x: box.width / 2, y: box.height - 6 } });
  await expect(titles(page, "todo")).toHaveText(["Thiết kế trang đăng nhập", "Viết tài liệu API", "Sửa lỗi giỏ hàng"]);
  await card(page, "Cấu hình CI").dragTo(card(page, "Tối ưu truy vấn"));
  await expect(titles(page, "doing")).toHaveText(["Cấu hình CI", "Tối ưu truy vấn", "Review PR số 42"]);
});

test("WIP: cột Đang làm đầy 3 thẻ thì từ chối thẻ thứ 4 khi kéo thả", async ({ page }) => {
  await open(page);
  await card(page, "Sửa lỗi giỏ hàng").dragTo(page.getByTestId("drop-doing"));
  await expect(page.getByTestId("count-doing")).toHaveText("3/3");
  await card(page, "Viết tài liệu API").dragTo(page.getByTestId("drop-doing"));
  await expect(msg(page)).toHaveText("Cột Đang làm đã đủ 3 thẻ, không thể thêm thẻ nữa");
  await expect(page.getByTestId("count-doing")).toHaveText("3/3");
  await expect(titles(page, "todo")).toHaveText(["Thiết kế trang đăng nhập", "Viết tài liệu API"]);
  // sắp xếp lại ngay trong cột đầy vẫn được phép
  await card(page, "Review PR số 42").dragTo(card(page, "Tối ưu truy vấn"));
  await expect(titles(page, "doing")).toHaveText(["Review PR số 42", "Tối ưu truy vấn", "Sửa lỗi giỏ hàng"]);
});

test("BUG-01: kéo thả bỏ qua giới hạn WIP nhưng phím tắt vẫn chặn", async ({ page }) => {
  await open(page, "?bugs=BUG-01");
  await card(page, "Sửa lỗi giỏ hàng").dragTo(page.getByTestId("drop-doing"));
  await card(page, "Viết tài liệu API").dragTo(page.getByTestId("drop-doing"));
  await expect(page.getByTestId("count-doing")).toHaveText("4/3");
  await card(page, "Thiết kế trang đăng nhập").focus();
  await page.keyboard.press("Alt+ArrowRight");
  await expect(msg(page)).toHaveText("Cột Đang làm đã đủ 3 thẻ, không thể thêm thẻ nữa");
});

test("sửa tiêu đề tại chỗ: Enter lưu, Escape huỷ", async ({ page }) => {
  await open(page);
  await edit(page, "Cấu hình CI", "Cấu hình CI/CD", "Enter");
  await expect(titles(page, "done")).toHaveText(["Cấu hình CI/CD"]);
  await edit(page, "Cấu hình CI/CD", "Tên bị huỷ", "Escape");
  await expect(page.getByTestId("title-input")).toHaveCount(0);
  await expect(titles(page, "done")).toHaveText(["Cấu hình CI/CD"]);
});

test("sửa tiêu đề: rỗng bị từ chối, tối đa 80 ký tự", async ({ page }) => {
  await open(page);
  await edit(page, "Cấu hình CI", "   ", "Enter");
  await expect(page.getByTestId("title-error")).toHaveText("Tiêu đề không được để trống");
  await expect(page.getByTestId("title-input")).toBeVisible();
  await page.getByTestId("title-input").fill("x".repeat(81));
  await page.getByTestId("title-input").press("Enter");
  await expect(page.getByTestId("title-error")).toHaveText("Tiêu đề tối đa 80 ký tự");
  await page.getByTestId("title-input").fill("y".repeat(80));
  await page.getByTestId("title-input").press("Enter");
  await expect(titles(page, "done")).toHaveText(["y".repeat(80)]);
});

test("BUG-02: nhấn Escape khi sửa tiêu đề lại lưu", async ({ page }) => {
  await open(page, "?bugs=BUG-02");
  await edit(page, "Cấu hình CI", "Tên bị huỷ", "Escape");
  await expect(titles(page, "done")).toHaveText(["Tên bị huỷ"]);
});

test("menu chuột phải: mở bằng chuột phải, đóng bằng Escape hoặc click ngoài", async ({ page }) => {
  await open(page);
  await card(page, "Cấu hình CI").click({ button: "right" });
  const menu = page.getByTestId("context-menu");
  await expect(menu.getByRole("menuitem")).toHaveText(["Mở chi tiết", "Đổi màu", "Nhân bản", "Xoá"]);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await card(page, "Cấu hình CI").click({ button: "right" });
  await page.getByRole("heading", { name: "LAB-30 · Bảng công việc Kanban" }).click();
  await expect(menu).toHaveCount(0);
});

test("menu chuột phải: mở chi tiết, đổi màu, nhân bản", async ({ page }) => {
  await open(page);
  const c = card(page, "Viết tài liệu API");
  await c.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Mở chi tiết" }).click();
  await expect(page.getByTestId("detail-title")).toHaveText("Viết tài liệu API");
  await expect(page.getByTestId("detail-col")).toHaveText("Cần làm");
  await expect(page.getByTestId("detail-assignee")).toHaveText("Bình");
  await page.getByTestId("detail-close").click();

  await c.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Đổi màu" }).click();
  await expect(c.getByTestId("card-color")).toHaveAttribute("data-color", "red");

  await c.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Nhân bản" }).click();
  await expect(titles(page, "todo")).toHaveText(["Thiết kế trang đăng nhập", "Viết tài liệu API", "Viết tài liệu API (bản sao)", "Sửa lỗi giỏ hàng"]);
});

test("xoá qua nút nhanh khi hover và qua menu ngữ cảnh đều có hộp xác nhận", async ({ page }) => {
  await open(page);
  const c = card(page, "Cấu hình CI");
  await expect(c.getByTestId("quick-delete")).toHaveCount(0);
  await c.getByTestId("card-title").hover();
  await c.getByTestId("quick-delete").click();
  await expect(page.getByTestId("confirm-dialog")).toContainText("Cấu hình CI");
  await page.getByTestId("confirm-ok").click();
  await expect(titles(page, "done")).toHaveCount(0);
  await expect(page.getByTestId("empty-done")).toBeVisible();

  await card(page, "Review PR số 42").click({ button: "right" });
  await page.getByRole("menuitem", { name: "Xoá" }).click();
  await page.getByTestId("confirm-cancel").click();
  await expect(titles(page, "doing")).toHaveCount(2);
  await card(page, "Review PR số 42").click({ button: "right" });
  await page.getByRole("menuitem", { name: "Xoá" }).click();
  await page.getByTestId("confirm-ok").click();
  await expect(titles(page, "doing")).toHaveText(["Tối ưu truy vấn"]);
});

test("phím tắt: Alt+mũi tên đổi cột, Delete xoá có xác nhận", async ({ page }) => {
  await open(page);
  await card(page, "Sửa lỗi giỏ hàng").focus();
  await page.keyboard.press("Alt+ArrowRight");
  await expect(titles(page, "doing")).toHaveText(["Tối ưu truy vấn", "Review PR số 42", "Sửa lỗi giỏ hàng"]);
  await page.keyboard.press("Alt+ArrowRight");
  await expect(titles(page, "done")).toHaveText(["Cấu hình CI", "Sửa lỗi giỏ hàng"]);
  await page.keyboard.press("Delete");
  await expect(page.getByTestId("confirm-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("confirm-dialog")).toHaveCount(0);
  await expect(titles(page, "done")).toHaveCount(2);
  await page.keyboard.press("Delete");
  await page.getByTestId("confirm-ok").click();
  await expect(titles(page, "done")).toHaveText(["Cấu hình CI"]);
});

test("phím tắt: N thêm thẻ, / focus ô tìm, ô tìm lọc theo tiêu đề", async ({ page }) => {
  await open(page);
  await page.keyboard.press("n");
  await expect(page.getByTestId("title-input")).toBeFocused();
  await page.keyboard.type("Thẻ từ phím tắt");
  await page.keyboard.press("Enter");
  await expect(titles(page, "todo")).toHaveCount(4);
  await expect(titles(page, "todo").last()).toHaveText("Thẻ từ phím tắt");

  await page.keyboard.press("/");
  await expect(page.getByLabel("Tìm thẻ")).toBeFocused();
  await page.keyboard.type("api");
  await expect(page.getByTestId("card")).toHaveText([/Viết tài liệu API/]);
  await expect(page.getByTestId("empty-doing")).toHaveText("Không có thẻ khớp");
});

test("Ctrl+Z hoàn tác thao tác di chuyển gần nhất về đúng cột", async ({ page }) => {
  await open(page);
  await card(page, "Review PR số 42").dragTo(page.getByTestId("drop-done"));
  await expect(titles(page, "done")).toHaveText(["Cấu hình CI", "Review PR số 42"]);
  await page.keyboard.press("Control+z");
  await expect(titles(page, "doing")).toHaveText(["Tối ưu truy vấn", "Review PR số 42"]);
  await expect(msg(page)).toHaveText("Đã hoàn tác: “Review PR số 42” về Đang làm");
  await page.keyboard.press("Control+z");
  await expect(msg(page)).toHaveText("Không có thao tác nào để hoàn tác");
});

test("BUG-03: hoàn tác đưa thẻ về sai cột", async ({ page }) => {
  await open(page, "?bugs=BUG-03");
  await card(page, "Review PR số 42").dragTo(page.getByTestId("drop-done"));
  await page.keyboard.press("Control+z");
  await expect(titles(page, "doing")).toHaveText(["Tối ưu truy vấn"]);
  await expect(titles(page, "todo")).toContainText(["Review PR số 42"]);
});
