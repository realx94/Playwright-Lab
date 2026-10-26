"use client";

import { useEffect } from "react";
import { storage } from "@/lib/storage";

/** Ghi lịch sử xem bài và cộng dồn thời gian đọc vào IndexedDB khi rời trang. */
export function LessonTracker({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    const start = Date.now();
    storage
      .getProgress(lessonId)
      .then((p) =>
        storage.saveProgress({
          lessonId,
          status: p?.status ?? "in-progress",
          lastViewedAt: Date.now(),
          timeSpentSec: p?.timeSpentSec ?? 0,
        }),
      )
      .catch(() => {});
    return () => {
      const spent = Math.round((Date.now() - start) / 1000);
      storage
        .getProgress(lessonId)
        .then((p) =>
          storage.saveProgress({
            lessonId,
            status: p?.status ?? "in-progress",
            lastViewedAt: Date.now(),
            timeSpentSec: (p?.timeSpentSec ?? 0) + spent,
          }),
        )
        .catch(() => {});
    };
  }, [lessonId]);
  return null;
}
