import fs from "node:fs";
import path from "node:path";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: "single" | "multi";
  prompt: string;
  options: QuizOption[];
  answer: string[];
  explanation: string;
  /** Level kiến thức mà câu hỏi kiểm tra (dùng cho bài kiểm tra đầu vào). */
  level?: number;
}

export interface Quiz {
  lessonSlug: string;
  questions: QuizQuestion[];
}

const DIR = path.join(process.cwd(), "src", "content", "quiz");

export function getQuiz(slug: string): Quiz | undefined {
  const file = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return undefined;
  return { lessonSlug: slug, ...JSON.parse(fs.readFileSync(file, "utf8")) };
}

export function getAllQuizzes(): Quiz[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => getQuiz(f.replace(/\.json$/, ""))!);
}
