"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  CLINIC_KEY,
  DOCTORS,
  SLOT_STARTS,
  clock,
  loadClinic,
  slotState,
  validateAppointment,
  type Appointment,
} from "@/lib/labs/clinic-rules";

const MAX_PER_PHONE = 3;

/** Đặt lịch khám: chọn bác sĩ, ngày, khung giờ; kiểm tra thông tin; huỷ lịch theo quy tắc 24 giờ. */
export function ClinicApp() {
  const bugs = useBugs();
  const [list, setList] = useState<Appointment[]>([]);
  const [ready, setReady] = useState(false);
  const [doctor, setDoctor] = useState(DOCTORS[0].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setList(loadClinic());
    setNow(clock());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = setInterval(() => setNow(clock()), 500);
    return () => clearInterval(t);
  }, []);

  function save(next: Appointment[]) {
    setList(next);
    try {
      localStorage.setItem(CLINIC_KEY, JSON.stringify(next));
    } catch {}
  }

  const doc = DOCTORS.find((d) => d.id === doctor)!;
  // BR-01: khung đã có hẹn thì kín. BUG-01: bỏ qua các lịch đã đặt trong hệ thống.
  const taken = date
    ? [...(doc.booked[date] ?? []), ...(bugs.has("BUG-01") ? [] : list.filter((a) => a.doctor === doctor && a.date === date).map((a) => a.time))]
    : [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const errs = validateAppointment({ name, phone, reason, date, time }, clock(), bugs);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (slotState(date, time, clock(), taken) !== "free") return setErrors({ time: "Khung giờ không còn khả dụng" });
    if (list.filter((a) => a.phone === phone).length >= MAX_PER_PHONE) return setMessage({ kind: "error", text: `Mỗi số điện thoại chỉ có tối đa ${MAX_PER_PHONE} lịch` });
    const id = `KH${String(list.length + 1).padStart(4, "0")}`;
    save([...list, { id, doctor, date, time, name: name.trim(), phone, reason: reason.trim() }]);
    setMessage({ kind: "success", text: `Đặt lịch thành công. Mã lịch hẹn ${id}` });
    setTime("");
    setReason("");
  }

  function cancel(a: Appointment) {
    // BR-05: chỉ huỷ khi còn hơn 24 giờ (đúng 24 giờ vẫn được huỷ)
    const hours = (Date.parse(`${a.date}T${a.time}:00Z`) - clock()) / 3_600_000;
    if (hours < 24) return setMessage({ kind: "error", text: "Không thể huỷ lịch trong vòng 24 giờ trước giờ khám" });
    save(list.filter((x) => x.id !== a.id));
    setMessage({ kind: "success", text: `Đã huỷ lịch ${a.id}` });
  }

  function reset() {
    try {
      localStorage.removeItem(CLINIC_KEY);
    } catch {}
    setList([]);
    setErrors({});
    setMessage(null);
    setTime("");
  }

  if (!ready) return null;

  const err = (k: string) =>
    errors[k] && (
      <p role="alert" className="text-sm text-destructive" data-testid={`error-${k}`}>
        {errors[k]}
      </p>
    );

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <form onSubmit={submit} noValidate aria-label="Đặt lịch khám" className="space-y-4 rounded-xl border p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cl-doctor">Bác sĩ</Label>
            <select id="cl-doctor" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={doctor} onChange={(e) => { setDoctor(e.target.value); setTime(""); }}>
              {DOCTORS.map((d) => (
                <option key={d.id} value={d.id}>{`${d.name} — ${d.dept}`}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cl-date">Ngày khám</Label>
            <Input id="cl-date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} />
            {err("date")}
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Khung giờ</legend>
          <div className="grid grid-cols-4 gap-2">
            {SLOT_STARTS.map((s) => {
              const st = date ? slotState(date, s, now, taken) : "free";
              return (
                <button
                  key={s}
                  type="button"
                  data-testid={`slot-${s}`}
                  data-state={!date ? "free" : st}
                  aria-pressed={time === s}
                  aria-label={`Giờ ${s}`}
                  disabled={!date || st !== "free"}
                  onClick={() => setTime(s)}
                  className={"rounded-md border px-2 py-1 text-sm disabled:opacity-40 " + (time === s ? "bg-primary text-primary-foreground" : "")}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {err("time")}
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="cl-name">Họ tên bệnh nhân</Label>
          <Input id="cl-name" value={name} onChange={(e) => setName(e.target.value)} />
          {err("name")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cl-phone">Số điện thoại</Label>
          <Input id="cl-phone" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {err("phone")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cl-reason">Lý do khám</Label>
          <textarea id="cl-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-lg border bg-transparent px-2.5 py-1 text-sm" />
          <p className="text-xs text-muted-foreground" data-testid="reason-count">
            {reason.length}/200
          </p>
          {err("reason")}
        </div>

        {message && (
          <p role="alert" className={message.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700 dark:text-green-400"} data-testid="clinic-message">
            {message.text}
          </p>
        )}
        <Button type="submit">Đặt lịch</Button>
      </form>

      <section aria-label="Lịch hẹn của bạn" className="space-y-2 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Lịch hẹn ({list.length})</h2>
        {list.length === 0 && <p className="text-sm text-muted-foreground">Chưa có lịch hẹn.</p>}
        <ul className="space-y-2">
          {list.map((a) => (
            <li key={a.id} data-testid="appointment" className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <span>
                <b>{a.id}</b> · {DOCTORS.find((d) => d.id === a.doctor)?.name} · {a.date} {a.time} · {a.name}
              </span>
              <Button size="sm" variant="outline" aria-label={`Huỷ ${a.id}`} onClick={() => cancel(a)}>
                Huỷ
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
