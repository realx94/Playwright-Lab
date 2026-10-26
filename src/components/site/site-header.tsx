import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { SearchPalette, type SearchItem } from "@/components/site/search-palette";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { GLOSSARY } from "@/content/glossary";
import { INTERVIEW } from "@/content/interview";
import { getLessons } from "@/lib/content";
import { LABS } from "@/lib/labs/registry";

const links = [
  { href: "/learn", label: "Bài học" },
  { href: "/labs", label: "Lab" },
  { href: "/starter", label: "Starter" },
  { href: "/interview", label: "Phỏng vấn" },
  { href: "/glossary", label: "Thuật ngữ" },
  { href: "/cheatsheet", label: "Cheat sheet" },
  { href: "/stats", label: "Thống kê" },
  { href: "/settings/services", label: "Dịch vụ" },
];

function buildSearchItems(): SearchItem[] {
  return [
    ...getLessons().map<SearchItem>((l) => ({
      id: `lesson-${l.slug}`,
      group: "Bài học",
      title: l.title,
      subtitle: `Level ${l.level} · ${l.summary}`,
      href: `/learn/${l.slug}`,
    })),
    ...LABS.filter((l) => l.ready).map<SearchItem>((l) => ({
      id: `lab-${l.slug}`,
      group: "Lab",
      title: `${l.id} ${l.title}`,
      subtitle: l.skills.join(" · "),
      href: `/labs/${l.slug}`,
    })),
    ...GLOSSARY.map<SearchItem>((g) => ({
      id: `term-${g.term}`,
      group: "Thuật ngữ",
      title: g.term,
      subtitle: g.definition,
      href: g.lesson ? `/learn/${g.lesson}` : "/glossary",
    })),
    ...INTERVIEW.map<SearchItem>((q) => ({
      id: `interview-${q.id}`,
      group: "Trang",
      title: q.question,
      subtitle: `Phỏng vấn · ${q.topic}`,
      href: "/interview",
    })),
    { id: "page-/placement", group: "Trang", title: "Bài kiểm tra đầu vào", href: "/placement" },
    ...links.map<SearchItem>((l) => ({ id: `page-${l.href}`, group: "Trang", title: l.label, href: l.href })),
  ];
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg font-semibold tracking-tight text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FlaskConical className="size-5" aria-hidden="true" />
          </span>
          <span>Playwright <span className="text-primary">Lab</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <SearchPalette items={buildSearchItems()} />
          <ThemeToggle />
        </div>
      </div>
      <nav aria-label="Điều hướng chính" className="mx-auto flex h-11 max-w-7xl items-center gap-1 overflow-x-auto px-3 text-sm sm:px-5">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 rounded-lg px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
