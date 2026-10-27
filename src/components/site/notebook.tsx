"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildAskUrl } from "@/lib/ask-ai";
import { storage } from "@/lib/storage";
import { notifyDataChanged, onDataChanged } from "@/lib/storage/events";

/** Tách khỏi component để lint purity không coi Date.now là gọi trong lúc render. */
const clock = () => Date.now();

interface Note {
  term: string;
  count: number;
  last: number;
}

/** Sổ tay của tôi: các thuật ngữ đã hỏi Google AI, gộp theo từ, hỏi lại hoặc xoá được. Dữ liệu nằm trong trình duyệt. */
export function Notebook() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const byTerm = new Map<string, Note>();
    for (const a of await storage.listAsk()) {
      const n = byTerm.get(a.term) ?? { term: a.term, count: 0, last: 0 };
      n.count += 1;
      n.last = Math.max(n.last, a.askedAt);
      byTerm.set(a.term, n);
    }
    setNotes([...byTerm.values()].sort((a, b) => b.last - a.last));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => setNotes([]));
    return onDataChanged(() => void load().catch(() => {}));
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (notes ?? []).filter((n) => q === "" || n.term.toLowerCase().includes(q));
  }, [notes, query]);

  if (notes === null) return null;

  async function remove(term: string) {
    await storage.removeAsk(term);
    await load();
    notifyDataChanged();
  }

  async function askAgain(term: string) {
    window.open(buildAskUrl(term, "eli5"), "_blank", "noopener,noreferrer");
    await storage.addAsk({ term, askedAt: clock() });
    await load();
    notifyDataChanged();
  }

  return (
    <section aria-label="Sổ tay của tôi" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Sổ tay của tôi</h2>
          <p className="text-sm text-muted-foreground">Mọi thuật ngữ bạn đã bôi đen để hỏi Google AI trong bài học.</p>
        </div>
        {notes.length > 5 && (
          <div className="space-y-1.5">
            <Label htmlFor="notebook-q">Tìm trong sổ tay</Label>
            <Input id="notebook-q" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" />
          </div>
        )}
      </div>

      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground" data-testid="notebook-empty">
          Sổ tay còn trống. Khi đọc bài học, hãy bôi đen một thuật ngữ rồi bấm “Hỏi Google AI”; từ đó sẽ được lưu ở đây.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border" data-testid="notebook-list">
          {shown.map((n) => (
            <li key={n.term} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm" data-testid="notebook-item">
              <span>
                <b data-testid="notebook-term">{n.term}</b>{" "}
                <span className="text-muted-foreground">
                  · hỏi {n.count} lần · gần nhất {new Date(n.last).toLocaleDateString("vi-VN")}
                </span>
              </span>
              <span className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => askAgain(n.term)} aria-label={`Hỏi lại: ${n.term}`}>
                  Hỏi lại
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => remove(n.term)} aria-label={`Xoá khỏi sổ tay: ${n.term}`}>
                  Xoá
                </Button>
              </span>
            </li>
          ))}
          {shown.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">Không có thuật ngữ nào khớp.</li>}
        </ul>
      )}
    </section>
  );
}
