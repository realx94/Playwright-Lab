"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  ANNUAL_BALANCE,
  LEAVE_KEY,
  ROLE_KEY,
  STATUS_LABEL,
  TYPE_LABEL,
  balance,
  countDays,
  emptyLeave,
  validateRequest,
  type Draft,
  type LeaveRequest,
  type LeaveState,
  type LeaveType,
  type Role,
} from "@/lib/labs/leave-rules";

const blank: Draft = { type: "annual", from: "", to: "", reason: "" };

function load(): LeaveState {
  try {
    return { ...emptyLeave, ...JSON.parse(localStorage.getItem(LEAVE_KEY) ?? "{}") };
  } catch {
    return emptyLeave;
  }
}

export function LeaveApp() {
  const bugs = useBugs();
  const [state, setState] = useState<LeaveState>(emptyLeave);
  const [role, setRole] = useState<Role>("employee");
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<Draft>(blank);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setState(load());
    try {
      const r = sessionStorage.getItem(ROLE_KEY);
      if (r === "manager" || r === "employee") setRole(r);
    } catch {}
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // Đồng bộ giữa các tab: dữ liệu dùng chung localStorage, mỗi tab có vai trò riêng (sessionStorage).
    const onStorage = (e: StorageEvent) => e.key === LEAVE_KEY && setState(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function persist(next: LeaveState) {
    setState(next);
    try {
      localStorage.setItem(LEAVE_KEY, JSON.stringify(next));
    } catch {}
  }

  function changeRole(r: Role) {
    setRole(r);
    try {
      sessionStorage.setItem(ROLE_KEY, r);
    } catch {}
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const current = load();
    const err = validateRequest(draft, current, bugs);
    if (err) return setError(err);
    const req: LeaveRequest = {
      id: current.nextId,
      type: draft.type,
      from: draft.from,
      to: draft.to,
      days: countDays(draft.from, draft.to, bugs),
      reason: draft.reason.trim(),
      status: "pending",
    };
    persist({ nextId: current.nextId + 1, requests: [...current.requests, req] });
    setDraft(blank);
    setError(null);
  }

  function update(id: number, patch: Partial<LeaveRequest>) {
    const current = load();
    persist({ ...current, requests: current.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  }

  function confirmReject() {
    if (!rejecting) return;
    if (rejectReason.trim().length === 0) return setRejectError("Vui lòng nhập lý do từ chối");
    update(rejecting.id, { status: "rejected", rejectReason: rejectReason.trim() });
    setRejecting(null);
    setRejectReason("");
    setRejectError(null);
  }

  function reset() {
    try {
      localStorage.removeItem(LEAVE_KEY);
    } catch {}
    setState(emptyLeave);
    setDraft(blank);
    setError(null);
  }

  if (!ready) return null;

  // BUG-02: nhân viên cũng thấy nút duyệt/từ chối
  const canApprove = role === "manager" || bugs.has("BUG-02");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="leave-role">Vai trò</Label>
          <select
            id="leave-role"
            value={role}
            onChange={(e) => changeRole(e.target.value as Role)}
            className="h-9 rounded-lg border bg-background px-2 text-sm"
          >
            <option value="employee">Nhân viên</option>
            <option value="manager">Quản lý</option>
          </select>
        </div>
        <p className="text-sm" data-testid="leave-balance">
          Phép năm còn {balance(state.requests)}/{ANNUAL_BALANCE} ngày
        </p>
        <Button variant="ghost" onClick={reset} data-testid="reset-data">
          Reset dữ liệu lab
        </Button>
      </div>

      {role === "employee" && (
        <form onSubmit={submit} noValidate aria-label="Tạo đơn nghỉ phép" className="space-y-4 rounded-xl border p-4">
          <h2 className="font-semibold">Tạo đơn nghỉ phép</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="leave-type">Loại nghỉ</Label>
              <select
                id="leave-type"
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as LeaveType })}
                className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
              >
                {(Object.keys(TYPE_LABEL) as LeaveType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leave-from">Từ ngày</Label>
              <Input id="leave-from" type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leave-to">Đến ngày</Label>
              <Input id="leave-to" type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="leave-reason">Lý do</Label>
            <Textarea id="leave-reason" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive" data-testid="leave-error">
              {error}
            </p>
          )}
          <Button type="submit">Gửi đơn</Button>
        </form>
      )}

      <section aria-label="Danh sách đơn nghỉ phép" className="space-y-2">
        <h2 className="font-semibold">{role === "manager" ? "Đơn cần xử lý" : "Đơn của tôi"}</h2>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Từ</TableHead>
                <TableHead>Đến</TableHead>
                <TableHead>Số ngày</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground" data-testid="leave-empty">
                    Chưa có đơn nào.
                  </TableCell>
                </TableRow>
              ) : (
                state.requests.map((r) => (
                  <TableRow key={r.id} data-testid="leave-row">
                    <TableCell>#{r.id}</TableCell>
                    <TableCell>{TYPE_LABEL[r.type]}</TableCell>
                    <TableCell>{r.from}</TableCell>
                    <TableCell>{r.to}</TableCell>
                    <TableCell data-testid={`leave-days-${r.id}`}>{r.days}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "rejected" ? "destructive" : "secondary"} data-testid={`leave-status-${r.id}`}>
                        {STATUS_LABEL[r.status]}
                      </Badge>
                      {r.rejectReason && <p className="mt-1 text-xs text-muted-foreground">Lý do: {r.rejectReason}</p>}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      {r.status === "pending" && canApprove && (
                        <>
                          <Button size="sm" aria-label={`Duyệt đơn #${r.id}`} onClick={() => update(r.id, { status: "approved" })}>
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`Từ chối đơn #${r.id}`}
                            onClick={() => setRejecting(r)}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      {r.status === "pending" && role === "employee" && (
                        <Button size="sm" variant="outline" aria-label={`Huỷ đơn #${r.id}`} onClick={() => update(r.id, { status: "cancelled" })}>
                          Huỷ đơn
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={rejecting !== null} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đơn #{rejecting?.id}</DialogTitle>
            <DialogDescription>Nhập lý do để nhân viên biết vì sao đơn bị từ chối.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Lý do từ chối</Label>
            <Textarea id="reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            {rejectError && (
              <p role="alert" className="text-sm text-destructive" data-testid="reject-error">
                {rejectError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Đóng
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
