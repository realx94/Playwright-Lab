"use client";

import { useEffect } from "react";
import { storage } from "@/lib/storage";

/** Ghi lịch sử xem bài và cộng dồn thời gian đọc vào IndexedDB khi rời trang. */
export function LessonTracker({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    const start = Date.now();
    storage.touchProgress(lessonId, 0).catch(() => {});
    return () => {
      // Đọc-ghi nguyên tử để không ghi đè trạng thái "đã hoàn thành" vừa được lưu ở nơi khác.
      storage.touchProgress(lessonId, Math.round((Date.now() - start) / 1000)).catch(() => {});
    };
  }, [lessonId]);
  return null;
}
