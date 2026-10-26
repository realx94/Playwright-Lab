import { test, expect, type Page } from "@playwright/test";

const MB2 = 2 * 1024 * 1024;
// PNG 1×1 hợp lệ để kiểm tra ảnh xem trước thật sự hiển thị được.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

async function open(page: Page, query = "") {
  await page.goto("/lab/upload" + query);
  await page.getByTestId("reset-data").click();
}

type F = { name: string; mimeType: string; buffer: Buffer };
const file = (name: string, mimeType: string, size = 100): F => ({ name, mimeType, buffer: Buffer.alloc(size, 1) });
const pick = (page: Page, files: F | F[]) => page.getByLabel("Chọn tệp").setInputFiles(files);

test("tải ảnh PNG hợp lệ: tiến trình, URL, kích thước và ảnh xem trước", async ({ page }) => {
  await open(page);
  await pick(page, { name: "anh.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByTestId("upload-progress")).toBeVisible();
  await expect(page.getByLabel("Tiến trình tải lên")).toBeVisible();

  await expect(page.getByTestId("file-item")).toHaveCount(1, { timeout: 10_000 });
  await expect(page.getByTestId("file-name")).toHaveText("anh.png");
  await expect(page.getByTestId("file-size")).toHaveText(`${PNG.length} byte`);
  await expect(page.getByTestId("file-url")).toHaveText(/^https:\/\/cdn\.lab\.dev\/files\/f-[a-z0-9-]+\/anh\.png$/);
  await expect(page.getByTestId("upload-progress")).toHaveCount(0);
  const thumb = page.getByTestId("file-thumb");
  await expect(thumb).toBeVisible();
  expect(await thumb.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

const rejected: [string, F, string][] = [
  ["đuôi không hỗ trợ", file("a.gif", "image/gif"), "a.gif: Định dạng không được hỗ trợ (chỉ PNG, JPG, PDF)"],
  ["đuôi .png nhưng nội dung là PDF", file("gia.png", "application/pdf"), "gia.png: Định dạng không được hỗ trợ (chỉ PNG, JPG, PDF)"],
  ["không có phần mở rộng", file("khongduoi", "application/pdf"), "khongduoi: Định dạng không được hỗ trợ (chỉ PNG, JPG, PDF)"],
  ["tệp rỗng", file("rong.pdf", "application/pdf", 0), "rong.pdf: Tệp rỗng"],
  ["lớn hơn 2 MB một byte", file("lon.pdf", "application/pdf", MB2 + 1), "lon.pdf: Tệp vượt quá 2 MB"],
];
for (const [name, f, message] of rejected) {
  test(`từ chối: ${name}`, async ({ page }) => {
    await open(page);
    await pick(page, f);
    await expect(page.getByTestId("upload-error")).toHaveText(message);
    await expect(page.getByTestId("file-item")).toHaveCount(0);
  });
}

const accepted: [string, F][] = [
  ["đúng 2 MB (biên)", file("bien.pdf", "application/pdf", MB2)],
  ["phần mở rộng viết hoa", file("ANH.PNG", "image/png")],
  ["JPEG", file("a.jpeg", "image/jpeg")],
];
for (const [name, f] of accepted) {
  test(`chấp nhận: ${name}`, async ({ page }) => {
    await open(page);
    await pick(page, f);
    await expect(page.getByTestId("file-item")).toHaveCount(1, { timeout: 10_000 });
    await expect(page.getByTestId("upload-error")).toHaveCount(0);
  });
}

test("chọn nhiều tệp: tệp hợp lệ vẫn được tải, tệp lỗi được báo riêng", async ({ page }) => {
  await open(page);
  await pick(page, [file("tot.pdf", "application/pdf"), file("loi.gif", "image/gif")]);
  await expect(page.getByTestId("file-item")).toHaveCount(1, { timeout: 10_000 });
  await expect(page.getByTestId("upload-error")).toHaveText("loi.gif: Định dạng không được hỗ trợ (chỉ PNG, JPG, PDF)");
});

test("tên trùng được đổi tên, giới hạn 5 tệp, xoá được tệp", async ({ page }) => {
  await open(page);
  await pick(page, file("a.pdf", "application/pdf"));
  await expect(page.getByTestId("file-item")).toHaveCount(1, { timeout: 10_000 });
  await pick(page, file("a.pdf", "application/pdf"));
  await expect(page.getByTestId("file-item")).toHaveCount(2, { timeout: 10_000 });
  await expect(page.getByTestId("file-name")).toHaveText(["a.pdf", "a (1).pdf"]);

  for (const n of ["b.pdf", "c.pdf", "d.pdf"]) {
    await pick(page, file(n, "application/pdf"));
    await expect(page.getByTestId("file-name").last()).toHaveText(n, { timeout: 10_000 });
  }
  await expect(page.getByTestId("file-item")).toHaveCount(5);
  await pick(page, file("e.pdf", "application/pdf"));
  await expect(page.getByTestId("upload-error")).toHaveText("e.pdf: Đã đạt tối đa 5 tệp");

  await page.getByRole("button", { name: "Xoá a (1).pdf" }).click();
  await expect(page.getByTestId("file-item")).toHaveCount(4);
});

test("huỷ khi đang tải lên: tệp không được thêm", async ({ page }) => {
  await open(page);
  await pick(page, file("huy.pdf", "application/pdf"));
  await page.getByRole("button", { name: "Huỷ tải lên" }).click();
  await expect(page.getByTestId("upload-error")).toHaveText("huy.pdf: Đã huỷ tải lên");
  await expect(page.getByTestId("file-item")).toHaveCount(0);
});

test("danh sách tệp được giữ sau khi tải lại trang", async ({ page }) => {
  await open(page);
  await pick(page, file("giu.pdf", "application/pdf"));
  await expect(page.getByTestId("file-item")).toHaveCount(1, { timeout: 10_000 });
  await page.reload();
  await expect(page.getByTestId("file-name")).toHaveText("giu.pdf");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await pick(page, file("bien.pdf", "application/pdf", MB2)); // BUG-01: đúng 2 MB bị từ chối
  await expect(page.getByTestId("upload-error")).toHaveText("bien.pdf: Tệp vượt quá 2 MB");
  await pick(page, file("ANH.PNG", "image/png")); // BUG-02: đuôi viết hoa bị từ chối
  await expect(page.getByTestId("upload-error")).toContainText("Định dạng không được hỗ trợ");

  await pick(page, file("huy.pdf", "application/pdf")); // BUG-03: huỷ không có tác dụng
  await page.getByRole("button", { name: "Huỷ tải lên" }).click();
  await expect(page.getByTestId("file-item")).toHaveCount(1, { timeout: 10_000 });
});
