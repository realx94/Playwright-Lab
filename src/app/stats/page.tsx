import { StatsApp } from "@/components/site/stats-app";
import { getLessons } from "@/lib/content";

export const metadata = { title: "Thống kê" };

export default function StatsPage() {
  const lessons = getLessons().map(({ slug, title, level }) => ({ slug, title, level }));
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Thống kê học tập</h1>
      <StatsApp lessons={lessons} />
    </div>
  );
}
