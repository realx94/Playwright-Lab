import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AskAiKeyword } from "@/components/ask-ai/selection-popover";
import { MarkDoneButton } from "@/components/site/mark-done-button";
import { LessonTracker } from "@/components/site/lesson-tracker";
import { Suspense } from "react";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { getLesson, getLessons } from "@/lib/content";
import { getQuiz } from "@/lib/quiz";

export function generateStaticParams() {
  return getLessons().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  return { title: getLesson(slug)?.title };
}

export default async function LessonPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const quiz = getQuiz(lesson.slug);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <LessonTracker lessonId={lesson.slug} />
      <p className="text-sm text-muted-foreground">
        Level {lesson.level} · {lesson.minutes} phút
      </p>
      <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
      <div data-ask-ai className="prose prose-neutral dark:prose-invert mt-6 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.body}</ReactMarkdown>
      </div>
      {lesson.keywords.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Hỏi Google AI</h2>
          <div className="flex flex-wrap gap-2">
            {lesson.keywords.map((k) => (
              <AskAiKeyword key={k} term={k} />
            ))}
          </div>
        </section>
      )}
      {quiz && (
        <section className="mt-10 space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold">Kiểm tra kiến thức</h2>
          <p className="text-sm text-muted-foreground">
            Thứ tự câu và đáp án được xáo trộn mỗi lần làm. Có câu chọn nhiều đáp án; phải chọn đúng và đủ mới được điểm.
          </p>
          <Suspense>
            <QuizRunner quiz={quiz} />
          </Suspense>
        </section>
      )}
      <div className="mt-10 border-t pt-6">
        <MarkDoneButton lessonId={lesson.slug} />
      </div>
    </article>
  );
}
