import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const HEADER = "name,email,phone";

async function open(page: Page, query = "") {
  await page.goto("/lab/csv" + query);
  await page.getByTestId("reset-data").click();
}

const upload = (page: Page, content: string, name = "khach-hang.csv") =>
  page.getByLabel("Chọn tệp CSV").setInputFiles({ name, mimeType: "text/csv", buffer: Buffer.from(content, "utf8") });

test("nhập CSV hợp lệ", async ({ page }) => {
  await open(page);
  await upload(page, `${HEADER}\nAn,an@lab.dev,0901234567\nBình,binh@lab.dev,0912345678\nCường,cuong@lab.dev,0923456789\n`);
  await expect(page.getByTestId("csv-summary")).toHaveText("Đã nhập 3 dòng, bỏ qua 0 dòng lỗi");
  await expect(page.getByTestId("customer-row")).toHaveCount(3);
  await expect(page.getByTestId("customer-row").nth(1)).toContainText("binh@lab.dev");
});

test("báo lỗi đúng số dòng và đúng nguyên nhân; dòng hợp lệ vẫn được nhập", async ({ page }) => {
  await open(page);
  await upload(
    page,
    [HEADER, "An,an@lab.dev,0901234567", "Bình,khong-phai-email,0912345678", "Cường,cuong@lab.dev,12345", "Dũng,AN@lab.dev,0934567890", ",e@lab.dev,0901234567"].join("\n"),
  );
  await expect(page.getByTestId("csv-summary")).toHaveText("Đã nhập 1 dòng, bỏ qua 4 dòng lỗi");
  await expect(page.getByTestId("csv-error")).toHaveText([
    "Dòng 3: Email không hợp lệ",
    "Dòng 4: Số điện thoại gồm 10 chữ số, bắt đầu bằng 0",
    "Dòng 5: Email đã tồn tại",
    "Dòng 6: Tên bắt buộc, tối đa 50 ký tự",
  ]);
  await expect(page.getByTestId("customer-row")).toHaveCount(1);
});

test("tệp sai định dạng: thiếu cột, rỗng, sai đuôi, quá lớn", async ({ page }) => {
  await open(page);
  await upload(page, "name,email\nAn,an@lab.dev\n");
  await expect(page.getByTestId("csv-fatal")).toHaveText("Thiếu cột bắt buộc: name,email,phone");

  await upload(page, "");
  await expect(page.getByTestId("csv-fatal")).toHaveText("Tệp rỗng");

  await upload(page, `${HEADER}\nAn,an@lab.dev,0901234567\n`, "khach-hang.txt");
  await expect(page.getByTestId("csv-fatal")).toHaveText("Chỉ chấp nhận tệp .csv tối đa 100 KB");

  await upload(page, HEADER + "\n" + "An,an@lab.dev,0901234567\n".repeat(5000));
  await expect(page.getByTestId("csv-fatal")).toHaveText("Chỉ chấp nhận tệp .csv tối đa 100 KB");

  await upload(page, HEADER + "\n" + Array.from({ length: 101 }, (_, i) => `N${i},u${i}@lab.dev,0901234567`).join("\n"));
  await expect(page.getByTestId("csv-fatal")).toHaveText("Tối đa 100 dòng dữ liệu");
  await expect(page.getByTestId("customer-row")).toHaveCount(0);
});

test("đọc đúng trường có dấu phẩy, dấu nháy và xuống dòng", async ({ page }) => {
  await open(page);
  await upload(page, `${HEADER}\r\n"Nguyễn, Văn ""A""",a@lab.dev,0901234567\r\n`);
  await expect(page.getByTestId("customer-row").first()).toContainText('Nguyễn, Văn "A"');
});

test("xuất CSV đúng chuẩn rồi nhập lại được (round trip)", async ({ page }) => {
  await open(page);
  await upload(page, `${HEADER}\n"Nguyễn, Văn ""A""",a@lab.dev,0901234567\nBình,binh@lab.dev,0912345678\n`);
  await expect(page.getByTestId("customer-row")).toHaveCount(2);

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Xuất CSV" }).click()]);
  expect(download.suggestedFilename()).toBe("customers.csv");
  const content = await readFile((await download.path())!, "utf8");
  expect(content).toBe('name,email,phone\r\n"Nguyễn, Văn ""A""",a@lab.dev,0901234567\r\nBình,binh@lab.dev,0912345678\r\n');

  await page.getByTestId("reset-data").click();
  await upload(page, content);
  await expect(page.getByTestId("csv-summary")).toHaveText("Đã nhập 2 dòng, bỏ qua 0 dòng lỗi");
  await expect(page.getByTestId("customer-row").first()).toContainText('Nguyễn, Văn "A"');
});

test("nhập lại cùng tệp: tất cả dòng bị bỏ qua vì email đã tồn tại", async ({ page }) => {
  await open(page);
  const csv = `${HEADER}\nAn,an@lab.dev,0901234567\nBình,binh@lab.dev,0912345678\n`;
  await upload(page, csv);
  await upload(page, csv);
  await expect(page.getByTestId("csv-summary")).toHaveText("Đã nhập 0 dòng, bỏ qua 2 dòng lỗi");
  await expect(page.getByTestId("customer-row")).toHaveCount(2);
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03");
  const csv = `${HEADER}\n"Nguyễn, Văn",a@lab.dev,0901234567\nBình,a@lab.dev,0912345678\nCường,sai,0923456789\n`;
  await upload(page, csv);
  // BUG-02: email trùng vẫn được nhập; BUG-03: số dòng lỗi lệch một
  await expect(page.getByTestId("customer-row")).toHaveCount(2);
  await expect(page.getByTestId("csv-error")).toHaveText(["Dòng 3: Email không hợp lệ"]); // đúng ra là dòng 4

  // BUG-01: xuất không escape dấu phẩy
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Xuất CSV" }).click()]);
  const content = await readFile((await download.path())!, "utf8");
  expect(content).toContain("Nguyễn, Văn,a@lab.dev");
});
