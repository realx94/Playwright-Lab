import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LEVEL_NAMES } from "@/components/site/lesson-sidebar";
import { getLessons } from "@/lib/content";

export const metadata = { title: "Bài học" };

export default function LearnPage() {
  const lessons = getLessons();
  const levels = [...new Set(lessons.map((l) => l.level))];
  return (
    <div className="max-w-4xl pb-16 pt-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Bài học</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Lộ trình học</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
        Học tuần tự từ Level 0 đến Level 5. Bài nào cũng có phần kiến thức cần nắm, giải thích dễ hiểu,
        bài tập và quiz.
      </p>
      <div className="mt-6 rounded-2xl border border-border bg-brand-soft p-4 text-sm leading-6 sm:p-5">
        Chưa biết bắt đầu từ đâu?{" "}
        <Link href="/placement" className="font-semibold text-secondary-foreground underline underline-offset-4" data-testid="placement-link">Làm bài kiểm tra đầu vào</Link>{" "}
        (10 câu, 5 phút).
      </div>
      <div className="mt-12 space-y-12">
        {levels.map((lv) => (
          <section key={lv} id={`level-${lv}`} aria-label={`Level ${lv}`} className="scroll-mt-32">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-bold text-secondary-foreground">LEVEL {lv}</span>
              <h2 className="text-xl font-semibold">{LEVEL_NAMES[lv]}</h2>
            </div>
            <div className="grid gap-3">
              {lessons
                .filter((l) => l.level === lv)
                .map((l) => (
                  <Link key={l.slug} href={`/learn/${l.slug}`} className="group rounded-2xl focus-visible:ring-2 focus-visible:ring-ring">
                    <Card className="border border-border shadow-panel transition-colors group-hover:border-primary/40 group-hover:bg-accent/50">
                      <CardHeader className="gap-2 px-5 py-1 sm:px-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Badge variant="secondary">Bài {l.level}.{l.order}</Badge>
                          <span className="inline-flex items-center gap-1 text-xs"><BookOpen className="size-3.5" aria-hidden="true" />{l.minutes} phút</span>
                        </div>
                        <CardTitle className="flex items-center justify-between gap-3 text-base font-semibold sm:text-lg">{l.title}<ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" /></CardTitle>
                        <CardDescription className="leading-6">{l.summary}</CardDescription>
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
