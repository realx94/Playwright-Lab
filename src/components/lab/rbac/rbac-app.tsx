"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import { CAN, USERS, type Doc, type RbacUser } from "@/lib/labs/rbac-rules";

const KEY = "lab:rbac:user";

/** Quản lý tài liệu nhiều tổ chức và vai trò; người dùng đang chọn lưu theo từng tab để mở nhiều người cùng lúc. */
export function RbacApp() {
  const bugs = useBugs();
  const [user, setUser] = useState<RbacUser | null>(null);
  const [choice, setChoice] = useState(USERS[0].id);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [ready, setReady] = useState(false);

  const q = [...bugs].length ? `?bugs=${[...bugs].join(",")}` : "";
  const call = useCallback(
    (path: string, init: RequestInit = {}, as?: RbacUser | null) =>
      fetch(path + q, { ...init, headers: { ...(init.headers ?? {}), authorization: `Bearer ${(as ?? user)?.id}`, "content-type": "application/json" } }),
    [q, user],
  );

  const load = useCallback(
    async (as: RbacUser) => {
      const res = await call("/api/lab/rbac/docs", {}, as);
      setDocs(((await res.json()) as { data: Doc[] }).data);
    },
    [call],
  );

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = sessionStorage.getItem(KEY);
    const u = USERS.find((x) => x.id === saved) ?? null;
    if (u) {
      setUser(u);
      setChoice(u.id);
      void load(u);
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const u = USERS.find((x) => x.id === choice)!;
    sessionStorage.setItem(KEY, u.id);
    setUser(u);
    setMessage(null);
    await load(u);
  }

  function signOut() {
    sessionStorage.removeItem(KEY);
    setUser(null);
    setDocs([]);
    setMessage(null);
  }

  async function act(label: string, path: string, init: RequestInit) {
    const res = await call(path, init);
    if (res.ok) setMessage({ kind: "success", text: `${label}: thành công` });
    else setMessage({ kind: "error", text: `${label}: ${((await res.json()) as { message: string }).message}` });
    if (user) await load(user);
  }

  async function reset() {
    await fetch("/api/lab/reset", { method: "POST" });
    if (user) await load(user);
    setMessage(null);
  }

  if (!ready) return null;

  if (!user)
    return (
      <form onSubmit={signIn} noValidate aria-label="Đăng nhập hệ thống" className="mx-auto max-w-sm space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Đăng nhập</h2>
        <div className="space-y-1.5">
          <Label htmlFor="rbac-user">Người dùng</Label>
          <select id="rbac-user" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={choice} onChange={(e) => setChoice(e.target.value)}>
            {USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {`${u.name} (tổ chức ${u.tenant}, ${u.role})`}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full">
          Vào hệ thống
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
          Reset dữ liệu lab
        </Button>
      </form>
    );

  const canCreate = CAN.create.includes(user.role);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between rounded-xl border p-4">
        <p className="text-sm" data-testid="rbac-me">
          {user.name} · tổ chức {user.tenant} · vai trò {user.role}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={signOut}>
            Đăng xuất
          </Button>
          <Button size="sm" variant="ghost" onClick={reset} data-testid="reset-data">
            Reset dữ liệu lab
          </Button>
        </div>
      </div>

      {canCreate && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void act("Tạo tài liệu", "/api/lab/rbac/docs", { method: "POST", body: JSON.stringify({ title }) }).then(() => setTitle(""));
          }}
          noValidate
          aria-label="Tạo tài liệu"
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="doc-title">Tiêu đề tài liệu mới</Label>
            <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <Button type="submit">Tạo</Button>
        </form>
      )}

      {message && (
        <p role="alert" className={message.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid="rbac-message">
          {message.text}
        </p>
      )}

      <ul aria-label="Danh sách tài liệu" className="space-y-2">
        {docs.map((d) => {
          const canEdit = CAN.edit.includes(user.role) || (user.role === "staff" && d.owner === user.id);
          const canDelete = CAN.delete.includes(user.role);
          return (
            <li key={d.id} data-testid="doc-row" data-id={d.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>
                <b>{d.title}</b> <span className="text-muted-foreground">({d.id}, tổ chức {d.tenant})</span>
              </span>
              <span className="flex gap-2">
                {canEdit && (
                  <Button size="sm" variant="outline" aria-label={`Sửa ${d.id}`} onClick={() => act(`Sửa ${d.id}`, `/api/lab/rbac/docs/${d.id}`, { method: "PATCH", body: JSON.stringify({ title: `${d.title} (đã sửa)` }) })}>
                    Sửa
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="outline" aria-label={`Xoá ${d.id}`} onClick={() => act(`Xoá ${d.id}`, `/api/lab/rbac/docs/${d.id}`, { method: "DELETE" })}>
                    Xoá
                  </Button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
