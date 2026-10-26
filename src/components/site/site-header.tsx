import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { SearchPalette, type SearchItem } from "@/components/site/search-palette";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { GLOSSARY } from "@/content/glossary";
import { getLessons } from "@/lib/content";
import { LABS } from "@/lib/labs/registry";

const links = [
  { href: "/learn", label: "Bài học" },
  { href: "/labs", label: "Lab" },
  { href: "/starter", label: "Starter" },
  { href: "/glossary", label: "Thuật ngữ" },
  { href: "/cheatsheet", label: "Cheat sheet" },
  { href: "/stats", label: "Thống kê" },
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
    ...links.map<SearchItem>((l) => ({ id: `page-${l.href}`, group: "Trang", title: l.label, href: l.href })),
  ];
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FlaskConical className="size-5" /> Playwright Lab
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden gap-4 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <SearchPalette items={buildSearchItems()} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
