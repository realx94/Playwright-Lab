export const TODO_KEY = "lab:todo";
export const MAX_TASKS = 20;
export const TITLE_MAX = 80;

export type Priority = "low" | "medium" | "high";
export type Filter = "all" | "active" | "done";

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Thấp",
  medium: "Vừa",
  high: "Cao",
};

export interface Task {
  id: number;
  title: string;
  priority: Priority;
  done: boolean;
}

export interface TodoState {
  nextId: number;
  tasks: Task[];
}

export const emptyTodo: TodoState = { nextId: 1, tasks: [] };

export const BUGS = [
  { id: "BUG-01", hint: "Kiểm tra trùng tiêu đề" },
  { id: "BUG-02", hint: "Bộ đếm công việc còn lại" },
  { id: "BUG-03", hint: "Giới hạn số công việc" },
];

/** Trả về thông báo lỗi hoặc null nếu hợp lệ. */
export function validateTitle(
  raw: string,
  tasks: Task[],
  bugs: Set<string>,
  ignoreId?: number,
): string | null {
  const title = raw.trim();
  if (title.length === 0) return "Vui lòng nhập tên công việc";
  if (title.length > TITLE_MAX) return `Tên công việc tối đa ${TITLE_MAX} ký tự`;
  const dup = tasks.some((t) => {
    if (t.id === ignoreId) return false;
    // BUG-01: so sánh phân biệt hoa thường nên "Mua sữa" và "mua sữa" bị coi là khác nhau
    return bugs.has("BUG-01") ? t.title === title : t.title.toLowerCase() === title.toLowerCase();
  });
  if (dup) return "Công việc này đã tồn tại";
  return null;
}

export function canAddMore(tasks: Task[], bugs: Set<string>): boolean {
  // BUG-03: cho phép tới 21 công việc
  return tasks.length < (bugs.has("BUG-03") ? MAX_TASKS + 1 : MAX_TASKS);
}

export function remaining(tasks: Task[], bugs: Set<string>): number {
  // BUG-02: đếm cả công việc đã hoàn thành
  return bugs.has("BUG-02") ? tasks.length : tasks.filter((t) => !t.done).length;
}

export function applyFilter(tasks: Task[], f: Filter): Task[] {
  return f === "active" ? tasks.filter((t) => !t.done) : f === "done" ? tasks.filter((t) => t.done) : tasks;
}
