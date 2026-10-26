import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, query = "") {
  await page.goto("/lab/todo" + query);
  await page.getByTestId("reset-data").click();
}

async function add(page: Page, title: string) {
  await page.getByLabel("Công việc mới").fill(title);
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
}

test("thêm, hoàn thành và xoá có xác nhận", async ({ page }) => {
  await open(page);
  await add(page, "Mua sữa");
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 1 việc");

  await page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa", exact: true }).check();
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 0 việc");

  await page.getByRole("button", { name: "Xoá Mua sữa" }).click();
  await page.getByRole("button", { name: "Giữ lại" }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);

  await page.getByRole("button", { name: "Xoá Mua sữa" }).click();
  await page.getByRole("button", { name: "Xoá hẳn" }).click();
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});

test("sửa tên và kiểm tra trùng tiêu đề không phân biệt hoa thường", async ({ page }) => {
  await open(page);
  await add(page, "Mua sữa");
  await add(page, "mua SỮA");
  await expect(page.getByTestId("todo-error")).toHaveText("Công việc này đã tồn tại");

  await page.getByRole("button", { name: "Sửa Mua sữa" }).click();
  await page.getByLabel("Sửa tên công việc").fill("Mua trứng");
  await page.getByRole("button", { name: "Lưu" }).click();
  await expect(page.getByTestId("todo-title")).toHaveText("Mua trứng");
});

test("tên rỗng hoặc quá dài bị từ chối (biên 80/81)", async ({ page }) => {
  await open(page);
  await add(page, "   ");
  await expect(page.getByTestId("todo-error")).toContainText("Vui lòng nhập");

  await add(page, "a".repeat(81));
  await expect(page.getByTestId("todo-error")).toContainText("tối đa 80");

  await add(page, "a".repeat(80));
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
});

test("giới hạn 20 công việc (biên 20/21)", async ({ page }) => {
  await open(page);
  for (let i = 1; i <= 20; i++) await add(page, "Việc " + i);
  await expect(page.getByTestId("todo-item")).toHaveCount(20);
  await add(page, "Việc 21");
  await expect(page.getByTestId("todo-error")).toContainText("Tối đa 20");
  await expect(page.getByTestId("todo-item")).toHaveCount(20);
});

test("bộ lọc, xoá việc đã xong và dữ liệu giữ sau khi tải lại", async ({ page }) => {
  await open(page);
  await add(page, "A");
  await add(page, "B");
  await page.getByRole("checkbox", { name: "Hoàn thành: A" }).check();

  await page.getByRole("button", { name: "Hoàn thành", exact: true }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  await page.getByRole("button", { name: "Đang làm" }).click();
  await expect(page.getByTestId("todo-title")).toHaveText("B");

  // Bộ lọc không được lưu, nhưng dữ liệu thì có: sau khi tải lại vẫn đủ 2 việc.
  await page.reload();
  await expect(page.getByTestId("todo-item")).toHaveCount(2);
  await expect(page.getByRole("checkbox", { name: "Hoàn thành: A", exact: true })).toBeChecked();

  await page.getByRole("button", { name: "Xoá các việc đã xong" }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await add(page, "Mua sữa");
  await add(page, "mua sữa");
  await expect(page.getByTestId("todo-item")).toHaveCount(2); // BUG-01: đáng lẽ bị chặn

  await page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa", exact: true }).check();
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 2 việc"); // BUG-02: đáng lẽ còn 1

  for (let i = 3; i <= 21; i++) await add(page, "Việc " + i);
  await expect(page.getByTestId("todo-item")).toHaveCount(21); // BUG-03: đáng lẽ dừng ở 20
});
