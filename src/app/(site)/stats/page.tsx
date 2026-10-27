import { BugBoard, type BugExercise } from "@/components/site/bug-board";
import { Notebook } from "@/components/site/notebook";
import { StatsApp } from "@/components/site/stats-app";
import { getLessons } from "@/lib/content";
import { EXERCISES } from "@/lib/labs/exercises";
import { LABS } from "@/lib/labs/registry";

export const metadata = { title: "Thống kê" };

export default function StatsPage() {
  const lessons = getLessons().map(({ slug, title, level }) => ({ slug, title, level }));
  const titles = new Map(LABS.map((l) => [l.slug, l.title]));
  const bugItems: BugExercise[] = Object.entries(EXERCISES).flatMap(([lab, list]) =>
    list.filter((e) => e.bugs?.length).map((e) => ({ exerciseId: e.id, lab, labTitle: titles.get(lab) ?? lab, bugs: e.bugs! })),
  );
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Thống kê học tập</h1>
      <StatsApp lessons={lessons} />
      <div className="mt-10 space-y-10">
        <BugBoard items={bugItems} />
        <Notebook />
      </div>
    </div>
  );
}
