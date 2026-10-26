export type Role = "admin" | "editor" | "viewer";
export type Status = "active" | "locked";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: number; // timestamp
}

export const ROLE_LABEL: Record<Role, string> = { admin: "Admin", editor: "Editor", viewer: "Viewer" };
export const STATUS_LABEL: Record<Status, string> = { active: "Hoạt động", locked: "Đã khoá" };

export const PAGE_SIZES = [5, 10, 20];
export const DEFAULT_PAGE_SIZE = 10;
export const TABLE_KEY = "lab:users";

const HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi"];
const TEN = ["An", "Bình", "Chi", "Dũng", "Giang", "Hà", "Khoa", "Lan", "Minh", "Nam", "Oanh", "Phúc", "Quân"];

const ascii = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, ".");

const BASE = Date.UTC(2025, 0, 1);

export function seedUsers(): User[] {
  return Array.from({ length: 37 }, (_, i) => {
    const name = `${HO[i % HO.length]} ${TEN[i % TEN.length]}`;
    return {
      id: i + 1,
      name,
      email: `${ascii(name)}${i + 1}@lab.dev`,
      role: i % 7 === 0 ? "admin" : i % 3 === 0 ? "editor" : "viewer",
      status: i % 4 === 3 ? "locked" : "active",
      createdAt: BASE + ((i * 37) % 400) * 86_400_000,
    } satisfies User;
  });
}

export const formatDate = (ts: number) => {
  const d = new Date(ts);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
};

export type SortKey = "name" | "email" | "role" | "createdAt";
export interface Sort {
  key: SortKey;
  dir: "asc" | "desc";
}

export interface Query {
  search: string;
  role: Role | "all";
  status: Status | "all";
  sort: Sort;
}

export const defaultQuery: Query = {
  search: "",
  role: "all",
  status: "all",
  sort: { key: "name", dir: "asc" },
};

export const BUGS = [
  { id: "BUG-01", hint: "Tìm kiếm" },
  { id: "BUG-02", hint: "Phân trang khi đổi bộ lọc" },
  { id: "BUG-03", hint: "Sắp xếp theo ngày tạo" },
];

export function queryUsers(all: User[], q: Query, bugs: Set<string>): User[] {
  const s = q.search.trim();
  let rows = all.filter((u) => {
    // BUG-01: tìm kiếm phân biệt hoa thường
    const hit = bugs.has("BUG-01")
      ? u.name.includes(s) || u.email.includes(s)
      : u.name.toLowerCase().includes(s.toLowerCase()) || u.email.toLowerCase().includes(s.toLowerCase());
    return hit && (q.role === "all" || u.role === q.role) && (q.status === "all" || u.status === q.status);
  });

  const dir = q.sort.dir === "asc" ? 1 : -1;
  rows = [...rows].sort((a, b) => {
    if (q.sort.key === "createdAt") {
      // BUG-03: so sánh chuỗi dd/mm/yyyy thay vì so sánh thời gian
      return bugs.has("BUG-03")
        ? formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)) * dir
        : (a.createdAt - b.createdAt) * dir;
    }
    return String(a[q.sort.key]).localeCompare(String(b[q.sort.key]), "vi") * dir;
  });
  return rows;
}

export function toCsv(rows: User[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = ["Tên", "Email", "Vai trò", "Trạng thái", "Ngày tạo"].map(esc).join(",");
  const lines = rows.map((u) =>
    [u.name, u.email, ROLE_LABEL[u.role], STATUS_LABEL[u.status], formatDate(u.createdAt)].map(esc).join(","),
  );
  return "﻿" + [head, ...lines].join("\r\n");
}
