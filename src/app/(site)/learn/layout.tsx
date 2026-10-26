import { LessonSidebar } from "@/components/site/lesson-sidebar";
import { getLessons } from "@/lib/content";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const lessons = getLessons().map(({ slug, title, level }) => ({ slug, title, level }));
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6">
      <aside className="sticky top-28 hidden h-[calc(100vh-7rem)] w-72 shrink-0 overflow-y-auto border-r border-border py-8 pr-5 lg:block">
        <LessonSidebar lessons={lessons} />
      </aside>
      <div className="min-w-0 flex-1">
        <details className="mt-5 rounded-xl border border-border bg-card p-4 shadow-panel lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold">Danh sách bài học</summary>
          <div className="mt-3">
            <LessonSidebar lessons={lessons} />
          </div>
        </details>
        {children}
      </div>
    </div>
  );
}
