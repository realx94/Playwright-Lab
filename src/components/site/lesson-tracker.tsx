"use client";

import { useEffect } from "react";
import { storage } from "@/lib/storage";

/** Ghi lịch sử xem bài và thời gian đọc vào IndexedDB. */
export function LessonTracker({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    const start = Date.now();
    let prev = { timeSpentSec: 0, status: "in-progress" as "in-progress" | "done" };
    storage
      .getProgress(lessonId)
      .then((p) => {
        if (p) prev = { timeSpentSec: p.timeSpentSec, status: p.status };
      })
      .catch(() => {});
    return () => {
      storage
        .saveProgress({
          lessonId,
          status: prev.status,
          lastViewedAt: Date.now(),
          timeSpentSec: prev.timeSpentSec + Math.round((Date.now() - start) / 1000),
        })
        .catch(() => {});
    };
  }, [lessonId]);
  return null;
}
