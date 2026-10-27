import { test, expect, type Page, type Download } from "@playwright/test";
import { readFile } from "node:fs/promises";
import ExcelJS from "exceljs";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

async function open(page: Page, query = "") {
  await page.goto("/lab/reports" + query);
  await page.getByTestId("reset-data").click();
}

async function filter(page: Page, month: string, status: string) {
  await page.getByLabel("Tháng").selectOption(month);
  await page.getByLabel("Trạng thái đơn").selectOption(status);
}

/** Bấm nút xuất, chờ sự kiện download và trả về download. */
async function exportAs(page: Page, name: string): Promise<Download> {
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name }).click()]);
  return download;
}

async function fileOf(download: Download): Promise<string> {
  return (await download.path())!;
}

const pageCount = async (page: Page) => Number(await page.getByTestId("report-count").textContent());
const pageTotal = async (page: Page) => (await page.getByTestId("report-total").textContent())!;
const toNumber = (vi: string) => Number(vi.replace(/\./g, "").replace(",", "."));

async function readSheet(download: Download) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(await fileOf(download));
  return wb;
}

async function readXml(download: Download) {
  const text = await readFile(await fileOf(download), "utf8");
  return { text, valid: XMLValidator.validate(text) };
}

async function readPdfText(download: Download) {
  const parser = new PDFParse({ data: await readFile(await fileOf(download)) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

test("bảng xem trước theo bộ lọc: 14 đơn, tháng 03 + Hoàn tất còn 5 đơn", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("report-row")).toHaveCount(14);
  await filter(page, "2026-03", "Hoàn tất");
  await expect(page.getByTestId("report-row")).toHaveCount(5);
  await expect(page.getByTestId("report-total")).toHaveText("13.715.501,14");
});

test("Excel: tên tệp, MIME, dòng tiêu đề, dòng dữ liệu, công thức SUM và sheet Tổng hợp", async ({ page }) => {
  await open(page);
  await filter(page, "2026-03", "Hoàn tất");
  const download = await exportAs(page, "Xuất Excel");
  expect(download.suggestedFilename()).toBe("bao-cao-2026-03-hoan-tat.xlsx");

  const wb = await readSheet(download);
  expect(wb.worksheets.map((w) => w.name)).toEqual(["Đơn hàng", "Tổng hợp"]);
  const ws = wb.getWorksheet("Đơn hàng")!;
  expect((ws.getRow(1).values as unknown[]).slice(1)).toEqual(["Mã đơn", "Ngày", "Khách hàng", "Trạng thái", "Số tiền"]);
  expect(ws.rowCount).toBe(1 + 5 + 1);
  expect(ws.getCell("A2").value).toBe("DH-004");
  expect(ws.getCell("C2").value).toBe('Lê "Bobby" Hoàng');
  expect(ws.getCell("E2").value).toBe(1999999.99);
  expect((ws.getCell("B2").value as Date).toISOString()).toBe("2026-03-02T09:15:00.000Z"); // giờ địa phương lưu như giờ trôi

  const total = ws.getCell("E7").value as { formula: string; result: number };
  expect(total.formula).toBe("SUM(E2:E6)");
  expect(total.result).toBeCloseTo(toNumber(await pageTotal(page)), 2);

  const sum = wb.getWorksheet("Tổng hợp")!;
  expect(sum.getCell("A2").value).toBe("Hoàn tất");
  expect(sum.getCell("B2").value).toBe(5);
});

test("XML: parse được, escape đúng ký tự đặc biệt và khớp từng đơn trên trang", async ({ page }) => {
  await open(page);
  await filter(page, "2026-03", "");
  const download = await exportAs(page, "Xuất XML");
  expect(download.suggestedFilename()).toBe("bao-cao-2026-03.xml");

  const { text, valid } = await readXml(download);
  expect(valid).toBe(true);
  expect(text).toContain("Cửa hàng Hoa &amp; Quà");
  expect(text).toContain("Phạm &lt;Minh&gt; Đức");

  const doc = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", parseTagValue: false }).parse(text);
  const orders = [doc.report.order].flat();
  expect(orders).toHaveLength(6);
  expect(doc.report["@_count"]).toBe("6");
  const rows = page.getByTestId("report-row");
  for (let i = 0; i < orders.length; i++) {
    const row = rows.nth(i);
    await expect(row).toHaveAttribute("data-order", orders[i]["@_id"]);
    await expect(row.locator("td").nth(2)).toHaveText(orders[i].customer);
    await expect(row.locator("td").nth(3)).toHaveText(orders[i]["@_status"]);
    await expect(row.locator("td").nth(4)).toHaveText(
      Number(orders[i].amount["#text"]).toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    );
  }
});

test("Word và PDF: tên tệp, MIME, tiêu đề, tóm tắt và đúng các đơn theo bộ lọc", async ({ page, request }) => {
  await open(page);
  await filter(page, "2026-03", "Hoàn tất");

  const docx = await exportAs(page, "Xuất Word");
  expect(docx.suggestedFilename()).toBe("bao-cao-2026-03-hoan-tat.docx");
  const text = (await mammoth.extractRawText({ path: await fileOf(docx) })).value;
  expect(text).toContain("Báo cáo đơn hàng");
  expect(text).toContain("Tổng cộng 5 đơn, tổng tiền 13.715.501,14 ₫.");
  expect(text).toContain("DH-009");
  expect(text).not.toContain("DH-006"); // đơn đã huỷ

  const pdf = await exportAs(page, "Xuất PDF");
  expect(pdf.suggestedFilename()).toBe("bao-cao-2026-03-hoan-tat.pdf");
  const pdfText = await readPdfText(pdf);
  expect(pdfText).toContain("Bao cao don hang");
  expect(pdfText).toContain("Tong cong 5 don, tong tien 13.715.501,14 VND");
  expect(pdfText).toContain("DH-009");
  expect(pdfText).not.toContain("DH-006");

  // Kiểu MIME và header kiểm tra ở tầng HTTP
  const res = await request.get("/api/lab/report/docx?month=2026-03&status=Hoàn tất");
  expect(res.headers()["content-type"]).toBe(DOCX_MIME);
  expect(res.headers()["content-disposition"]).toBe('attachment; filename="bao-cao-2026-03-hoan-tat.docx"');
});

test("CSV, Excel và trang có cùng số dòng cho mọi bộ lọc", async ({ page }) => {
  test.setTimeout(90_000);
  await open(page);
  for (const [month, status] of [["", ""], ["2026-04", ""], ["2026-02", "Đã huỷ"]]) {
    await filter(page, month, status);
    const rows = await pageCount(page);

    const csv = await exportAs(page, "Xuất CSV");
    const lines = (await readFile(await fileOf(csv), "utf8")).replace(/^﻿/, "").trim().split("\r\n");
    expect(lines.length - 1).toBe(rows);

    const xlsx = await exportAs(page, "Xuất Excel");
    const ws = (await readSheet(xlsx)).getWorksheet("Đơn hàng")!;
    expect(ws.rowCount - 2).toBe(rows); // trừ dòng tiêu đề và dòng tổng
  }
});

test("bộ lọc rỗng cho tên tệp tat-ca và MIME đúng cho Excel", async ({ page }) => {
  await open(page);
  const xlsx = await exportAs(page, "Xuất Excel");
  expect(xlsx.suggestedFilename()).toBe("bao-cao-tat-ca.xlsx");
  const res = await page.request.get("/api/lab/report/xlsx");
  expect(res.headers()["content-type"]).toBe(XLSX_MIME);
  expect((await page.request.get("/api/lab/report/xlsx?month=2026-13")).status()).toBe(400);
  expect((await page.request.get("/api/lab/report/zip")).status()).toBe(404);
});

test("BUG-01: tổng tiền trong Excel thiếu dòng cuối", async ({ page }) => {
  await open(page, "?bugs=BUG-01");
  await filter(page, "2026-03", "Hoàn tất");
  const ws = (await readSheet(await exportAs(page, "Xuất Excel"))).getWorksheet("Đơn hàng")!;
  const total = ws.getCell("E7").value as { formula: string; result: number };
  expect(total.formula).toBe("SUM(E2:E5)");
  expect(total.result).not.toBeCloseTo(toNumber(await pageTotal(page)), 2);
});

test("BUG-02: XML không escape & nên không parse được", async ({ page }) => {
  await open(page, "?bugs=BUG-02");
  await filter(page, "2026-03", "");
  const { text, valid } = await readXml(await exportAs(page, "Xuất XML"));
  expect(text).toContain("Hoa & Quà");
  expect(valid).not.toBe(true);
});

test("BUG-03: PDF và Word bỏ qua bộ lọc trạng thái", async ({ page }) => {
  await open(page, "?bugs=BUG-03");
  await filter(page, "2026-03", "Hoàn tất");
  const text = (await mammoth.extractRawText({ path: await fileOf(await exportAs(page, "Xuất Word")) })).value;
  expect(text).toContain("DH-006");
  expect(await readPdfText(await exportAs(page, "Xuất PDF"))).toContain("DH-006");
  // Excel vẫn đúng bộ lọc
  expect((await readSheet(await exportAs(page, "Xuất Excel"))).getWorksheet("Đơn hàng")!.rowCount).toBe(7);
});
