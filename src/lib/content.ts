import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "src", "content", "learn");

export interface LessonMeta {
  slug: string;
  title: string;
  level: number;
  order: number;
  minutes: number;
  summary: string;
  keywords: string[];
}

export interface Lesson extends LessonMeta {
  body: string;
}

function read(file: string): Lesson {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title),
    level: Number(data.level ?? 0),
    order: Number(data.order ?? 0),
    minutes: Number(data.minutes ?? 10),
    summary: String(data.summary ?? ""),
    keywords: (data.keywords as string[]) ?? [],
    body: content,
  };
}

export function getLessons(): Lesson[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(read)
    .sort((a, b) => a.level - b.level || a.order - b.order);
}

export function getLesson(slug: string): Lesson | undefined {
  return getLessons().find((l) => l.slug === slug);
}
