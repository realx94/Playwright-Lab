import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ExercisePanel } from "@/components/lab/exercise-panel";
import { TestCaseWorkshop } from "@/components/lab/test-case-workshop";
import { LABS } from "@/lib/labs/registry";
import { WORKSHOPS } from "@/lib/labs/testcases";

export function generateStaticParams() {
  return LABS.filter((l) => l.ready).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/labs/[slug]">) {
  const { slug } = await params;
  return { title: LABS.find((l) => l.slug === slug)?.title };
}

/**
 * Trang hướng dẫn của lab (đề bài, workshop, bài tập).
 * Tách khỏi /lab/<slug> để trang ứng dụng không có thêm phần tử gây trùng locator.
 */
export default async function LabGuidePage({ params }: PageProps<"/labs/[slug]">) {
  const { slug } = await params;
  const lab = LABS.find((l) => l.slug === slug && l.ready);
  if (!lab) notFound();
  const ws = WORKSHOPS[lab.slug];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{lab.id}</Badge>
        <Badge variant="outline">{lab.domain}</Badge>
        <span className="text-sm text-muted-foreground">{"★".repeat(lab.difficulty)}</span>
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{lab.title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Kỹ năng: {lab.skills.join(" · ")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link href={`/lab/${lab.slug}`} target="_blank" rel="noopener noreferrer" className={buttonVariants({})} data-testid="open-lab">
          <ExternalLink className="size-4" /> Mở ứng dụng lab
        </Link>
        <p className="text-sm text-muted-foreground">
          URL để test: <code>/lab/{lab.slug}</code> · bật bug bằng <code>?bugs=BUG-01</code>
        </p>
      </div>

      {ws && (
        <section aria-labelledby="lab-requirements" className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-panel sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary"><ListChecks className="size-5" aria-hidden="true" /></span>
            <div>
              <h2 id="lab-requirements" className="text-xl font-semibold">Yêu cầu nghiệp vụ của lab</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Ứng dụng phải đáp ứng các quy tắc dưới đây. Hãy đọc phần này trước khi viết test; mỗi bài tập phía dưới nêu việc cần kiểm chứng cụ thể.</p>
            </div>
          </div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {ws.rules.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-background p-4 text-sm leading-6">
                <span className="mb-2 block text-xs font-bold text-primary">{r.id}</span>
                {r.text}
              </li>
            ))}
          </ol>
        </section>
      )}

      <TestCaseWorkshop lab={lab.slug} />
      <ExercisePanel lab={lab.slug} />
    </div>
  );
}
