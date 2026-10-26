"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  ROLE_LABEL,
  STATUS_LABEL,
  TABLE_KEY,
  defaultQuery,
  formatDate,
  queryUsers,
  seedUsers,
  toCsv,
  type Query,
  type Role,
  type SortKey,
  type Status,
  type User,
} from "@/lib/labs/users-table";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Tên" },
  { key: "email", label: "Email" },
  { key: "role", label: "Vai trò" },
  { key: "createdAt", label: "Ngày tạo" },
];

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(TABLE_KEY);
    return raw ? (JSON.parse(raw) as User[]) : seedUsers();
  } catch {
    return seedUsers();
  }
}

export function TableApp() {
  const params = useSearchParams();
  const bugParam = params.get("bugs") ?? "";
  const bugs = useMemo(() => new Set(bugParam.split(",").filter(Boolean)), [bugParam]);
  const rawDelay = Number(params.get("delay"));
  const delay = Number.isFinite(rawDelay) && rawDelay >= 0 && params.get("delay") !== null ? Math.min(rawDelay, 5000) : 300;

  const [users, setUsers] = useState<User[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState<Query>(defaultQuery);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setUsers(loadUsers());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => clearTimeout(timer.current);
  }, []);

  function persist(next: User[]) {
    setUsers(next);
    try {
      localStorage.setItem(TABLE_KEY, JSON.stringify(next));
    } catch {}
  }

  /** Mô phỏng việc tải dữ liệu từ máy chủ mỗi khi truy vấn thay đổi. */
  function refresh() {
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), delay);
  }

  function change(patch: Partial<Query>) {
    setQuery((q) => ({ ...q, ...patch }));
    // BUG-02: đổi bộ lọc nhưng không quay về trang 1
    if (!bugs.has("BUG-02")) setPage(1);
    setSelected(new Set());
    refresh();
  }

  function sortBy(key: SortKey) {
    change({
      sort: { key, dir: query.sort.key === key && query.sort.dir === "asc" ? "desc" : "asc" },
    });
  }

  const rows = useMemo(() => queryUsers(users, query, bugs), [users, query, bugs]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);
  const allOnPage = pageRows.length > 0 && pageRows.every((u) => selected.has(u.id));

  function toggleAll(on: boolean) {
    const next = new Set(selected);
    for (const u of pageRows) {
      if (on) next.add(u.id);
      else next.delete(u.id);
    }
    setSelected(next);
  }

  function toggleRow(id: number, on: boolean) {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  function setStatus(ids: Set<number>, status: Status) {
    persist(users.map((u) => (ids.has(u.id) && u.role !== "admin" ? { ...u, status } : u)));
  }

  function exportCsv() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nguoi-dung.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    try {
      localStorage.removeItem(TABLE_KEY);
    } catch {}
    setUsers(seedUsers());
    setQuery(defaultQuery);
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSelected(new Set());
    setLoading(false);
  }

  if (!ready) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="user-search">Tìm kiếm</Label>
          <Input
            id="user-search"
            value={query.search}
            onChange={(e) => change({ search: e.target.value })}
            placeholder="Tên hoặc email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-role">Vai trò</Label>
          <select
            id="user-role"
            value={query.role}
            onChange={(e) => change({ role: e.target.value as Role | "all" })}
            className="h-9 rounded-lg border bg-background px-2 text-sm"
          >
            <option value="all">Tất cả</option>
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-status">Trạng thái</Label>
          <select
            id="user-status"
            value={query.status}
            onChange={(e) => change({ status: e.target.value as Status | "all" })}
            className="h-9 rounded-lg border bg-background px-2 text-sm"
          >
            <option value="all">Tất cả</option>
            {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="size-4" /> Xuất CSV
        </Button>
        <Button variant="ghost" onClick={reset} data-testid="reset-data">
          Reset dữ liệu lab
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p data-testid="total-count">{rows.length} người dùng</p>
        {selected.size > 0 && (
          <div className="flex items-center gap-2" data-testid="bulk-bar">
            <span data-testid="selected-count">Đã chọn {selected.size}</span>
            <Button size="sm" variant="outline" onClick={() => setStatus(selected, "locked")}>
              Khoá đã chọn
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table aria-busy={loading}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPage}
                  onCheckedChange={(c) => toggleAll(c === true)}
                  aria-label="Chọn tất cả trang này"
                />
              </TableHead>
              {COLUMNS.map((c) => {
                const active = query.sort.key === c.key;
                return (
                  <TableHead
                    key={c.key}
                    aria-sort={active ? (query.sort.dir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button type="button" onClick={() => sortBy(c.key)} className="flex items-center gap-1 font-medium">
                      {c.label}
                      {active &&
                        (query.sort.dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
                    </button>
                  </TableHead>
                );
              })}
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground" data-testid="table-loading">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground" data-testid="table-empty">
                  Không tìm thấy người dùng phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((u) => (
                <TableRow key={u.id} data-testid="user-row" data-selected={selected.has(u.id)}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(u.id)}
                      onCheckedChange={(c) => toggleRow(u.id, c === true)}
                      aria-label={`Chọn ${u.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{ROLE_LABEL[u.role]}</TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "secondary" : "destructive"}>{STATUS_LABEL[u.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={u.role === "admin"}
                      title={u.role === "admin" ? "Không thể khoá Admin" : undefined}
                      aria-label={`${u.status === "active" ? "Khoá" : "Mở khoá"} ${u.name}`}
                      onClick={() => setStatus(new Set([u.id]), u.status === "active" ? "locked" : "active")}
                    >
                      {u.status === "active" ? "Khoá" : "Mở khoá"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Label htmlFor="user-page-size">Số dòng mỗi trang</Label>
          <select
            id="user-page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
              setSelected(new Set());
            }}
            className="h-8 rounded-lg border bg-background px-2"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <nav aria-label="Phân trang" className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={current <= 1} onClick={() => setPage(current - 1)}>
            Trang trước
          </Button>
          <span data-testid="page-info">
            Trang {current}/{pageCount}
          </span>
          <Button size="sm" variant="outline" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>
            Trang sau
          </Button>
        </nav>
      </div>
    </div>
  );
}
