"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  CUTOFF_MS,
  DATES,
  TZ_KEY,
  ZONES,
  browserZone,
  duration,
  formatIn,
  formatSlot,
  slotsOf,
  type Booking,
} from "@/lib/labs/tz-rules";

/** Đặt lịch hẹn hiển thị theo múi giờ; dùng page.clock để điều khiển "bây giờ" và timezoneId để đổi múi giờ trình duyệt. */
export function TimezoneApp() {
  const bugs = useBugs();
  const [zoneChoice, setZoneChoice] = useState<string>("auto");
  const [date, setDate] = useState<string>(DATES[0]);
  const [now, setNow] = useState(0);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [ready, setReady] = useState(false);
  const [local, setLocal] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setNow(Date.now());
    setLocal(browserZone());
    try {
      const raw = localStorage.getItem(TZ_KEY);
      if (raw) setBooking(JSON.parse(raw) as Booking);
    } catch {}
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  // BUG-01: luôn dùng múi giờ trình duyệt dù người dùng đã chọn múi giờ khác
  const zone = bugs.has("BUG-01") || zoneChoice === "auto" ? local : zoneChoice;
  const dstBug = bugs.has("BUG-03");

  function save(b: Booking | null) {
    setBooking(b);
    try {
      if (b) localStorage.setItem(TZ_KEY, JSON.stringify(b));
      else localStorage.removeItem(TZ_KEY);
    } catch {}
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="grid grid-cols-2 gap-4 rounded-xl border p-4">
        <div className="space-y-1.5">
          <Label htmlFor="tz-zone">Múi giờ hiển thị</Label>
          <select id="tz-zone" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={zoneChoice} onChange={(e) => setZoneChoice(e.target.value)}>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z === "auto" ? "Tự động (trình duyệt)" : z}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tz-date">Ngày (UTC)</Label>
          <select id="tz-date" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)}>
            {DATES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <p className="col-span-2 text-sm" data-testid="tz-current">
          Múi giờ: <b>{zone}</b> · Bây giờ: <span data-testid="tz-now">{formatIn(now, zone, { dateStyle: "short", timeStyle: "short", hour12: false })}</span>
        </p>
      </div>

      {booking && (
        <section aria-label="Lịch hẹn của bạn" className="space-y-2 rounded-xl border border-primary p-4">
          <p data-testid="booking-confirm">
            Đã đặt lịch: {formatIn(Date.parse(booking.utc), zone)} ({zone}) · UTC {formatIn(Date.parse(booking.utc), "UTC")}
          </p>
          <p className="text-sm" data-testid="booking-countdown">
            Còn {duration(Date.parse(booking.utc) - now)}
          </p>
          <Button size="sm" variant="outline" onClick={() => save(null)}>
            Huỷ lịch hẹn
          </Button>
        </section>
      )}

      <ul aria-label="Khung giờ" className="grid grid-cols-2 gap-2">
        {slotsOf(date).map((ms) => {
          const label = formatSlot(ms, zone, dstBug);
          const diff = ms - now;
          // BR-02: khung giờ đã qua không đặt được (BUG-02: vẫn đặt được). BR-03: đóng đặt trước 2 giờ.
          const past = diff <= 0 && !bugs.has("BUG-02");
          const closed = !past && diff > 0 && diff < CUTOFF_MS;
          const state = past ? "Đã qua" : closed ? "Đã đóng đặt" : booking ? "Bạn đã có lịch" : null;
          return (
            <li key={ms} data-testid="slot" data-utc={new Date(ms).toISOString()} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <span data-testid="slot-time">{label}</span>
              {state ? (
                <span className="text-muted-foreground" data-testid="slot-state">
                  {state}
                </span>
              ) : (
                <Button size="sm" aria-label={`Đặt ${label}`} onClick={() => save({ utc: new Date(ms).toISOString(), zone })}>
                  Đặt
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <Button type="button" variant="ghost" size="sm" onClick={() => save(null)} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
