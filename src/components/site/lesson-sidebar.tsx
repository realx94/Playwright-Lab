"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";
import type { LessonRef } from "@/components/site/stats-app";

export const LEVEL_NAMES: Record<number, string> = {
  0: "Chuẩn bị",
  1: "Nền tảng lập trình & Git",
  2: "Playwright cơ bản",
  3: "Tư duy kiểm thử",
  4: "Framework & kiến trúc",
  5: "Chuyên nghiệp",
};

/** Cây bài học theo level, đánh dấu bài đang xem và bài đã hoàn thành. */
export function LessonSidebar({ lessons }: { lessons: LessonRef[] }) {
  const pathname = usePathname();
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    storage
      .listProgress()
      .then((p) => setDone(new Set(p.filter((x) => x.status === "done").map((x) => x.lessonId))))
      .catch(() => {});
  }, [pathname]);

  const levels = [...new Set(lessons.map((l) => l.level))];

  return (
    <nav aria-label="Danh sách bài học" className="space-y-6 text-sm">
      {levels.map((lv) => (
        <div key={lv}>
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Level {lv} · {LEVEL_NAMES[lv] ?? ""}
          </p>
          <ul className="space-y-0.5">
            {lessons
              .filter((l) => l.level === lv)
              .map((l) => {
                const active = pathname === `/learn/${l.slug}`;
                return (
                  <li key={l.slug}>
                    <Link
                      href={`/learn/${l.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg px-3 py-2 leading-snug text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                        active && "bg-accent font-semibold text-accent-foreground",
                      )}
                    >
                      <span>{l.title}</span>
                      {done.has(l.slug) && (
                        <Check className="size-3.5 shrink-0 text-success" aria-label="Đã hoàn thành" />
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
