import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LABS } from "@/lib/labs/registry";

export const metadata = { title: "Lab" };

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Danh sách Lab</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {LABS.map((l) => {
          const card = (
            <Card className={l.ready ? "transition-colors hover:bg-accent" : "opacity-60"}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{l.id}</Badge>
                  <Badge variant="outline">{l.domain}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {"★".repeat(l.difficulty)}
                  </span>
                  {!l.ready && <Badge variant="outline">Sắp ra mắt</Badge>}
                </div>
                <CardTitle>{l.title}</CardTitle>
                <CardDescription>{l.skills.join(" · ")}</CardDescription>
              </CardHeader>
            </Card>
          );
          return l.ready ? (
            <Link key={l.slug} href={`/labs/${l.slug}`}>{card}</Link>
          ) : (
            <div key={l.slug}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
