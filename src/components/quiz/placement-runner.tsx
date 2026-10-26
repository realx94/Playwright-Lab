"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { LEVEL_NAMES } from "@/components/site/lesson-sidebar";
import { QuizRunner, type Answers } from "@/components/quiz/quiz-runner";
import type { Quiz, QuizQuestion } from "@/lib/quiz";

const PASS_RATIO = 0.6;
const LEVELS = [0, 1, 2, 3, 4];

export interface LevelStart {
  slug: string;
  title: string;
}

interface Result {
  perLevel: Record<number, { correct: number; total: number }>;
  recommended: number;
}

function isCorrect(q: QuizQuestion, picked: string[] = []) {
  return picked.length === q.answer.length && q.answer.every((a) => picked.includes(a));
}

/** Level đầu tiên chưa đạt ngưỡng; nếu đạt hết thì đề xuất Level 5. */
export function recommend(questions: QuizQuestion[], answers: Answers): Result {
  const perLevel: Result["perLevel"] = {};
  for (const q of questions) {
    const lv = q.level ?? 0;
    perLevel[lv] ??= { correct: 0, total: 0 };
    perLevel[lv].total++;
    if (isCorrect(q, answers[q.id])) perLevel[lv].correct++;
  }
  const weak = LEVELS.find((lv) => perLevel[lv] && perLevel[lv].correct / perLevel[lv].total < PASS_RATIO);
  return { perLevel, recommended: weak ?? 5 };
}

export function PlacementRunner({ quiz, starts }: { quiz: Quiz; starts: Record<number, LevelStart> }) {
  const [result, setResult] = useState<Result | null>(null);
  const start = result ? starts[result.recommended] : undefined;

  return (
    <div className="space-y-8">
      <QuizRunner
        quiz={quiz}
        onFinished={(q, a) => setResult(recommend(q, a))}
        onRetake={() => setResult(null)}
      />
      {result && (
        <Card data-testid="placement-result">
          <CardHeader>
            <CardTitle>
              Gợi ý: bắt đầu từ Level {result.recommended}
              {LEVEL_NAMES[result.recommended] ? ` · ${LEVEL_NAMES[result.recommended]}` : ""}
            </CardTitle>
            <CardDescription>
              Level đầu tiên có tỉ lệ đúng dưới {Math.round(PASS_RATIO * 100)}% là nơi bạn nên bắt đầu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1 text-sm">
              {LEVELS.filter((lv) => result.perLevel[lv]).map((lv) => (
                <li key={lv} data-testid={`placement-level-${lv}`}>
                  Level {lv} · {LEVEL_NAMES[lv]}: {result.perLevel[lv].correct}/{result.perLevel[lv].total}
                </li>
              ))}
            </ul>
            {start && (
              <Link href={`/learn/${start.slug}`} className={buttonVariants()} data-testid="placement-start">
                Học ngay: {start.title}
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
