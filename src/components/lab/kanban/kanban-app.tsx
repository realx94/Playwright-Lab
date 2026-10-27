"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  COLORS,
  COLUMNS,
  KB_KEY,
  TITLE_MAX,
  WIP_LIMIT,
  colTitle,
  colorName,
  findCard,
  load,
  moveCard,
  seedState,
  undoMove,
  validateTitle,
  wipMessage,
  write,
  type Card,
  type ColId,
  type ColorId,
  type KbState,
  type MoveVia,
} from "@/lib/labs/kanban-rules";

const DOT: Record<ColorId, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
};

interface Editing {
  id: string;
  value: string;
  error: string | null;
}
interface Msg {
  kind: "error" | "success";
  text: string;
}

export function KanbanApp() {
  const bugs = useBugs();
  const [state, setState] = useState<KbState>(seedState());
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<ColId | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const dragRef = useRef<string | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setState(load());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const save = useCallback((s: KbState) => {
    setState(s);
    write(s);
  }, []);

  const reset = () => {
    try {
      localStorage.removeItem(KB_KEY);
    } catch {}
    setState(seedState());
    setMsg(null);
    setSearch("");
    setEditing(null);
    setMenu(null);
    setConfirmId(null);
    setDetailId(null);
  };

  // Giữ focus trên thẻ sau khi di chuyển bằng phím (thẻ bị mount lại ở cột mới).
  useEffect(() => {
    if (pendingFocus.current) {
      document.querySelector<HTMLElement>(`[data-card-id="${pendingFocus.current}"]`)?.focus();
      pendingFocus.current = null;
    }
  }, [state, confirmId, detailId]);

  const doMove = useCallback(
    (id: string, to: ColId, beforeId: string | null, via: MoveVia) => {
      const f = findCard(state, id);
      const r = moveCard(state, id, to, beforeId, via, bugs);
      if ("error" in r) return setMsg({ kind: "error", text: r.error });
      if (r === state || !f) return;
      save(r);
      const same = f.col === to;
      setMsg({
        kind: "success",
        text: same ? `Đã sắp xếp lại “${f.card.title}” trong ${colTitle(to)}` : `Đã chuyển “${f.card.title}” sang ${colTitle(to)}`,
      });
    },
    [state, bugs, save],
  );

  const doUndo = useCallback(() => {
    const r = undoMove(state, bugs);
    if ("error" in r) return setMsg({ kind: "error", text: r.error });
    save(r.state);
    setMsg({ kind: "success", text: r.text });
  }, [state, bugs, save]);

  const addCard = useCallback(() => {
    const id = `c${state.nextId}`;
    const card: Card = { id, title: "Thẻ mới", color: "blue", assignee: "Chưa giao" };
    save({ ...state, cols: { ...state.cols, todo: [...state.cols.todo, card] }, nextId: state.nextId + 1, undo: null });
    setEditing({ id, value: card.title, error: null });
    setMsg({ kind: "success", text: "Đã thêm thẻ mới vào Cần làm" });
  }, [state, save]);

  function removeCard(id: string) {
    const f = findCard(state, id);
    if (!f) return;
    save({ ...state, cols: { ...state.cols, [f.col]: state.cols[f.col].filter((c) => c.id !== id) }, undo: null });
    setMsg({ kind: "success", text: `Đã xoá “${f.card.title}”` });
  }

  function patchCard(id: string, patch: Partial<Card>) {
    const f = findCard(state, id);
    if (!f) return;
    save({ ...state, cols: { ...state.cols, [f.col]: state.cols[f.col].map((c) => (c.id === id ? { ...c, ...patch } : c)) } });
  }

  function commitEdit(e: Editing) {
    const v = validateTitle(e.value);
    if ("error" in v) return setEditing({ ...e, error: v.error });
    patchCard(e.id, { title: v.title });
    setEditing(null);
    setMsg({ kind: "success", text: `Đã đổi tiêu đề thành “${v.title}”` });
  }

  function recolor(id: string) {
    const f = findCard(state, id);
    if (!f) return;
    const next = COLORS[(COLORS.findIndex((c) => c.id === f.card.color) + 1) % COLORS.length].id;
    patchCard(id, { color: next });
    setMsg({ kind: "success", text: `Đã đổi màu “${f.card.title}” thành ${colorName(next)}` });
  }

  function duplicate(id: string) {
    const f = findCard(state, id);
    if (!f) return;
    if (f.col === "doing" && state.cols.doing.length >= WIP_LIMIT) return setMsg({ kind: "error", text: wipMessage("doing") });
    const copy: Card = { ...f.card, id: `c${state.nextId}`, title: `${f.card.title} (bản sao)`.slice(0, TITLE_MAX) };
    const list = [...state.cols[f.col]];
    list.splice(f.index + 1, 0, copy);
    save({ ...state, cols: { ...state.cols, [f.col]: list }, nextId: state.nextId + 1, undo: null });
    setMsg({ kind: "success", text: `Đã nhân bản “${f.card.title}”` });
  }

  function closeConfirm() {
    pendingFocus.current = confirmId;
    setConfirmId(null);
  }

  function closeDetail() {
    pendingFocus.current = detailId;
    setDetailId(null);
  }

  function openMenuAt(id: string, x: number, y: number) {
    setMenu({ id, x, y });
  }

  // Phím tắt toàn cục: N, /, Ctrl+Z, Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing = !!t?.closest("input, textarea, select, [contenteditable='true']");
      if (e.key === "Escape") {
        if (confirmId) closeConfirm();
        else if (detailId) closeDetail();
        else if (menu) {
          const id = menu.id;
          setMenu(null);
          document.querySelector<HTMLElement>(`[data-card-id="${id}"]`)?.focus();
        }
        return;
      }
      if (typing || confirmId || detailId) return;
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        doUndo();
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addCard();
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        document.getElementById("kb-search")?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmId, detailId, menu, doUndo, addCard]);

  // Menu ngữ cảnh đóng khi click ra ngoài.
  useEffect(() => {
    if (!menu) return;
    function onDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu]);

  function onCardKey(e: React.KeyboardEvent<HTMLLIElement>, card: Card, col: ColId) {
    if (e.target !== e.currentTarget) return;
    const ids = COLUMNS.map((c) => c.id);
    const i = ids.indexOf(col);
    if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      const to = ids[i + (e.key === "ArrowRight" ? 1 : -1)];
      if (!to) return;
      pendingFocus.current = card.id;
      doMove(card.id, to, null, "key");
    } else if (e.key === "Delete") {
      e.preventDefault();
      setConfirmId(card.id);
    } else if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
      e.preventDefault();
      const r = e.currentTarget.getBoundingClientRect();
      openMenuAt(card.id, r.left + 16, r.top + 16);
    }
  }

  function endDrag() {
    dragRef.current = null;
    setDragging(null);
    setOverCol(null);
  }

  function drop(e: React.DragEvent, col: ColId, beforeId: string | null) {
    e.preventDefault();
    e.stopPropagation();
    const id = dragRef.current ?? e.dataTransfer.getData("text/plain");
    endDrag();
    if (id) doMove(id, col, beforeId, "drag");
  }

  if (!ready) return null;

  const q = search.trim().toLowerCase();
  const confirmCard = confirmId ? findCard(state, confirmId) : null;
  const detail = detailId ? findCard(state, detailId) : null;
  const menuCard = menu ? findCard(state, menu.id) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="kb-search">Tìm thẻ</Label>
          <Input id="kb-search" className="w-56" placeholder="Gõ tiêu đề… (phím /)" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button type="button" size="sm" onClick={addCard} data-testid="add-card">
          Thêm thẻ (N)
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={doUndo} data-testid="undo-btn">
          Hoàn tác (Ctrl+Z)
        </Button>
      </div>

      {msg && (
        <p
          data-testid="kb-message"
          role={msg.kind === "error" ? "alert" : "status"}
          className={msg.kind === "error" ? "text-sm text-red-700 dark:text-red-400" : "text-sm text-green-800 dark:text-green-400"}
        >
          {msg.text}
        </p>
      )}

      <section aria-label="Bảng Kanban" data-testid="board" className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const all = state.cols[col.id];
          const shown = all.filter((c) => !q || c.title.toLowerCase().includes(q));
          return (
            <section
              key={col.id}
              aria-label={`Cột ${col.title}`}
              data-testid={`col-${col.id}`}
              data-over={overCol === col.id ? "true" : undefined}
              className="flex flex-col rounded-xl border bg-muted/30 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{col.title}</h2>
                <span data-testid={`count-${col.id}`} className="text-xs text-muted-foreground">
                  {col.id === "doing" ? `${all.length}/${WIP_LIMIT}` : all.length}
                </span>
              </div>
              <div
                data-testid={`drop-${col.id}`}
                onDragOver={(e) => {
                  if (!dragRef.current) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overCol !== col.id) setOverCol(col.id);
                }}
                onDrop={(e) => drop(e, col.id, null)}
                className={`min-h-48 flex-1 rounded-lg p-1 pb-10 ${overCol === col.id ? "bg-accent/60 ring-2 ring-ring" : ""}`}
              >
                <ul role="list" className="space-y-2">
                  {shown.map((card) => {
                    const isEditing = editing?.id === card.id;
                    return (
                      <li
                        key={card.id}
                        data-testid="card"
                        data-card-id={card.id}
                        data-col={col.id}
                        tabIndex={0}
                        draggable={!isEditing}
                        onDragStart={(e) => {
                          dragRef.current = card.id;
                          setDragging(card.id);
                          e.dataTransfer.setData("text/plain", card.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={endDrag}
                        onDragOver={(e) => {
                          if (!dragRef.current) return;
                          e.preventDefault();
                          if (overCol !== col.id) setOverCol(col.id);
                        }}
                        onDrop={(e) => drop(e, col.id, card.id)}
                        onMouseEnter={() => setHover(card.id)}
                        onMouseLeave={() => setHover((h) => (h === card.id ? null : h))}
                        onFocus={() => setFocused(card.id)}
                        onBlur={() => setFocused((f) => (f === card.id ? null : f))}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          openMenuAt(card.id, e.clientX, e.clientY);
                        }}
                        onKeyDown={(e) => onCardKey(e, card, col.id)}
                        className={`cursor-grab space-y-1.5 rounded-lg border bg-card p-2.5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          dragging === card.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="card-color" data-color={card.color}>
                            <span aria-hidden="true" className={`size-2.5 rounded-full ${DOT[card.color]}`} />
                            {colorName(card.color)}
                          </span>
                          {(hover === card.id || focused === card.id) && !isEditing && (
                            <button
                              type="button"
                              data-testid="quick-delete"
                              onClick={() => setConfirmId(card.id)}
                              className="rounded border px-1.5 text-xs text-red-700 hover:bg-accent dark:text-red-400"
                            >
                              Xoá nhanh
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              autoFocus
                              aria-label="Sửa tiêu đề thẻ"
                              data-testid="title-input"
                              value={editing.value}
                              onFocus={(e) => e.currentTarget.select()}
                              onChange={(e) => setEditing({ ...editing, value: e.target.value, error: null })}
                              onBlur={() => setEditing((cur) => (cur?.id === card.id ? null : cur))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  commitEdit(editing);
                                } else if (e.key === "Escape") {
                                  e.preventDefault();
                                  // BUG-02: Escape lưu thay vì huỷ.
                                  if (bugs.has("BUG-02")) commitEdit(editing);
                                  else setEditing(null);
                                }
                              }}
                            />
                            {editing.error && (
                              <p role="alert" data-testid="title-error" className="text-xs text-red-700 dark:text-red-400">
                                {editing.error}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p
                            data-testid="card-title"
                            onDoubleClick={() => setEditing({ id: card.id, value: card.title, error: null })}
                            className="font-medium"
                          >
                            {card.title}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Phụ trách: <span data-testid="card-assignee">{card.assignee}</span>
                        </p>
                      </li>
                    );
                  })}
                </ul>
                {shown.length === 0 && (
                  <p data-testid={`empty-${col.id}`} className="py-4 text-center text-xs text-muted-foreground">
                    {q ? "Không có thẻ khớp" : "Chưa có thẻ"}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </section>

      <p className="text-xs text-muted-foreground">
        Phím tắt: N thêm thẻ, / tìm kiếm, Ctrl+Z hoàn tác di chuyển; trên thẻ đang focus: Alt+←/→ đổi cột, Delete xoá, phím Menu hoặc Shift+F10 mở menu.
      </p>

      {menu && menuCard && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Menu thẻ"
          data-testid="context-menu"
          style={{ left: menu.x, top: menu.y }}
          className="fixed z-50 min-w-40 rounded-lg border bg-popover p-1 text-sm shadow-md"
        >
          {[
            { label: "Mở chi tiết", run: () => setDetailId(menu.id) },
            { label: "Đổi màu", run: () => recolor(menu.id) },
            { label: "Nhân bản", run: () => duplicate(menu.id) },
            { label: "Xoá", run: () => setConfirmId(menu.id) },
          ].map((it, i) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              autoFocus={i === 0}
              onClick={() => {
                setMenu(null);
                it.run();
              }}
              className="block w-full rounded px-2 py-1.5 text-left hover:bg-accent focus:bg-accent focus:outline-none"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}

      {confirmCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="alertdialog" aria-modal="true" aria-label="Xác nhận xoá thẻ" data-testid="confirm-dialog" className="w-full max-w-sm space-y-4 rounded-xl border bg-background p-5">
            <p>
              Bạn có chắc muốn xoá thẻ “<strong>{confirmCard.card.title}</strong>”?
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" autoFocus onClick={closeConfirm} data-testid="confirm-cancel">
                Giữ lại
              </Button>
              <Button
                type="button"
                variant="destructive"
                data-testid="confirm-ok"
                onClick={() => {
                  removeCard(confirmCard.card.id);
                  setConfirmId(null);
                }}
              >
                Đồng ý xoá
              </Button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Chi tiết thẻ" data-testid="detail-dialog" className="w-full max-w-sm space-y-3 rounded-xl border bg-background p-5">
            <h2 className="text-lg font-semibold" data-testid="detail-title">
              {detail.card.title}
            </h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Cột</dt>
              <dd data-testid="detail-col">{colTitle(detail.col)}</dd>
              <dt className="text-muted-foreground">Phụ trách</dt>
              <dd data-testid="detail-assignee">{detail.card.assignee}</dd>
              <dt className="text-muted-foreground">Nhãn màu</dt>
              <dd data-testid="detail-color">{colorName(detail.card.color)}</dd>
            </dl>
            <div className="flex justify-end">
              <Button type="button" variant="outline" autoFocus onClick={closeDetail} data-testid="detail-close">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
