"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";

export function MarkDoneButton({ lessonId }: { lessonId: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    storage
      .getProgress(lessonId)
      .then((p) => setDone(p?.status === "done"))
      .catch(() => {});
  }, [lessonId]);

  async function toggle() {
    const p = await storage.getProgress(lessonId);
    const status = done ? "in-progress" : "done";
    await storage.saveProgress({
      lessonId,
      status,
      lastViewedAt: Date.now(),
      timeSpentSec: p?.timeSpentSec ?? 0,
    });
    setDone(!done);
    toast(done ? "Đã bỏ đánh dấu hoàn thành" : "Đã đánh dấu hoàn thành");
  }

  return (
    <Button variant={done ? "secondary" : "default"} onClick={toggle} aria-pressed={done}>
      <Check className="size-4" /> {done ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
    </Button>
  );
}
