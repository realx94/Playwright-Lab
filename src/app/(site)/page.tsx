import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, FlaskConical, Layers3 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ContinueLearning } from "@/components/site/continue-learning";
import { getLessons } from "@/lib/content";
import { LABS } from "@/lib/labs/registry";

const levels = [
  { n: 0, t: "Chuẩn bị", d: "Cài đặt và chạy bài test đầu tiên" },
  { n: 1, t: "Nền tảng", d: "Git, JavaScript, TypeScript và async/await" },
  { n: 2, t: "Playwright cơ bản", d: "Locator, thao tác, assertion và debug" },
  { n: 3, t: "Tư duy test", d: "Biến yêu cầu nghiệp vụ thành test case" },
  { n: 4, t: "Framework", d: "POM, fixture, API và môi trường" },
  { n: 5, t: "Chuyên nghiệp", d: "CI/CD, BDD, flaky test và AI" },
];

export default function Home() {
  const lessons = getLessons().map(({ slug, title, level }) => ({ slug, title, level }));
  const readyLabs = LABS.filter((lab) => lab.ready).length;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-brand-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <FlaskConical className="size-4" aria-hidden="true" /> Học bằng thực hành
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Học Playwright từ cơ bản đến <span className="text-primary">tự tin viết test.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Đi từ yêu cầu nghiệp vụ đến test case và code tự động. Học từng bước, rồi thực hành ngay trên các lab trong website.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/learn" className={buttonVariants({ size: "lg", className: "h-11 gap-2 px-5 shadow-panel" })}>
              Bắt đầu học <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/labs" className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-5" })}>
              Xem các lab
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-panel sm:p-7">
          <div className="flex items-center gap-3 border-b border-border pb-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-primary"><Layers3 className="size-5" aria-hidden="true" /></span>
            <div>
              <p className="font-semibold">Lộ trình rõ ràng</p>
              <p className="text-sm text-muted-foreground">Học lý thuyết, áp dụng, kiểm tra</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-2xl bg-muted p-4">
              <BookOpen className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-2xl font-bold">{lessons.length}</p>
              <p className="text-sm text-muted-foreground">bài học theo lộ trình</p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <FlaskConical className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-2xl font-bold">{readyLabs}</p>
              <p className="text-sm text-muted-foreground">lab có thể thực hành</p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border p-4 text-sm leading-6">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
            <span>Bài học ngắn, có quiz và bài tập để tự kiểm tra mức độ hiểu.</span>
          </div>
        </div>
      </section>

      <div className="mt-12 max-w-3xl"><ContinueLearning lessons={lessons} /></div>

      <section className="mt-20" aria-labelledby="levels-heading">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Lộ trình học</p>
            <h2 id="levels-heading" className="mt-2 text-3xl font-bold tracking-tight">Sáu chặng, từ đầu đến cuối</h2>
          </div>
          <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Xem tất cả bài học <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => (
            <Link key={level.n} href={`/learn#level-${level.n}`} className="group rounded-2xl border border-border bg-card p-6 shadow-panel transition-transform hover:-translate-y-1 hover:border-primary/40 focus-visible:border-primary">
              <span className="inline-flex rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-bold text-secondary-foreground">LEVEL {level.n}</span>
              <h3 className="mt-5 flex items-center justify-between gap-3 text-lg font-semibold">
                {level.t}<ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{level.d}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
