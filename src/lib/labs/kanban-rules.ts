export const KB_KEY = "lab:kanban";

export const BUGS = [
  { id: "BUG-01", hint: "Giới hạn WIP không được kiểm khi kéo thả (phím tắt vẫn kiểm)" },
  { id: "BUG-02", hint: "Nhấn Escape khi sửa tiêu đề lại lưu thay vì huỷ" },
  { id: "BUG-03", hint: "Hoàn tác (Ctrl+Z) đưa thẻ về sai cột" },
];

export const WIP_LIMIT = 3;
export const TITLE_MAX = 80;

export type ColId = "todo" | "doing" | "done";
export const COLUMNS: { id: ColId; title: string }[] = [
  { id: "todo", title: "Cần làm" },
  { id: "doing", title: "Đang làm" },
  { id: "done", title: "Xong" },
];
export const colTitle = (id: ColId) => COLUMNS.find((c) => c.id === id)!.title;

export const COLORS = [
  { id: "blue", name: "Xanh dương" },
  { id: "green", name: "Xanh lá" },
  { id: "red", name: "Đỏ" },
  { id: "amber", name: "Vàng" },
] as const;
export type ColorId = (typeof COLORS)[number]["id"];
export const colorName = (id: ColorId) => COLORS.find((c) => c.id === id)!.name;

export interface Card {
  id: string;
  title: string;
  color: ColorId;
  assignee: string;
}

export interface UndoEntry {
  id: string;
  from: ColId;
  index: number;
}

export interface KbState {
  cols: Record<ColId, Card[]>;
  nextId: number;
  undo: UndoEntry | null;
}

export const seedState = (): KbState => ({
  cols: {
    todo: [
      { id: "c1", title: "Thiết kế trang đăng nhập", color: "blue", assignee: "An" },
      { id: "c2", title: "Viết tài liệu API", color: "green", assignee: "Bình" },
      { id: "c3", title: "Sửa lỗi giỏ hàng", color: "red", assignee: "Chi" },
    ],
    doing: [
      { id: "c4", title: "Tối ưu truy vấn", color: "amber", assignee: "Dũng" },
      { id: "c5", title: "Review PR số 42", color: "blue", assignee: "An" },
    ],
    done: [{ id: "c6", title: "Cấu hình CI", color: "green", assignee: "Bình" }],
  },
  nextId: 7,
  undo: null,
});

export function load(): KbState {
  try {
    const raw = localStorage.getItem(KB_KEY);
    return raw ? { ...seedState(), ...JSON.parse(raw) } : seedState();
  } catch {
    return seedState();
  }
}

export function write(s: KbState) {
  try {
    localStorage.setItem(KB_KEY, JSON.stringify(s));
  } catch {}
}

export function findCard(s: KbState, id: string): { card: Card; col: ColId; index: number } | null {
  for (const c of COLUMNS) {
    const index = s.cols[c.id].findIndex((x) => x.id === id);
    if (index >= 0) return { card: s.cols[c.id][index], col: c.id, index };
  }
  return null;
}

export const wipMessage = (col: ColId) => `Cột ${colTitle(col)} đã đủ ${WIP_LIMIT} thẻ, không thể thêm thẻ nữa`;

export type MoveVia = "drag" | "key" | "menu";

/**
 * Di chuyển thẻ sang cột `to`, chèn trước thẻ `beforeId` (null = cuối cột). Cùng cột = sắp xếp lại.
 * BR-03: cột Đang làm tối đa 3 thẻ khi thêm thẻ từ cột khác. BUG-01: bỏ qua kiểm tra khi kéo thả.
 */
export function moveCard(
  s: KbState,
  id: string,
  to: ColId,
  beforeId: string | null,
  via: MoveVia,
  bugs: Set<string>,
): KbState | { error: string } {
  const f = findCard(s, id);
  if (!f) return { error: "Không tìm thấy thẻ" };
  if (to === "doing" && f.col !== "doing" && s.cols.doing.length >= WIP_LIMIT && !(via === "drag" && bugs.has("BUG-01"))) {
    return { error: wipMessage("doing") };
  }
  if (beforeId === id) return s;
  const cols = { ...s.cols, [f.col]: s.cols[f.col].filter((c) => c.id !== id) };
  const target = [...cols[to]];
  const at = beforeId ? target.findIndex((c) => c.id === beforeId) : -1;
  target.splice(at >= 0 ? at : target.length, 0, f.card);
  cols[to] = target;
  return { ...s, cols, undo: { id, from: f.col, index: f.index } };
}

/** BR-07: hoàn tác thao tác di chuyển gần nhất. BUG-03: thẻ về cột liền trước (vòng tròn) thay vì cột gốc. */
export function undoMove(s: KbState, bugs: Set<string>): { state: KbState; text: string } | { error: string } {
  if (!s.undo) return { error: "Không có thao tác nào để hoàn tác" };
  const f = findCard(s, s.undo.id);
  if (!f) return { error: "Không có thao tác nào để hoàn tác" };
  const ids = COLUMNS.map((c) => c.id);
  const dest = bugs.has("BUG-03") ? ids[(ids.indexOf(s.undo.from) + 2) % 3] : s.undo.from;
  const cols = { ...s.cols, [f.col]: s.cols[f.col].filter((c) => c.id !== f.card.id) };
  const list = [...cols[dest]];
  list.splice(Math.min(s.undo.index, list.length), 0, f.card);
  cols[dest] = list;
  return { state: { ...s, cols, undo: null }, text: `Đã hoàn tác: “${f.card.title}” về ${colTitle(dest)}` };
}

export function validateTitle(raw: string): { title: string } | { error: string } {
  const t = raw.trim();
  if (!t) return { error: "Tiêu đề không được để trống" };
  if (t.length > TITLE_MAX) return { error: `Tiêu đề tối đa ${TITLE_MAX} ký tự` };
  return { title: t };
}
