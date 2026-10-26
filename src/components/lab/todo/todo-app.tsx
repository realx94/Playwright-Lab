"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MAX_TASKS,
  PRIORITY_LABEL,
  TODO_KEY,
  applyFilter,
  canAddMore,
  emptyTodo,
  remaining,
  validateTitle,
  type Filter,
  type Priority,
  type Task,
  type TodoState,
} from "@/lib/labs/todo-rules";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang làm" },
  { id: "done", label: "Hoàn thành" },
];

function load(): TodoState {
  try {
    return { ...emptyTodo, ...JSON.parse(localStorage.getItem(TODO_KEY) ?? "{}") };
  } catch {
    return emptyTodo;
  }
}

export function TodoApp() {
  const params = useSearchParams();
  const bugs = new Set((params.get("bugs") ?? "").split(",").filter(Boolean));

  const [state, setState] = useState<TodoState>(emptyTodo);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<{ id: number; value: string } | null>(null);
  const [toDelete, setToDelete] = useState<Task | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(load());
    setReady(true);
  }, []);

  function save(next: TodoState) {
    setState(next);
    try {
      localStorage.setItem(TODO_KEY, JSON.stringify(next));
    } catch {}
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!canAddMore(state.tasks, bugs)) return setError(`Tối đa ${MAX_TASKS} công việc`);
    const err = validateTitle(title, state.tasks, bugs);
    if (err) return setError(err);
    save({
      nextId: state.nextId + 1,
      tasks: [...state.tasks, { id: state.nextId, title: title.trim(), priority, done: false }],
    });
    setTitle("");
    setError(null);
  }

  function toggle(id: number, done: boolean) {
    save({ ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, done } : t)) });
  }

  function saveEdit() {
    if (!editing) return;
    const err = validateTitle(editing.value, state.tasks, bugs, editing.id);
    if (err) return setError(err);
    save({
      ...state,
      tasks: state.tasks.map((t) => (t.id === editing.id ? { ...t, title: editing.value.trim() } : t)),
    });
    setEditing(null);
    setError(null);
  }

  function confirmDelete() {
    if (!toDelete) return;
    save({ ...state, tasks: state.tasks.filter((t) => t.id !== toDelete.id) });
    setToDelete(null);
  }

  function clearDone() {
    save({ ...state, tasks: state.tasks.filter((t) => !t.done) });
  }

  function reset() {
    try {
      localStorage.removeItem(TODO_KEY);
    } catch {}
    setState(emptyTodo);
    setTitle("");
    setError(null);
    setEditing(null);
    setFilter("all");
  }

  if (!ready) return null;
  const visible = applyFilter(state.tasks, filter);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <form onSubmit={add} noValidate className="space-y-3 rounded-xl border p-4" aria-label="Thêm công việc">
        <div className="space-y-1.5">
          <Label htmlFor="todo-title">Công việc mới</Label>
          <Input id="todo-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="todo-priority">Ưu tiên</Label>
            <select
              id="todo-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="h-9 rounded-lg border bg-background px-2 text-sm"
            >
              {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Thêm</Button>
          <Button type="button" variant="ghost" onClick={reset} data-testid="reset-data">
            Reset dữ liệu lab
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive" data-testid="todo-error">
            {error}
          </p>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Bộ lọc" className="flex gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={filter === f.id ? "default" : "outline"}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <p className="text-sm" data-testid="todo-count">
          Còn {remaining(state.tasks, bugs)} việc
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground" data-testid="todo-empty">
          Không có công việc nào.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border" aria-label="Danh sách công việc">
          {visible.map((t) => (
            <li key={t.id} data-testid="todo-item" className="flex items-center gap-3 p-3">
              <Checkbox
                checked={t.done}
                onCheckedChange={(c) => toggle(t.id, c === true)}
                aria-label={`Hoàn thành: ${t.title}`}
              />
              {editing?.id === t.id ? (
                <>
                  <Input
                    aria-label="Sửa tên công việc"
                    value={editing.value}
                    onChange={(e) => setEditing({ id: t.id, value: e.target.value })}
                    className="h-8"
                  />
                  <Button size="sm" onClick={saveEdit}>
                    Lưu
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                    Huỷ
                  </Button>
                </>
              ) : (
                <>
                  <span className={t.done ? "flex-1 text-muted-foreground line-through" : "flex-1"} data-testid="todo-title">
                    {t.title}
                  </span>
                  <Badge variant="secondary">{PRIORITY_LABEL[t.priority]}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={`Sửa ${t.title}`}
                    onClick={() => {
                      setError(null);
                      setEditing({ id: t.id, value: t.title });
                    }}
                  >
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline" aria-label={`Xoá ${t.title}`} onClick={() => setToDelete(t)}>
                    Xoá
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <Button variant="ghost" size="sm" onClick={clearDone} disabled={!state.tasks.some((t) => t.done)}>
        Xoá các việc đã xong
      </Button>

      <Dialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá công việc?</DialogTitle>
            <DialogDescription>
              Bạn sắp xoá “{toDelete?.title}”. Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Giữ lại
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xoá hẳn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
