import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LABS } from "@/lib/labs/registry";

export const metadata = { title: "Lab" };

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Thực hành</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Danh sách Lab</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Chọn một tình huống nghiệp vụ, đọc yêu cầu rồi viết test trên ứng dụng mẫu. Mỗi lab có quy tắc và bài tập riêng.</p>
      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LABS.map((l) => {
          const card = (
            <Card className={l.ready ? "h-full border border-border shadow-panel transition-colors group-hover:border-primary/40 group-hover:bg-accent/50" : "h-full border border-border opacity-60"}>
              <CardHeader className="gap-3 px-5 py-2 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{l.id}</Badge>
                  <Badge variant="outline">{l.domain}</Badge>
                  {!l.ready && <Badge variant="outline">Sắp ra mắt</Badge>}
                </div>
                <CardTitle className="flex items-start justify-between gap-3 text-lg font-semibold">
                  <span>{l.title}</span>
                  {l.ready ? <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" /> : <FlaskConical className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                </CardTitle>
                <CardDescription className="leading-6">{l.skills.join(" · ")}</CardDescription>
                <p className="pt-2 text-xs font-medium text-muted-foreground">Độ khó: {"★".repeat(l.difficulty)}{"☆".repeat(3 - l.difficulty)}</p>
              </CardHeader>
            </Card>
          );
          return l.ready ? (
            <Link key={l.slug} href={`/labs/${l.slug}`} className="group rounded-2xl focus-visible:ring-2 focus-visible:ring-ring">{card}</Link>
          ) : (
            <div key={l.slug}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
