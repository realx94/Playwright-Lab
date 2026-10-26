import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  AskAiEntry,
  ExportData,
  LessonProgress,
  QuizAttempt,
  StorageAdapter,
} from "./types";

interface LabDB extends DBSchema {
  lessonProgress: { key: string; value: LessonProgress };
  quizAttempts: { key: string; value: QuizAttempt };
  askAiHistory: { key: number; value: AskAiEntry };
}

let dbPromise: Promise<IDBPDatabase<LabDB>> | null = null;

function db() {
  dbPromise ??= openDB<LabDB>("playwright-lab", 1, {
    upgrade(d) {
      d.createObjectStore("lessonProgress", { keyPath: "lessonId" });
      d.createObjectStore("quizAttempts", { keyPath: "id" });
      d.createObjectStore("askAiHistory", { autoIncrement: true });
    },
  });
  return dbPromise;
}

export const localAdapter: StorageAdapter = {
  async getProgress(lessonId) {
    return (await db()).get("lessonProgress", lessonId);
  },
  async listProgress() {
    return (await db()).getAll("lessonProgress");
  },
  async saveProgress(p) {
    await (await db()).put("lessonProgress", p);
  },
  async saveAttempt(a) {
    await (await db()).put("quizAttempts", a);
  },
  async listAttempts() {
    return (await db()).getAll("quizAttempts");
  },
  async addAsk(e) {
    await (await db()).add("askAiHistory", e);
  },
  async listAsk() {
    return (await db()).getAll("askAiHistory");
  },
  async exportAll() {
    const d = await db();
    return {
      schemaVersion: 1,
      exportedAt: Date.now(),
      lessonProgress: await d.getAll("lessonProgress"),
      quizAttempts: await d.getAll("quizAttempts"),
      askAiHistory: await d.getAll("askAiHistory"),
    };
  },
  async importAll(data: ExportData) {
    if (data.schemaVersion !== 1) throw new Error("Phiên bản file không hỗ trợ");
    const d = await db();
    const tx = d.transaction(
      ["lessonProgress", "quizAttempts", "askAiHistory"],
      "readwrite",
    );
    for (const p of data.lessonProgress) await tx.objectStore("lessonProgress").put(p);
    for (const a of data.quizAttempts) await tx.objectStore("quizAttempts").put(a);
    for (const e of data.askAiHistory) await tx.objectStore("askAiHistory").add(e);
    await tx.done;
  },
  async clearAll() {
    const d = await db();
    await Promise.all([
      d.clear("lessonProgress"),
      d.clear("quizAttempts"),
      d.clear("askAiHistory"),
    ]);
  },
};
