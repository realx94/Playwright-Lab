import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PlacementRunner, type LevelStart } from "@/components/quiz/placement-runner";
import { getLessons } from "@/lib/content";
import { getQuiz } from "@/lib/quiz";

export const metadata = { title: "Bài kiểm tra đầu vào" };

export default function PlacementPage() {
  const quiz = getQuiz("placement");
  if (!quiz) notFound();

  const starts: Record<number, LevelStart> = {};
  for (const l of getLessons()) starts[l.level] ??= { slug: l.slug, title: l.title };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Bài kiểm tra đầu vào</h1>
      <p className="mt-2 text-muted-foreground">
        10 câu hỏi ngắn trải đều từ Level 0 đến Level 4 để gợi ý bạn nên bắt đầu từ đâu. Không tính điểm vào lộ trình
        và có thể làm lại bất kỳ lúc nào.
      </p>
      <div className="mt-8">
        <Suspense>
          <PlacementRunner quiz={quiz} starts={starts} />
        </Suspense>
      </div>
    </div>
  );
}
