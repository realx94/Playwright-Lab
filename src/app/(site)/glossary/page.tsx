import Link from "next/link";
import { AskAiKeyword } from "@/components/ask-ai/selection-popover";
import { GLOSSARY } from "@/content/glossary";

export const metadata = { title: "Thuật ngữ" };

const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "vi"));

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Thuật ngữ</h1>
      <p className="mt-2 text-muted-foreground">
        {sorted.length} thuật ngữ thường gặp. Chưa rõ? Bấm nút để hỏi Google AI giải thích sâu hơn.
      </p>
      <dl className="mt-8 divide-y" data-ask-ai>
        {sorted.map((g) => (
          <div key={g.term} className="space-y-2 py-4" data-testid="glossary-term">
            <dt id={g.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="font-semibold">
              {g.term}
            </dt>
            <dd className="space-y-2 text-sm">
              <p>{g.definition}</p>
              <div className="flex flex-wrap items-center gap-2">
                {g.lesson && (
                  <Link className="text-sm underline" href={`/learn/${g.lesson}`}>
                    Xem bài học
                  </Link>
                )}
                <AskAiKeyword term={g.term} />
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
