"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ASK_STYLES,
  type AskStyle,
  buildAskUrl,
  isValidSelection,
  normalizeSelection,
} from "@/lib/ask-ai";
import { storage } from "@/lib/storage";

interface Pos {
  x: number;
  y: number;
  text: string;
}

/** Bôi đen trong vùng [data-ask-ai] → hiện nút hỏi Google AI. */
export function SelectionPopover() {
  const [pos, setPos] = useState<Pos | null>(null);
  const [style, setStyle] = useState<AskStyle>("eli5");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ask-ai-style") as AskStyle | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && ASK_STYLES.some((s) => s.id === saved)) setStyle(saved);
    } catch {}
  }, []);

  const update = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return setPos(null);
    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const el = node instanceof Element ? node : node.parentElement;
    if (!el?.closest("[data-ask-ai]")) return setPos(null);
    const text = normalizeSelection(sel.toString());
    if (!isValidSelection(text)) return setPos(null);
    const r = range.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top, text });
  }, []);

  useEffect(() => {
    const onUp = () => setTimeout(update, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        const t = normalizeSelection(window.getSelection()?.toString() ?? "");
        if (isValidSelection(t)) ask(t);
      }
    };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    document.addEventListener("keydown", onKey);
    document.addEventListener("selectionchange", () => {
      if (window.getSelection()?.isCollapsed) setPos(null);
    });
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, style]);

  function ask(text: string) {
    window.open(buildAskUrl(text, style), "_blank", "noopener,noreferrer");
    storage.addAsk({ term: text, askedAt: Date.now() }).catch(() => {});
    setPos(null);
  }

  function changeStyle(s: AskStyle) {
    setStyle(s);
    try {
      localStorage.setItem("ask-ai-style", s);
    } catch {}
  }

  if (!pos) return null;
  return (
    <div
      role="toolbar"
      aria-label="Hỏi Google AI"
      className="fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-lg border bg-popover p-1 shadow-md"
      style={{ left: pos.x, top: Math.max(pos.y - 8, 48) }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button size="sm" onClick={() => ask(pos.text)}>
        <Sparkles className="size-4" /> Hỏi Google AI
      </Button>
      <select
        aria-label="Kiểu giải thích"
        className="h-8 rounded-md border bg-background px-2 text-xs"
        value={style}
        onChange={(e) => changeStyle(e.target.value as AskStyle)}
      >
        {ASK_STYLES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AskAiKeyword({ term }: { term: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        window.open(buildAskUrl(term), "_blank", "noopener,noreferrer");
        storage.addAsk({ term, askedAt: Date.now() }).catch(() => {});
      }}
    >
      <Sparkles className="size-3.5" /> {term}
    </Button>
  );
}
