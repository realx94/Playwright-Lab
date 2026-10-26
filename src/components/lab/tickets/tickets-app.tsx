"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  PRIORITIES,
  TICKET_KEY,
  TRANSITIONS,
  clock,
  deadlineOf,
  loadTickets,
  slaState,
  validateTicket,
  type Status,
  type Ticket,
} from "@/lib/labs/ticket-rules";

type Msg = { kind: "error" | "success"; text: string } | null;

/** Hỗ trợ khách hàng: tạo ticket có tệp đính kèm, luồng trạng thái, SLA theo mức ưu tiên, bình luận. */
export function TicketsApp() {
  const bugs = useBugs();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setTickets(loadTickets());
    setNow(clock());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = setInterval(() => setNow(clock()), 500);
    return () => clearInterval(t);
  }, []);

  function save(next: Ticket[]) {
    setTickets(next);
    try {
      localStorage.setItem(TICKET_KEY, JSON.stringify(next));
    } catch {}
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateTicket({ title, description, priority, file });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const id = `T${String(tickets.length + 1).padStart(4, "0")}`;
    save([...tickets, { id, title: title.trim(), description: description.trim(), priority, attachment: file?.name ?? null, status: "Mới", createdAt: clock(), resolvedAt: null, comments: [] }]);
    setMsg({ kind: "success", text: `Đã tạo ticket ${id}` });
    setTitle("");
    setDescription("");
    setPriority("");
    setFile(null);
    setOpenId(id);
  }

  const current = tickets.find((t) => t.id === openId) ?? null;

  function update(id: string, patch: Partial<Ticket>) {
    save(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function move(t: Ticket, to: Status) {
    // BR-05: chỉ giải quyết khi đã có ít nhất một bình luận
    if (to === "Đã giải quyết" && t.comments.length === 0) return setMsg({ kind: "error", text: "Cần ít nhất một bình luận trước khi giải quyết" });
    update(t.id, { status: to, resolvedAt: to === "Đã giải quyết" ? clock() : to === "Đang xử lý" ? null : t.resolvedAt });
    setMsg({ kind: "success", text: `Ticket ${t.id} chuyển sang ${to}` });
  }

  function addComment(t: Ticket) {
    // BR-06: ticket đã đóng không nhận bình luận. BUG-03: vẫn nhận.
    if (t.status === "Đóng" && !bugs.has("BUG-03")) return setMsg({ kind: "error", text: "Ticket đã đóng, không thể bình luận" });
    const text = comment.trim();
    if (!text) return setMsg({ kind: "error", text: "Bình luận không được để trống" });
    update(t.id, { comments: [...t.comments, { at: clock(), text }] });
    setComment("");
    setMsg(null);
  }

  function reset() {
    try {
      localStorage.removeItem(TICKET_KEY);
    } catch {}
    setTickets([]);
    setOpenId(null);
    setMsg(null);
    setErrors({});
  }

  if (!ready) return null;

  const err = (k: string) =>
    errors[k] && (
      <p role="alert" className="text-sm text-destructive" data-testid={`error-${k}`}>
        {errors[k]}
      </p>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <form onSubmit={create} noValidate aria-label="Tạo ticket" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Tạo ticket hỗ trợ</h2>
        <div className="space-y-1.5">
          <Label htmlFor="tk-title">Tiêu đề</Label>
          <Input id="tk-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          {err("title")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tk-desc">Mô tả</Label>
          <textarea id="tk-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border bg-transparent px-2.5 py-1 text-sm" />
          {err("description")}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tk-priority">Mức ưu tiên</Label>
            <select id="tk-priority" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">— Chọn —</option>
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {err("priority")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tk-file">Tệp đính kèm</Label>
            <Input id="tk-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ? { name: e.target.files[0].name, size: e.target.files[0].size } : null)} />
            {err("file")}
          </div>
        </div>
        <Button type="submit">Tạo ticket</Button>
      </form>

      {msg && (
        <p role="alert" className={msg.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid="ticket-message">
          {msg.text}
        </p>
      )}

      <section aria-label="Danh sách ticket" className="space-y-2 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Ticket ({tickets.length})</h2>
        {tickets.length === 0 && <p className="text-sm text-muted-foreground">Chưa có ticket.</p>}
        <ul className="space-y-2">
          {tickets.map((t) => {
            const sla = slaState(t, now, bugs);
            return (
              <li key={t.id} data-testid="ticket-row" className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <span>
                  <b>{t.id}</b> · {t.title} · <span data-testid="row-status">{t.status}</span> · {PRIORITIES.find((p) => p.id === t.priority)?.label}
                  <span className={sla.overdue ? "ml-2 text-destructive" : "ml-2 text-muted-foreground"}>{sla.label}</span>
                </span>
                <Button size="sm" variant="outline" aria-label={`Mở ${t.id}`} onClick={() => { setOpenId(t.id); setMsg(null); }}>
                  Mở
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      {current && (
        <section aria-label={`Chi tiết ${current.id}`} className="space-y-3 rounded-xl border-2 border-primary p-5">
          <h2 className="text-lg font-semibold" data-testid="detail-title">
            {current.id} · {current.title}
          </h2>
          <p className="text-sm">{current.description}</p>
          {current.attachment && (
            <p className="text-sm" data-testid="detail-attachment">
              Tệp đính kèm: {current.attachment}
            </p>
          )}
          <p className="text-sm">
            Trạng thái: <b data-testid="ticket-status">{current.status}</b>
          </p>
          <p className="text-sm" data-testid="ticket-deadline">
            Hạn xử lý: {new Date(deadlineOf(current, bugs)).toISOString().slice(0, 16).replace("T", " ")} UTC
          </p>
          <p className="text-sm" data-testid="ticket-sla">
            SLA: {slaState(current, now, bugs).label}
          </p>
          <div className="flex flex-wrap gap-2">
            {TRANSITIONS[current.status].map((to) => (
              <Button key={to} size="sm" onClick={() => move(current, to)}>
                {`Chuyển sang ${to}`}
              </Button>
            ))}
            {TRANSITIONS[current.status].length === 0 && <span className="text-sm text-muted-foreground">Ticket đã đóng, không còn thao tác.</span>}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Bình luận ({current.comments.length})</h3>
            <ul className="space-y-1 text-sm">
              {current.comments.map((c, i) => (
                <li key={i} data-testid="comment">
                  {c.text}
                </li>
              ))}
            </ul>
            <div className="space-y-1.5">
              <Label htmlFor="tk-comment">Bình luận</Label>
              <textarea id="tk-comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full rounded-lg border bg-transparent px-2.5 py-1 text-sm" />
            </div>
            <Button size="sm" variant="outline" onClick={() => addComment(current)}>
              Gửi bình luận
            </Button>
          </div>
        </section>
      )}

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
