import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AskAiKeyword } from "@/components/ask-ai/selection-popover";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { LessonTracker } from "@/components/site/lesson-tracker";
import { LEVEL_NAMES } from "@/components/site/lesson-sidebar";
import { Markdown } from "@/components/site/markdown";
import { MarkDoneButton } from "@/components/site/mark-done-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

  const all = getLessons();
  const index = all.findIndex((l) => l.slug === lesson.slug);
  const prev = all[index - 1];
  const next = all[index + 1];

  return (
    <article className="max-w-3xl py-8">
      <LessonTracker lessonId={lesson.slug} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/learn" />}>Bài học</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>
              Level {lesson.level} · {LEVEL_NAMES[lesson.level]}
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <p className="mt-4 text-sm text-muted-foreground">{lesson.minutes} phút</p>
      <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
      <div data-ask-ai className="prose prose-neutral dark:prose-invert mt-6 max-w-none">
        <Markdown>{lesson.body}</Markdown>
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
      <nav aria-label="Điều hướng bài học" className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/learn/${prev.slug}`}
            data-testid="prev-lesson"
            className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:bg-accent"
          >
            <ChevronLeft className="size-4 shrink-0" />
            <span>
              <span className="block text-xs text-muted-foreground">Bài trước</span>
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/learn/${next.slug}`}
            data-testid="next-lesson"
            className="flex items-center justify-end gap-2 rounded-lg border p-3 text-right text-sm hover:bg-accent"
          >
            <span>
              <span className="block text-xs text-muted-foreground">Bài tiếp theo</span>
              {next.title}
            </span>
            <ChevronRight className="size-4 shrink-0" />
          </Link>
        )}
      </nav>
    </article>
  );
}
