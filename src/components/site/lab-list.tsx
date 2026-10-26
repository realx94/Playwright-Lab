"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LabInfo } from "@/lib/labs/registry";

const LEVELS: { d: 1 | 2 | 3; name: string; hint: string }[] = [
  { d: 1, name: "Dễ", hint: "Làm quen locator, action, assertion" },
  { d: 2, name: "Vừa", hint: "Nhiều bước, dữ liệu và trạng thái" },
  { d: 3, name: "Khó", hint: "Thời gian, nhiều tab, API, bên thứ ba" },
];

const idNumber = (id: string) => Number(id.replace(/\D/g, ""));
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

function LabCard({ l }: { l: LabInfo }) {
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
    <Link href={`/labs/${l.slug}`} className="group rounded-2xl focus-visible:ring-2 focus-visible:ring-ring" data-testid="lab-card">
      {card}
    </Link>
  ) : (
    <div data-testid="lab-card">{card}</div>
  );
}

/** Danh sách lab: xếp theo độ khó rồi theo mã, có lọc theo độ khó, domain (chọn nhiều) và từ khoá kỹ năng. */
export function LabList({ labs }: { labs: LabInfo[] }) {
  const [levels, setLevels] = useState<number[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const allDomains = useMemo(() => [...new Set(labs.map((l) => l.domain))].sort((a, b) => a.localeCompare(b, "vi")), [labs]);
  const sorted = useMemo(() => [...labs].sort((a, b) => a.difficulty - b.difficulty || idNumber(a.id) - idNumber(b.id)), [labs]);

  const q = norm(query.trim());
  const shown = sorted.filter(
    (l) =>
      (levels.length === 0 || levels.includes(l.difficulty)) &&
      (domains.length === 0 || domains.includes(l.domain)) &&
      (q === "" || norm([l.title, l.id, l.domain, ...l.skills].join(" ")).includes(q)),
  );
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const filtering = levels.length > 0 || domains.length > 0 || q !== "";

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`;

  return (
    <div>
      <section aria-label="Bộ lọc lab" className="mt-8 space-y-4 rounded-2xl border p-4 sm:p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium">Độ khó</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lv) => (
              <button key={lv.d} type="button" aria-pressed={levels.includes(lv.d)} className={chip(levels.includes(lv.d))} onClick={() => setLevels(toggle(levels, lv.d))}>
                {lv.name} {"★".repeat(lv.d)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Domain</p>
          <div className="flex flex-wrap gap-2">
            {allDomains.map((d) => (
              <button key={d} type="button" aria-pressed={domains.includes(d)} className={chip(domains.includes(d))} onClick={() => setDomains(toggle(domains, d))}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 space-y-1.5">
            <Label htmlFor="lab-q">Tìm theo tên hoặc kỹ năng</Label>
            <Input id="lab-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: iframe, page.clock, OTP" />
          </div>
          <Button type="button" variant="outline" disabled={!filtering} onClick={() => { setLevels([]); setDomains([]); setQuery(""); }}>
            Xoá bộ lọc
          </Button>
        </div>
        <p className="text-sm text-muted-foreground" role="status" data-testid="lab-count">
          Hiển thị {shown.length}/{labs.length} lab
        </p>
      </section>

      {shown.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed p-6 text-sm text-muted-foreground" data-testid="lab-empty">
          Không có lab nào khớp bộ lọc. Hãy bỏ bớt điều kiện.
        </p>
      ) : (
        LEVELS.map((lv) => {
          const group = shown.filter((l) => l.difficulty === lv.d);
          if (group.length === 0) return null;
          return (
            <section key={lv.d} aria-label={`Lab mức ${lv.name}`} className="mt-10">
              <h2 className="text-xl font-semibold">
                {lv.name} <span className="text-muted-foreground">{"★".repeat(lv.d)}</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {lv.hint} ({group.length} lab)
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.map((l) => (
                  <LabCard key={l.slug} l={l} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
