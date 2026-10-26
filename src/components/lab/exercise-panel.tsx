"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Lightbulb, Lock } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EXERCISES, type Exercise } from "@/lib/labs/exercises";
import { storage, type ExerciseAttempt } from "@/lib/storage";

function ExerciseItem({
  lab,
  ex,
  best,
  onSaved,
}: {
  lab: string;
  ex: Exercise;
  best?: ExerciseAttempt;
  onSaved: () => void;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => ex.criteria.map(() => false));
  const [hints, setHints] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [solutionViewed, setSolutionViewed] = useState(false);

  const done = checked.filter(Boolean).length;
  const pct = Math.round((done / ex.criteria.length) * 100);

  async function submit() {
    await storage.saveExercise({
      id: `${ex.id}-${Date.now()}`,
      exerciseId: ex.id,
      labSlug: lab,
      checked: done,
      total: ex.criteria.length,
      hintsUsed: hints,
      solutionViewed,
      takenAt: Date.now(),
    });
    onSaved();
    toast.success(`Đã nộp: ${done}/${ex.criteria.length} tiêu chí`);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(ex.solution);
      toast("Đã copy đáp án");
    } catch {
      toast.error("Không copy được, hãy bôi đen và copy thủ công");
    }
  }

  return (
    <AccordionItem value={ex.id} data-testid={`exercise-${ex.id}`}>
      <AccordionTrigger>
        <span className="flex flex-wrap items-center gap-2 text-left">
          <span className="font-medium">{ex.title}</span>
          <span className="text-xs text-muted-foreground">{"★".repeat(ex.difficulty)}</span>
          {best && (
            <Badge variant={best.checked === best.total ? "default" : "secondary"}>
              Tốt nhất {best.checked}/{best.total}
            </Badge>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-5">
          <p className="text-sm">{ex.task}</p>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">
              Tiêu chí đạt ({done}/{ex.criteria.length})
            </legend>
            {ex.criteria.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <Checkbox
                  id={`${ex.id}-c${i}`}
                  checked={checked[i]}
                  onCheckedChange={(v) =>
                    setChecked((prev) => prev.map((x, j) => (j === i ? v === true : x)))
                  }
                  className="mt-0.5"
                />
                <Label htmlFor={`${ex.id}-c${i}`} className="font-normal leading-snug">
                  {c}
                </Label>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Chỉ tick khi bạn đã chạy test và kiểm chứng thật sự. Điểm tự đánh giá chỉ có ý nghĩa khi
              bạn trung thực.
            </p>
          </fieldset>

          <div className="space-y-2">
            <p className="flex items-center gap-1 text-sm font-medium">
              <Lightbulb className="size-4" /> Gợi ý ({hints}/{ex.hints.length})
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-sm" data-testid={`hints-${ex.id}`}>
              {ex.hints.slice(0, hints).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ol>
            {hints < ex.hints.length && (
              <Button size="sm" variant="outline" onClick={() => setHints((n) => n + 1)}>
                Mở gợi ý tiếp theo
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-1 text-sm font-medium">
              <Lock className="size-4" /> Đáp án mẫu
            </p>
            {solutionViewed ? (
              <div className="space-y-2">
                <pre
                  data-testid={`solution-${ex.id}`}
                  className="overflow-x-auto rounded-lg bg-muted p-3 text-xs"
                >
                  <code>{ex.solution}</code>
                </pre>
                <Button size="sm" variant="outline" onClick={copy}>
                  <Copy className="size-4" /> Copy
                </Button>
              </div>
            ) : confirming ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>Bạn nên thử ít nhất 1 lần trước. Lần làm này sẽ được ghi là “đã xem đáp án”.</span>
                <Button
                  size="sm"
                  onClick={() => {
                    setSolutionViewed(true);
                    setConfirming(false);
                  }}
                >
                  Vẫn xem đáp án
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Để tôi thử tiếp
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
                Xem đáp án
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground" data-testid={`grade-hint-${ex.id}`}>
            Chấm tự động: <code>npm run grade -- --exercise {ex.id}</code>
            {ex.bugs?.length
              ? ` (test phải xanh trên lab sạch và đỏ khi bật ${ex.bugs.join(", ")})`
              : " (test phải xanh trên lab sạch)"}
            , rồi tải file kết quả lên trang Thống kê.
          </p>

          <div className="flex items-center gap-3 border-t pt-4">
            <Button onClick={submit}>
              <Check className="size-4" /> Nộp bài ({pct}%)
            </Button>
            {solutionViewed && <Badge variant="outline">Đã xem đáp án</Badge>}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ExercisePanel({ lab }: { lab: string }) {
  const list = EXERCISES[lab];
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);

  const refresh = useCallback(() => {
    storage
      .listExercises()
      .then(setAttempts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!list) return null;

  const bestOf = (id: string) =>
    attempts
      .filter((a) => a.exerciseId === id)
      .sort((a, b) => b.checked / b.total - a.checked / a.total)[0];

  return (
    <section aria-label="Bài tập" className="mt-12 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Bài tập Playwright</h2>
        <p className="text-sm text-muted-foreground">
          Viết test trong starter repo, chạy với <code>baseURL</code> của site này. Tick tiêu chí sau
          khi tự kiểm chứng, mở gợi ý nếu bí, đáp án chỉ xem khi cần.
        </p>
      </div>
      <Accordion className="rounded-xl border px-4">
        {list.map((ex) => (
          <ExerciseItem key={ex.id} lab={lab} ex={ex} best={bestOf(ex.id)} onSaved={refresh} />
        ))}
      </Accordion>
    </section>
  );
}
