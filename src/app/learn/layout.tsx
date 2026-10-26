import { LessonSidebar } from "@/components/site/lesson-sidebar";
import { getLessons } from "@/lib/content";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const lessons = getLessons().map(({ slug, title, level }) => ({ slug, title, level }));
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto py-8 lg:block">
        <LessonSidebar lessons={lessons} />
      </aside>
      <div className="min-w-0 flex-1">
        <details className="mt-4 rounded-lg border p-3 lg:hidden">
          <summary className="cursor-pointer text-sm font-medium">Danh sách bài học</summary>
          <div className="mt-3">
            <LessonSidebar lessons={lessons} />
          </div>
        </details>
        {children}
      </div>
    </div>
  );
}
