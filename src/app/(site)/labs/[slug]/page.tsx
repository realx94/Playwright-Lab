import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{lab.id}</Badge>
        <Badge variant="outline">{lab.domain}</Badge>
        <span className="text-sm text-muted-foreground">{"★".repeat(lab.difficulty)}</span>
      </div>
      <h1 className="mt-2 text-3xl font-bold">{lab.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Kỹ năng: {lab.skills.join(" · ")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link href={`/lab/${lab.slug}`} className={buttonVariants({})} data-testid="open-lab">
          <ExternalLink className="size-4" /> Mở ứng dụng lab
        </Link>
        <p className="text-sm text-muted-foreground">
          URL để test: <code>/lab/{lab.slug}</code> · bật bug bằng <code>?bugs=BUG-01</code>
        </p>
      </div>

      {ws && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Business Rules</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {ws.rules.map((r) => (
              <li key={r.id}>
                <b>{r.id}</b> {r.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <TestCaseWorkshop lab={lab.slug} />
      <ExercisePanel lab={lab.slug} />
    </div>
  );
}
