"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  addMonths,
  daysInMonth,
  formatDate,
  isDayDisabled,
  leadingBlanks,
  parseIso,
  pickDay,
  toIso,
} from "@/lib/labs/hotel-rules";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/**
 * Lịch tuỳ biến (không phải input type=date) để chọn khoảng ngày nhận/trả phòng.
 * Ngày quá khứ bị vô hiệu, chọn ngày trả tối đa 30 đêm kể từ ngày nhận, khoảng ngày được tô nổi bật.
 */
export function DateRangePicker({
  today,
  checkIn,
  checkOut,
  bugs,
  onChange,
}: {
  today: string;
  checkIn: string;
  checkOut: string;
  bugs: Set<string>;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<"in" | "out">("in");
  const todayP = parseIso(today);
  const [view, setView] = useState({ y: todayP.y, m: todayP.m });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openWith(mode: "in" | "out") {
    const m = mode === "out" && checkIn ? "out" : "in";
    setPicking(m);
    const anchor = parseIso(checkIn || today);
    setView({ y: anchor.y, m: anchor.m });
    setOpen(true);
  }

  function click(day: string) {
    const r = pickDay({ checkIn, checkOut, picking }, day, bugs);
    onChange(r.checkIn, r.checkOut);
    setPicking(r.picking);
    if (r.close) setOpen(false);
  }

  const minView = { y: todayP.y, m: todayP.m };
  const maxView = addMonths(todayP.y, todayP.m, 12);
  const atMin = view.y * 12 + view.m <= minView.y * 12 + minView.m;
  const atMax = view.y * 12 + view.m >= maxView.y * 12 + maxView.m;
  const go = (n: number) => setView((v) => addMonths(v.y, v.m, n));

  const total = daysInMonth(view.y, view.m);
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks(view.y, view.m) }, () => null),
    ...Array.from({ length: total }, (_, i) => toIso(view.y, view.m, i + 1)),
  ];

  return (
    <div ref={wrapRef} className="relative sm:col-span-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="hotel-checkin">Nhận phòng</Label>
          <Button
            id="hotel-checkin"
            type="button"
            variant="outline"
            className="w-full justify-start"
            data-testid="checkin-btn"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => openWith("in")}
          >
            {checkIn ? formatDate(checkIn) : "Chọn ngày"}
          </Button>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-checkout">Trả phòng</Label>
          <Button
            id="hotel-checkout"
            type="button"
            variant="outline"
            className="w-full justify-start"
            data-testid="checkout-btn"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => openWith("out")}
          >
            {checkOut ? formatDate(checkOut) : "Chọn ngày"}
          </Button>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Lịch chọn ngày"
          data-testid="calendar"
          className="absolute left-0 z-30 mt-2 w-72 rounded-xl border bg-popover p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <Button type="button" variant="ghost" size="sm" disabled={atMin} aria-label="Tháng trước" data-testid="cal-prev" onClick={() => go(-1)}>
              ‹
            </Button>
            <div className="text-sm font-medium" data-testid="cal-title" aria-live="polite">
              Tháng {view.m} {view.y}
            </div>
            <Button type="button" variant="ghost" size="sm" disabled={atMax} aria-label="Tháng sau" data-testid="cal-next" onClick={() => go(1)}>
              ›
            </Button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-xs text-muted-foreground">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1" data-testid="cal-grid">
            {cells.map((day, i) => {
              if (!day) return <div key={`b${i}`} />;
              const disabled = isDayDisabled(day, today, checkIn, picking);
              const isIn = day === checkIn;
              const isOut = day === checkOut;
              const inRange = !!checkIn && !!checkOut && day > checkIn && day < checkOut;
              const dd = parseIso(day);
              const cls = isIn || isOut ? "bg-primary text-primary-foreground" : inRange ? "bg-primary/20" : "hover:bg-accent";
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  data-testid={`day-${day}`}
                  data-state={isIn ? "checkin" : isOut ? "checkout" : inRange ? "in-range" : "none"}
                  aria-label={`${String(dd.d).padStart(2, "0")}/${String(dd.m).padStart(2, "0")}/${dd.y}`}
                  aria-pressed={isIn || isOut}
                  className={`mx-auto h-8 w-8 rounded-md text-sm disabled:cursor-not-allowed disabled:text-muted-foreground disabled:line-through disabled:opacity-50 ${cls}`}
                  onClick={() => click(day)}
                >
                  {dd.d}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground" data-testid="cal-hint">
            {picking === "in" ? "Chọn ngày nhận phòng" : "Chọn ngày trả phòng (tối đa 30 đêm)"}
          </p>
        </div>
      )}
    </div>
  );
}
