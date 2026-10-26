import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContinueLearning } from "@/components/site/continue-learning";
import { getLessons } from "@/lib/content";

const levels = [
  { n: 0, t: "Chuẩn bị", d: "Cài đặt, chạy test đầu tiên" },
  { n: 1, t: "Nền tảng", d: "Git, JavaScript, TypeScript, async/await" },
  { n: 2, t: "Playwright cơ bản", d: "Locator, action, assertion, debug" },
  { n: 3, t: "Tư duy test", d: "Thiết kế test case từ nghiệp vụ" },
  { n: 4, t: "Framework", d: "POM, fixture, API, env" },
  { n: 5, t: "Chuyên nghiệp", d: "CI/CD, BDD, flaky, AI" },
];

export default function Home() {
  const lessons = getLessons().map(({ slug, title, level }) => ({ slug, title, level }));
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Playwright Automation từ Zero đến Hero</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Hiểu bài toán nghiệp vụ → thiết kế test case → thực hành Playwright ngay trên các lab
          có sẵn trong website này.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/learn" className={buttonVariants({ size: "lg" })}>
            Bắt đầu học
          </Link>
          <Link href="/labs" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Xem các lab
          </Link>
        </div>
      </section>
      <div className="mt-10 max-w-2xl">
        <ContinueLearning lessons={lessons} />
      </div>
      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((l) => (
          <Card key={l.n}>
            <CardHeader>
              <CardTitle>Level {l.n} · {l.t}</CardTitle>
              <CardDescription>{l.d}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
