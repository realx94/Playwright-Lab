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
    <article className="max-w-3xl pb-16 pt-10">
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
      <p className="mt-8 inline-flex rounded-lg bg-brand-soft px-3 py-1 text-sm font-semibold text-secondary-foreground">Bài {lesson.level}.{lesson.order} · {lesson.minutes} phút</p>
      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{lesson.title}</h1>
      <div data-ask-ai className="prose prose-slate dark:prose-invert mt-9 max-w-none leading-8 prose-headings:scroll-mt-32 prose-headings:tracking-tight prose-p:leading-8 prose-a:text-primary prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-card prose-code:break-words">
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
        <section className="mt-12 space-y-4 border-t border-border pt-8">
          <h2 className="text-xl font-semibold">Kiểm tra kiến thức</h2>
          <p className="text-sm text-muted-foreground">
            Thứ tự câu và đáp án được xáo trộn mỗi lần làm. Có câu chọn nhiều đáp án; phải chọn đúng và đủ mới được điểm.
          </p>
          <Suspense>
            <QuizRunner quiz={quiz} />
          </Suspense>
        </section>
      )}
      <div className="mt-10 border-t border-border pt-6">
        <MarkDoneButton lessonId={lesson.slug} />
      </div>
      <nav aria-label="Điều hướng bài học" className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/learn/${prev.slug}`}
            data-testid="prev-lesson"
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm shadow-panel hover:bg-accent"
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
            className="flex items-center justify-end gap-2 rounded-xl border border-border bg-card p-4 text-right text-sm shadow-panel hover:bg-accent"
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
