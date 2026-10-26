"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { mulberry32, shuffle } from "@/lib/shuffle";
import { storage } from "@/lib/storage";
import type { Quiz, QuizQuestion } from "@/lib/quiz";

type Answers = Record<string, string[]>;

function prepare(quiz: Quiz, seed: number): QuizQuestion[] {
  const rand = mulberry32(seed);
  return shuffle(quiz.questions, rand).map((q) => ({ ...q, options: shuffle(q.options, rand) }));
}

function isCorrect(q: QuizQuestion, picked: string[] = []) {
  return picked.length === q.answer.length && q.answer.every((a) => picked.includes(a));
}

/** Seed ngẫu nhiên mỗi lần làm; `?seed=n` cố định thứ tự để test tái lập. */
export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const params = useSearchParams();
  const fixed = params.get("seed");
  const [seed, setSeed] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    // Sinh seed sau khi mount để SSR/hydrate khớp nhau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(fixed ? Number(fixed) : Math.floor(Math.random() * 2 ** 31));
    startedAt.current = Date.now();
  }, [fixed]);

  const questions = useMemo(() => (seed === null ? [] : prepare(quiz, seed)), [quiz, seed]);
  if (seed === null) return null;

  const score = questions.filter((q) => isCorrect(q, answers[q.id])).length;
  const allAnswered = questions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  function pick(q: QuizQuestion, optId: string, on: boolean) {
    setAnswers((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.type === "single") return { ...prev, [q.id]: [optId] };
      return { ...prev, [q.id]: on ? [...cur, optId] : cur.filter((x) => x !== optId) };
    });
  }

  async function submit() {
    setSubmitted(true);
    await storage
      .saveAttempt({
        id: `${quiz.lessonSlug}-${Date.now()}`,
        quizId: quiz.lessonSlug,
        score,
        total: questions.length,
        takenAt: Date.now(),
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      })
      .catch(() => {});
  }

  function retake() {
    setSeed(Math.floor(Math.random() * 2 ** 31));
    setAnswers({});
    setSubmitted(false);
    startedAt.current = Date.now();
    window.scrollTo({ top: 0 });
  }

  return (
    <section aria-label="Quiz" className="space-y-6">
      {questions.map((q, i) => {
        const picked = answers[q.id] ?? [];
        const ok = isCorrect(q, picked);
        return (
          <fieldset
            key={q.id}
            data-testid={`question-${i}`}
            className="space-y-3 rounded-xl border p-4"
            disabled={submitted}
          >
            <legend className="px-1 text-sm font-medium">
              Câu {i + 1}
              {q.type === "multi" && <Badge variant="outline" className="ml-2">Chọn nhiều</Badge>}
            </legend>
            <p className="font-medium">{q.prompt}</p>

            {q.type === "single" ? (
              <RadioGroup value={picked[0] ?? ""} onValueChange={(v) => pick(q, v, true)} className="gap-2">
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-start gap-2">
                    <RadioGroupItem value={o.id} id={`${q.id}-${o.id}`} className="mt-0.5" />
                    <Label htmlFor={`${q.id}-${o.id}`} className="font-normal leading-snug">
                      {o.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-start gap-2">
                    <Checkbox
                      id={`${q.id}-${o.id}`}
                      checked={picked.includes(o.id)}
                      onCheckedChange={(c) => pick(q, o.id, c === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor={`${q.id}-${o.id}`} className="font-normal leading-snug">
                      {o.text}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {submitted && (
              <div
                data-testid={`result-${i}`}
                className={`rounded-lg p-3 text-sm ${ok ? "bg-green-500/10" : "bg-destructive/10"}`}
              >
                <p className="mb-1 flex items-center gap-1 font-medium">
                  {ok ? <Check className="size-4" /> : <X className="size-4" />}
                  {ok ? "Chính xác" : "Chưa đúng"}
                </p>
                {!ok && (
                  <p className="mb-1">
                    Đáp án đúng:{" "}
                    {q.options
                      .filter((o) => q.answer.includes(o.id))
                      .map((o) => `“${o.text}”`)
                      .join("; ")}
                  </p>
                )}
                <p className="text-muted-foreground">{q.explanation}</p>
              </div>
            )}
          </fieldset>
        );
      })}

      {submitted ? (
        <div className="flex items-center gap-4">
          <p className="text-lg font-semibold" data-testid="quiz-score">
            Điểm: {score}/{questions.length}
          </p>
          <Button variant="outline" onClick={retake}>
            <RotateCcw className="size-4" /> Làm lại (xáo trộn mới)
          </Button>
        </div>
      ) : (
        <Button onClick={submit} disabled={!allAnswered}>
          Nộp bài
        </Button>
      )}
    </section>
  );
}
