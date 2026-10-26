import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessons } from "@/lib/content";

export const metadata = { title: "Bài học" };

export default function LearnPage() {
  const lessons = getLessons();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Lộ trình học</h1>
      <div className="mt-6 grid gap-3">
        {lessons.map((l) => (
          <Link key={l.slug} href={`/learn/${l.slug}`}>
            <Card className="transition-colors hover:bg-accent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Level {l.level}</Badge>
                  <span className="text-xs text-muted-foreground">{l.minutes} phút</span>
                </div>
                <CardTitle>{l.title}</CardTitle>
                <CardDescription>{l.summary}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
