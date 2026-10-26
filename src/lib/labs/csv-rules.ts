export const CSV_KEY = "lab:csv-customers";
export const MAX_BYTES = 100 * 1024;
export const MAX_ROWS = 100;
export const HEADER = ["name", "email", "phone"] as const;

export const BUGS = [
  { id: "BUG-01", hint: "Xuất CSV với dữ liệu có dấu phẩy hoặc dấu nháy" },
  { id: "BUG-02", hint: "Nhập email đã tồn tại" },
  { id: "BUG-03", hint: "Số dòng trong thông báo lỗi" },
];

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/** Đọc CSV theo RFC 4180: dấu nháy kép bao trường, "" là một dấu nháy, hỗ trợ xuống dòng trong trường. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

export function toCsv(list: Customer[], escape = true): string {
  const q = (v: string) => (escape && /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [HEADER.join(","), ...list.map((c) => [c.name, c.email, c.phone].map(q).join(","))].join("\r\n") + "\r\n";
}

const EMAIL = /^[^\s@,]+@[^\s@,]+\.[^\s@,]{2,}$/;

export function importRows(rows: string[][], existing: Customer[], bugs: Set<string>): { list: Customer[]; result: ImportResult } | { fatal: string } {
  if (rows.length === 0) return { fatal: "Tệp rỗng" };
  const header = rows[0].map((h) => h.trim());
  if (HEADER.some((h, i) => header[i] !== h) || header.length !== HEADER.length) return { fatal: "Thiếu cột bắt buộc: name,email,phone" };
  const data = rows.slice(1);
  if (data.length > MAX_ROWS) return { fatal: `Tối đa ${MAX_ROWS} dòng dữ liệu` };

  const list = [...existing];
  const errors: string[] = [];
  let imported = 0;
  data.forEach((r, i) => {
    // Dòng 1 là tiêu đề nên dòng dữ liệu đầu tiên là dòng 2. BUG-03: đếm lệch một dòng.
    const line = i + (bugs.has("BUG-03") ? 1 : 2);
    const [name = "", email = "", phone = ""] = r.map((v) => v.trim());
    let err: string | null = null;
    if (r.length !== HEADER.length) err = "Sai số cột";
    else if (!name || name.length > 50) err = "Tên bắt buộc, tối đa 50 ký tự";
    else if (!EMAIL.test(email)) err = "Email không hợp lệ";
    else if (!/^0\d{9}$/.test(phone)) err = "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0";
    else if (!bugs.has("BUG-02") && list.some((c) => c.email.toLowerCase() === email.toLowerCase())) err = "Email đã tồn tại";
    if (err) errors.push(`Dòng ${line}: ${err}`);
    else {
      list.push({ name, email, phone });
      imported++;
    }
  });
  return { list, result: { imported, skipped: errors.length, errors } };
}

export function loadCustomers(): Customer[] {
  try {
    return JSON.parse(localStorage.getItem(CSV_KEY) ?? "[]") as Customer[];
  } catch {
    return [];
  }
}
