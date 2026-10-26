import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LEVEL_NAMES } from "@/components/site/lesson-sidebar";
import { getLessons } from "@/lib/content";

export const metadata = { title: "Bài học" };

export default function LearnPage() {
  const lessons = getLessons();
  const levels = [...new Set(lessons.map((l) => l.level))];
  return (
    <div className="max-w-3xl py-8">
      <h1 className="text-3xl font-bold">Lộ trình học</h1>
      <p className="mt-2 text-muted-foreground">
        Học tuần tự từ Level 0 đến Level 5. Bài nào cũng có phần kiến thức cần nắm, giải thích dễ hiểu,
        bài tập và quiz.
      </p>
      <div className="mt-8 space-y-10">
        {levels.map((lv) => (
          <section key={lv} aria-label={`Level ${lv}`}>
            <h2 className="mb-3 text-xl font-semibold">
              Level {lv} · {LEVEL_NAMES[lv]}
            </h2>
            <div className="grid gap-3">
              {lessons
                .filter((l) => l.level === lv)
                .map((l) => (
                  <Link key={l.slug} href={`/learn/${l.slug}`}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Bài {l.level}.{l.order}</Badge>
                          <span className="text-xs text-muted-foreground">{l.minutes} phút</span>
                        </div>
                        <CardTitle>{l.title}</CardTitle>
                        <CardDescription>{l.summary}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
