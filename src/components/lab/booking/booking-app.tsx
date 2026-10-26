"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  BOOKING_KEY,
  COLS,
  HOLD_MS,
  MAX_SEATS,
  PRICE,
  ROWS,
  SESSION_KEY,
  SHOWTIMES,
  clock,
  emptyBooking,
  isVip,
  load,
  mmss,
  money,
  purge,
  write,
  type BookingState,
} from "@/lib/labs/booking-rules";

/** Đặt vé xem phim: sơ đồ ghế, giữ chỗ 5 phút, thanh toán; trạng thái dùng chung giữa các tab qua localStorage. */
export function BookingApp() {
  const bugs = useBugs();
  const [show, setShow] = useState(SHOWTIMES[0].id);
  const [state, setState] = useState<BookingState>(emptyBooking());
  const [selected, setSelected] = useState<string[]>([]);
  const [mine, setMine] = useState<{ show: string; seats: string[]; until: number } | null>(null);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [ticket, setTicket] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState("");

  const sync = useCallback(() => {
    const t = clock();
    const s = purge(load(), t);
    setState(s);
    setNow(t);
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `u-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    setMe(id);
    sync();
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = setInterval(sync, 500);
    const onStorage = (e: StorageEvent) => e.key === BOOKING_KEY && sync();
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(t);
      window.removeEventListener("storage", onStorage);
    };
  }, [sync]);

  const showtime = SHOWTIMES.find((s) => s.id === show)!;
  const bookedSeats = new Set([...showtime.booked, ...(state.booked[show] ?? [])]);
  const holds = state.holds[show] ?? {};
  const holdingHere = mine?.show === show;

  function seatState(seat: string): "booked" | "held" | "mine" | "selected" | "free" {
    if (bookedSeats.has(seat)) return "booked";
    if (holds[seat]) return holds[seat].by === me ? "mine" : "held";
    return selected.includes(seat) ? "selected" : "free";
  }

  const maxSeats = MAX_SEATS + (bugs.has("BUG-03") ? 1 : 0);
  const seatPrice = (seat: string) => (isVip(seat) && !bugs.has("BUG-01") ? PRICE.vip : PRICE.standard);
  const chosen = holdingHere ? mine!.seats : selected;
  const total = chosen.reduce((s, x) => s + seatPrice(x), 0);
  const free = ROWS.flatMap((r) => COLS.map((c) => `${r}${c}`)).filter((s) => !bookedSeats.has(s) && !holds[s]);

  function toggle(seat: string) {
    setMessage(null);
    if (selected.includes(seat)) return setSelected(selected.filter((x) => x !== seat));
    if (selected.length >= maxSeats) return setMessage({ kind: "error", text: `Tối đa ${MAX_SEATS} ghế mỗi lần đặt` });
    setSelected([...selected, seat]);
  }

  function hold() {
    if (selected.length === 0) return setMessage({ kind: "error", text: "Hãy chọn ít nhất một ghế" });
    const t = clock();
    const s = purge(load(), t);
    const taken = selected.find((x) => s.holds[show]?.[x] || bookedSeats.has(x));
    if (taken) {
      setSelected(selected.filter((x) => x !== taken));
      return setMessage({ kind: "error", text: `Ghế ${taken} vừa được người khác giữ hoặc đặt` });
    }
    const until = t + HOLD_MS;
    const mineHolds = Object.fromEntries(selected.map((x) => [x, { by: me, until }]));
    write({ ...s, holds: { ...s.holds, [show]: { ...(s.holds[show] ?? {}), ...mineHolds } } });
    setMine({ show, seats: selected, until });
    setSelected([]);
    setMessage(null);
    sync();
  }

  function release(text: string | null) {
    if (!mine) return;
    const s = load();
    const left = Object.fromEntries(Object.entries(s.holds[mine.show] ?? {}).filter(([seat]) => !mine.seats.includes(seat)));
    write({ ...s, holds: { ...s.holds, [mine.show]: left } });
    setMine(null);
    setMessage(text ? { kind: "error", text } : null);
    sync();
  }

  function pay() {
    if (!mine) return;
    // BR-04: quá hạn giữ chỗ thì không thanh toán được. BUG-02: vẫn thanh toán.
    if (clock() > mine.until && !bugs.has("BUG-02")) return release("Hết thời gian giữ chỗ, ghế đã được nhả");
    const s = purge(load(), clock());
    const left = Object.fromEntries(Object.entries(s.holds[mine.show] ?? {}).filter(([seat]) => !mine.seats.includes(seat)));
    const n = s.tickets + 1;
    write({
      booked: { ...s.booked, [mine.show]: [...(s.booked[mine.show] ?? []), ...mine.seats] },
      holds: { ...s.holds, [mine.show]: left },
      tickets: n,
    });
    setTicket(`VE${String(n).padStart(4, "0")}`);
    setMine(null);
    setMessage({ kind: "success", text: "Đặt vé thành công" });
    sync();
  }

  function reset() {
    try {
      localStorage.removeItem(BOOKING_KEY);
    } catch {}
    setMine(null);
    setSelected([]);
    setTicket(null);
    setMessage(null);
    sync();
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="space-y-1.5 rounded-xl border p-4">
        <Label htmlFor="show-select">Suất chiếu</Label>
        <select
          id="show-select"
          className="h-8 w-full rounded-lg border bg-background px-2 text-sm"
          value={show}
          onChange={(e) => {
            setShow(e.target.value);
            setSelected([]);
            setMessage(null);
          }}
        >
          {SHOWTIMES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">Ghế thường (A–C) {money(PRICE.standard)}, ghế VIP (D–E) {money(PRICE.vip)}.</p>
      </div>

      {free.length === 0 && holdingHere === false && (
        <p role="status" className="rounded-xl border border-dashed p-4 text-sm" data-testid="sold-out">
          Suất chiếu đã hết vé
        </p>
      )}

      <div role="group" aria-label="Sơ đồ ghế" className="space-y-2 rounded-xl border p-4">
        <p className="text-center text-xs text-muted-foreground">MÀN HÌNH</p>
        {ROWS.map((r) => (
          <div key={r} className="flex justify-center gap-2">
            {COLS.map((c) => {
              const seat = `${r}${c}`;
              const st = seatState(seat);
              const disabled = st === "booked" || st === "held" || holdingHere;
              return (
                <button
                  key={seat}
                  type="button"
                  data-testid={`seat-${seat}`}
                  data-state={st}
                  aria-label={`Ghế ${seat}`}
                  aria-pressed={st === "selected" || st === "mine"}
                  disabled={disabled && st !== "mine"}
                  onClick={() => toggle(seat)}
                  className={
                    "size-9 rounded-md border text-xs font-medium " +
                    (st === "booked"
                      ? "bg-muted text-muted-foreground line-through"
                      : st === "held"
                        ? "bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-50"
                        : st === "selected" || st === "mine"
                          ? "bg-primary text-primary-foreground"
                          : isVip(seat)
                            ? "border-amber-500"
                            : "")
                  }
                >
                  {seat}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <section aria-label="Đơn đặt vé" className="space-y-2 rounded-xl border p-4">
        <p className="text-sm" data-testid="chosen">
          Ghế đã chọn: {chosen.length ? chosen.join(", ") : "chưa có"}
        </p>
        <p className="font-medium" data-testid="total">
          Tổng: {money(total)}
        </p>
        {mine && (
          <p className="text-sm" data-testid="hold-countdown">
            Giữ chỗ còn {mmss(mine.until - now)}
          </p>
        )}
        {message && (
          <p role="alert" className={message.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid="booking-message">
            {message.text}
          </p>
        )}
        {ticket && <p data-testid="ticket-code">Mã vé: {ticket}</p>}
        <div className="flex gap-2">
          {!mine ? (
            <Button onClick={hold}>Giữ chỗ</Button>
          ) : (
            <>
              <Button onClick={pay}>Thanh toán</Button>
              <Button variant="outline" onClick={() => release(null)}>
                Huỷ giữ chỗ
              </Button>
            </>
          )}
        </div>
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
