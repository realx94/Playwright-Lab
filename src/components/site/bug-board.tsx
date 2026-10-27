"use client";

import { useEffect, useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { storage } from "@/lib/storage";
import { onDataChanged } from "@/lib/storage/events";

export interface BugExercise {
  exerciseId: string;
  lab: string;
  labTitle: string;
  bugs: string[];
}

interface Row {
  lab: string;
  title: string;
  found: number;
  total: number;
}

/**
 * Bảng xếp hạng bug đã tìm (chỉ trong trình duyệt của bạn).
 * Một bài “bắt bug” được tính khi lần làm đạt đủ tiêu chí (chấm tự động hoặc tự đánh giá tick hết).
 * Mỗi cặp lab + mã bug chỉ tính một lần.
 */
export function BugBoard({ items }: { items: BugExercise[] }) {
  const [passed, setPassed] = useState<Set<string> | null>(null);

  useEffect(() => {
    const load = () =>
      storage
        .listExercises()
        .then((all) => setPassed(new Set(all.filter((a) => a.total > 0 && a.checked >= a.total).map((a) => a.exerciseId))))
        .catch(() => setPassed(new Set()));
    void load();
    return onDataChanged(() => void load());
  }, []);

  const { rows, found, total } = useMemo(() => {
    const byLab = new Map<string, Row>();
    const seen = new Set<string>();
    let foundAll = 0;
    let totalAll = 0;
    for (const it of items) {
      const r = byLab.get(it.lab) ?? { lab: it.lab, title: it.labTitle, found: 0, total: 0 };
      for (const bug of it.bugs) {
        const key = `${it.lab}/${bug}`;
        if (seen.has(`t:${key}`)) continue;
        seen.add(`t:${key}`);
        r.total += 1;
        totalAll += 1;
      }
      byLab.set(it.lab, r);
    }
    for (const it of items) {
      if (!passed?.has(it.exerciseId)) continue;
      const r = byLab.get(it.lab)!;
      for (const bug of it.bugs) {
        const key = `${it.lab}/${bug}`;
        if (seen.has(`f:${key}`)) continue;
        seen.add(`f:${key}`);
        r.found += 1;
        foundAll += 1;
      }
    }
    const rows = [...byLab.values()].sort((a, b) => b.found - a.found || b.found / b.total - a.found / a.total || a.title.localeCompare(b.title, "vi"));
    return { rows, found: foundAll, total: totalAll };
  }, [items, passed]);

  if (passed === null) return null;

  return (
    <section aria-label="Bug đã tìm" className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Bug đã tìm</h2>
        <p className="text-sm text-muted-foreground">
          Làm các bài “bắt bug” trong từng lab: test của bạn phải đỏ khi bật đúng bug. Bảng này chỉ nằm trong trình duyệt của bạn.
        </p>
      </div>
      <p className="text-sm" data-testid="bug-total">
        Bạn đã tìm <b>{found}</b>/{total} bug
      </p>
      <Progress value={total ? (found / total) * 100 : 0} aria-label="Tiến độ tìm bug" />
      <ol className="divide-y rounded-xl border" data-testid="bug-ranking">
        {rows.map((r, i) => (
          <li key={r.lab} className="flex items-center justify-between gap-3 px-4 py-2 text-sm" data-testid="bug-row" data-lab={r.lab}>
            <span>
              <span className="mr-2 text-muted-foreground">{i + 1}.</span>
              {r.title}
            </span>
            <span className="tabular-nums" data-testid="bug-found">
              {r.found}/{r.total}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
