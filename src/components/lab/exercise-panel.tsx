"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Lightbulb, Lock } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [criteriaVisible, setCriteriaVisible] = useState(false);
  const [criteriaConfirmOpen, setCriteriaConfirmOpen] = useState(false);
  const [solutionConfirmOpen, setSolutionConfirmOpen] = useState(false);
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
    toast.success(`Đã lưu tự đánh giá: ${done}/${ex.criteria.length} tiêu chí`);
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
              Tự đánh giá tốt nhất {best.checked}/{best.total}
            </Badge>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Đề bài · {ex.id}</p>
            <p className="mt-2 text-sm leading-6">{ex.task}</p>
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">Tự đánh giá bài làm</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Đây là checklist tự chấm, không phải kết quả chấm tự động. Hãy viết và chạy test trước khi mở tiêu chí.</p>
            {criteriaVisible ? (
              <fieldset className="mt-4 space-y-3" data-testid={`criteria-${ex.id}`}>
                <legend className="mb-2 text-sm font-medium">Tiêu chí đạt ({done}/{ex.criteria.length})</legend>
                {ex.criteria.map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Checkbox
                      id={`${ex.id}-c${i}`}
                      checked={checked[i]}
                      onCheckedChange={(v) => setChecked((prev) => prev.map((x, j) => (j === i ? v === true : x)))}
                      className="mt-0.5"
                    />
                    <Label htmlFor={`${ex.id}-c${i}`} className="font-normal leading-snug">{c}</Label>
                  </div>
                ))}
                <p className="text-xs leading-5 text-muted-foreground">Chỉ tick những mục bạn đã kiểm chứng bằng test. Kết quả tự đánh giá được lưu trên trình duyệt này.</p>
              </fieldset>
            ) : (
              <Button className="mt-3" size="sm" variant="outline" onClick={() => setCriteriaConfirmOpen(true)}>Xem tiêu chí tự đánh giá</Button>
            )}
          </div>

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
                  tabIndex={0}
                  className="overflow-x-auto rounded-lg bg-muted p-3 text-xs"
                >
                  <code>{ex.solution}</code>
                </pre>
                <Button size="sm" variant="outline" onClick={copy}>
                  <Copy className="size-4" /> Copy
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setSolutionConfirmOpen(true)}>
                Xem đáp án
              </Button>
            )}
          </div>

          <p className="rounded-xl bg-muted p-4 text-xs leading-5 text-muted-foreground" data-testid={`grade-hint-${ex.id}`}>
            <span className="block font-semibold text-foreground">Chấm tự động trong starter repo</span>
            Chạy <code>npm run grade -- --exercise {ex.id}</code>
            {ex.bugs?.length
              ? ` (test phải xanh trên lab sạch và đỏ khi bật ${ex.bugs.join(", ")})`
              : " (test phải xanh trên lab sạch)"}
            , rồi tải file kết quả lên trang Thống kê. Nút lưu dưới đây chỉ ghi nhận tự đánh giá của bạn.
          </p>

          <div className="flex items-center gap-3 border-t border-border pt-4">
            {criteriaVisible && <Button onClick={submit}><Check className="size-4" /> Lưu tự đánh giá ({pct}%)</Button>}
            {solutionViewed && <Badge variant="outline">Đã xem đáp án</Badge>}
          </div>
        </div>
        <Dialog open={criteriaConfirmOpen} onOpenChange={setCriteriaConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mở tiêu chí tự đánh giá?</DialogTitle>
              <DialogDescription>Checklist này có thể gợi ý cách viết test. Bạn nên tự hoàn thành bài trước; sau đó tick các tiêu chí đã kiểm chứng. Đây không phải chấm tự động.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCriteriaConfirmOpen(false)}>Tiếp tục tự làm</Button>
              <Button onClick={() => { setCriteriaVisible(true); setCriteriaConfirmOpen(false); }}>Vẫn xem tiêu chí</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={solutionConfirmOpen} onOpenChange={setSolutionConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xem đáp án mẫu?</DialogTitle>
              <DialogDescription>Bạn nên thử ít nhất một lần trước. Nếu tiếp tục, lần tự đánh giá này sẽ được ghi là “đã xem đáp án”.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSolutionConfirmOpen(false)}>Tiếp tục tự làm</Button>
              <Button onClick={() => { setSolutionViewed(true); setSolutionConfirmOpen(false); }}>Vẫn xem đáp án</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          Mở từng bài để đọc đề, viết test trong starter repo và chạy với <code>baseURL</code> của site này. Tiêu chí tự đánh giá và đáp án mẫu được ẩn; bạn có thể mở sau khi tự làm. Chấm tự động chạy bằng lệnh trong starter repo.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-panel sm:p-6">
        <h3 className="font-semibold">Bạn cần làm</h3>
        <ol className="mt-4 space-y-4">
          {list.map((ex, index) => (
            <li key={ex.id} className="flex items-start gap-3 text-sm leading-6">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-secondary-foreground">{index + 1}</span>
              <span><strong className="block font-semibold text-foreground">{ex.title}</strong><span className="text-muted-foreground">{ex.task}</span></span>
            </li>
          ))}
        </ol>
      </div>
      <h3 className="pt-2 text-sm font-semibold text-foreground">Mở bài để dùng gợi ý, tự đánh giá hoặc xem đáp án</h3>
      <Accordion className="rounded-xl border px-4">
        {list.map((ex) => (
          <ExerciseItem key={ex.id} lab={lab} ex={ex} best={bestOf(ex.id)} onSaved={refresh} />
        ))}
      </Accordion>
    </section>
  );
}
