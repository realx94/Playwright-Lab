import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";

const links = [
  { href: "/learn", label: "Bài học" },
  { href: "/labs", label: "Lab" },
  { href: "/starter", label: "Starter" },
  { href: "/stats", label: "Thống kê" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FlaskConical className="size-5" /> Playwright Lab
        </Link>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
