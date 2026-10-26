import { EXERCISES, type Exercise } from "@/lib/labs/exercises";
import type { ExerciseAttempt } from "@/lib/storage";

export interface GradeResult {
  version: number;
  exerciseId: string;
  lab: string;
  cleanPassed: boolean;
  bugs: { id: string; caught: boolean }[];
  gradedAt: string;
}

export function findExercise(id: string): { lab: string; exercise: Exercise } | undefined {
  for (const [lab, list] of Object.entries(EXERCISES)) {
    const exercise = list.find((e) => e.id === id);
    if (exercise) return { lab, exercise };
  }
}

/**
 * Chuyển file kết quả của `npm run grade` thành một lần nộp bài.
 * Tổng điểm lấy từ định nghĩa bài tập trên site (không tin vào file) để không thể giảm số bug cần bắt.
 * Lưu ý: không có máy chủ chấm nên file có thể bị sửa tay; điểm này chỉ dành cho việc tự học.
 */
export function attemptFromGrade(raw: unknown, now = Date.now()): ExerciseAttempt {
  if (!raw || typeof raw !== "object") throw new Error("File không phải kết quả chấm hợp lệ");
  const r = raw as Partial<GradeResult>;
  if (r.version !== 1 || typeof r.exerciseId !== "string" || typeof r.cleanPassed !== "boolean" || !Array.isArray(r.bugs))
    throw new Error("File không phải kết quả chấm hợp lệ");

  const found = findExercise(r.exerciseId);
  if (!found) throw new Error(`Không biết bài tập “${r.exerciseId}”`);

  const expected = found.exercise.bugs ?? [];
  const reported = new Map(r.bugs.map((b) => [b?.id, b?.caught === true]));
  if (expected.length !== reported.size || expected.some((id) => !reported.has(id)))
    throw new Error("Kết quả không khớp phiên bản bài tập hiện tại; hãy tải starter repo mới và chấm lại");

  const caught = expected.filter((id) => reported.get(id)).length;
  const checked = (r.cleanPassed ? 1 : 0) + (r.cleanPassed ? caught : 0);

  return {
    id: `${r.exerciseId}-graded-${now}`,
    exerciseId: r.exerciseId,
    labSlug: found.lab,
    checked,
    total: 1 + expected.length,
    hintsUsed: 0,
    solutionViewed: false,
    takenAt: now,
    graded: true,
  };
}
