"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { storage, type LessonProgress } from "@/lib/storage";
import type { LessonRef } from "@/components/site/stats-app";

/** Gợi ý bài kế tiếp: bài đang học gần nhất chưa xong, nếu không có thì bài đầu tiên chưa xong. */
export function ContinueLearning({ lessons }: { lessons: LessonRef[] }) {
  const [progress, setProgress] = useState<LessonProgress[] | null>(null);

  useEffect(() => {
    storage
      .listProgress()
      .then(setProgress)
      .catch(() => setProgress([]));
  }, []);

  if (!progress) return null;
  const done = new Set(progress.filter((p) => p.status === "done").map((p) => p.lessonId));
  const recent = [...progress]
    .filter((p) => p.status !== "done")
    .sort((a, b) => b.lastViewedAt - a.lastViewedAt)[0];
  const next = lessons.find((l) => l.slug === recent?.lessonId) ?? lessons.find((l) => !done.has(l.slug));
  const pct = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;

  if (!next) {
    return (
      <p className="rounded-2xl border border-border bg-card p-5 text-sm shadow-panel" data-testid="continue-all-done">
        Bạn đã hoàn thành toàn bộ {lessons.length} bài. Hãy thử capstone ở bài cuối và ôn câu hỏi phỏng vấn.
      </p>
    );
  }

  return (
    <section aria-label="Tiếp tục học" className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-panel sm:p-6" data-testid="continue-learning">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{progress.length ? "Tiếp tục học" : "Bài đầu tiên cho bạn"}</p>
          <p className="mt-1 text-lg font-semibold">{next.title}</p>
        </div>
        <Link href={`/learn/${next.slug}`} className={buttonVariants()} data-testid="continue-link">
          {progress.length ? "Học tiếp" : "Bắt đầu"}
        </Link>
      </div>
      <Progress value={pct} aria-label="Tiến độ toàn khoá" />
      <p className="text-xs text-muted-foreground" data-testid="continue-progress">
        Đã hoàn thành {done.size}/{lessons.length} bài ({pct}%)
      </p>
    </section>
  );
}
