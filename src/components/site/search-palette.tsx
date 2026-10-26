"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface SearchItem {
  id: string;
  group: "Bài học" | "Lab" | "Thuật ngữ" | "Trang";
  title: string;
  subtitle?: string;
  href: string;
}

const GROUPS: SearchItem["group"][] = ["Bài học", "Lab", "Thuật ngữ", "Trang"];

/** Tìm kiếm toàn site bằng Ctrl+K (hoặc Cmd+K). */
export function SearchPalette({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Tìm kiếm"
        data-testid="open-search"
        className="gap-2 text-muted-foreground"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Tìm kiếm</span>
        <kbd className="hidden rounded border px-1 text-[10px] sm:inline">Ctrl K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Tìm kiếm" description="Tìm bài học, lab, thuật ngữ">
        <Command>
        <CommandInput placeholder="Tìm bài học, lab, thuật ngữ…" />
        <CommandList>
          <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
          {GROUPS.map((g) => (
            <CommandGroup key={g} heading={g}>
              {items
                .filter((i) => i.group === g)
                .map((i) => (
                  <CommandItem
                    key={i.id}
                    value={`${i.title} ${i.subtitle ?? ""}`}
                    onSelect={() => go(i.href)}
                  >
                    <div className="flex flex-col">
                      <span>{i.title}</span>
                      {i.subtitle && (
                        <span className="line-clamp-1 text-xs text-muted-foreground">{i.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
