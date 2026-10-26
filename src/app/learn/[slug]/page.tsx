import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AskAiKeyword } from "@/components/ask-ai/selection-popover";
import { LessonTracker } from "@/components/site/lesson-tracker";
import { getLesson, getLessons } from "@/lib/content";

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
    </article>
  );
}
