export type LessonStatus = "in-progress" | "done";

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  lastViewedAt: number;
  timeSpentSec: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  total: number;
  takenAt: number;
  durationSec: number;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  labSlug: string;
  checked: number;
  total: number;
  hintsUsed: number;
  solutionViewed: boolean;
  takenAt: number;
  /** true nếu điểm đến từ kết quả chấm tự động (npm run grade) thay vì tự đánh giá. */
  graded?: boolean;
}

export interface AskAiEntry {
  term: string;
  askedAt: number;
}

export interface ExportData {
  schemaVersion: 1;
  exportedAt: number;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  askAiHistory: AskAiEntry[];
  exerciseAttempts?: ExerciseAttempt[];
}

/** Mọi truy cập lưu trữ đi qua interface này để thay bằng SupabaseAdapter sau. */
export interface StorageAdapter {
  getProgress(lessonId: string): Promise<LessonProgress | undefined>;
  listProgress(): Promise<LessonProgress[]>;
  saveProgress(p: LessonProgress): Promise<void>;
  /** Cập nhật thời điểm xem và cộng dồn thời gian đọc mà không ghi đè trạng thái (đọc-ghi trong một giao dịch). */
  touchProgress(lessonId: string, addSeconds: number): Promise<void>;
  saveAttempt(a: QuizAttempt): Promise<void>;
  listAttempts(): Promise<QuizAttempt[]>;
  saveExercise(a: ExerciseAttempt): Promise<void>;
  listExercises(): Promise<ExerciseAttempt[]>;
  addAsk(e: AskAiEntry): Promise<void>;
  /** Xoá mọi lần hỏi của một thuật ngữ (Sổ tay của tôi). */
  removeAsk(term: string): Promise<void>;
  listAsk(): Promise<AskAiEntry[]>;
  exportAll(): Promise<ExportData>;
  importAll(data: ExportData): Promise<void>;
  clearAll(): Promise<void>;
}
