"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  BANK_KEY,
  MAX_OTP_FAILS,
  OTP_TTL_MS,
  RECIPIENTS,
  clock,
  dayOf,
  emptyBank,
  feeOf,
  loadBank,
  money,
  newOtp,
  validateTransfer,
  type BankState,
} from "@/lib/labs/bank-rules";

type Step = "form" | "confirm" | "otp" | "done";

/** Chuyển tiền nhiều bước: nhập thông tin, xác nhận, OTP, kết quả; có phí, hạn mức ngày và OTP hết hạn. */
export function BankApp() {
  const bugs = useBugs();
  const [bank, setBank] = useState<BankState>(emptyBank());
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState({ code: "", issuedAt: 0 });
  const [otpInput, setOtpInput] = useState("");
  const fails = useRef(0);
  const [lastTx, setLastTx] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setBank(loadBank());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function save(next: BankState) {
    setBank(next);
    try {
      localStorage.setItem(BANK_KEY, JSON.stringify(next));
    } catch {}
  }

  const amt = Number(amount);
  const fee = feeOf(amt, bugs);

  function toConfirm(e: React.FormEvent) {
    e.preventDefault();
    const err = validateTransfer(account, amount, bank, clock(), bugs);
    if (err) return setError(err);
    setError(null);
    setStep("confirm");
  }

  function sendOtp() {
    setOtp({ code: newOtp(), issuedAt: clock() });
    setOtpInput("");
    setError(null);
    fails.current = 0;
    setStep("otp");
  }

  function backToStart(message: string | null) {
    setStep("form");
    setError(message);
    setOtpInput("");
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    const now = clock();
    if (now - otp.issuedAt > OTP_TTL_MS) return setError("Mã OTP đã hết hạn, hãy gửi lại");
    if (otpInput !== otp.code) {
      fails.current += 1;
      // BR-05: sai 3 lần thì huỷ giao dịch. BUG-03: không huỷ.
      if (fails.current >= MAX_OTP_FAILS && !bugs.has("BUG-03")) return backToStart("Nhập sai OTP quá 3 lần, giao dịch đã bị huỷ");
      return setError(`Mã OTP không đúng (${fails.current}/${MAX_OTP_FAILS})`);
    }
    const id = `TX${String(bank.counter + 1).padStart(4, "0")}`;
    const day = dayOf(now);
    save({
      balance: bank.balance - amt - fee,
      dayKey: day,
      dayTotal: (bank.dayKey === day ? bank.dayTotal : 0) + amt,
      counter: bank.counter + 1,
      history: [{ id, to: account, amount: amt, fee }, ...bank.history].slice(0, 10),
    });
    setLastTx(id);
    setError(null);
    setStep("done");
  }

  function again() {
    setAccount("");
    setAmount("");
    setNote("");
    setError(null);
    setStep("form");
  }

  function reset() {
    try {
      localStorage.removeItem(BANK_KEY);
    } catch {}
    setBank(emptyBank());
    again();
  }

  if (!ready) return null;

  const errEl = error && (
    <p role="alert" className="text-sm text-destructive" data-testid="transfer-error">
      {error}
    </p>
  );

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">Tài khoản nguồn 1122334455</p>
        <p className="text-xl font-semibold" data-testid="balance">
          {money(bank.balance)}
        </p>
      </div>

      {step === "form" && (
        <form onSubmit={toConfirm} noValidate aria-label="Thông tin chuyển tiền" className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Bước 1 · Thông tin chuyển tiền</h2>
          <div className="space-y-1.5">
            <Label htmlFor="tx-account">Số tài khoản nhận</Label>
            <Input id="tx-account" inputMode="numeric" value={account} onChange={(e) => setAccount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tx-amount">Số tiền (₫)</Label>
            <Input id="tx-amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tx-note">Nội dung chuyển khoản</Label>
            <Input id="tx-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {errEl}
          <Button type="submit">Tiếp tục</Button>
        </form>
      )}

      {step === "confirm" && (
        <section aria-label="Xác nhận chuyển tiền" className="space-y-2 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Bước 2 · Xác nhận</h2>
          <p data-testid="confirm-name">Người nhận: {RECIPIENTS[account]}</p>
          <p data-testid="confirm-amount">Số tiền: {money(amt)}</p>
          <p data-testid="confirm-fee">Phí: {money(fee)}</p>
          <p data-testid="confirm-total" className="font-medium">
            Tổng trừ: {money(amt + fee)}
          </p>
          {note && <p className="text-sm text-muted-foreground">Nội dung: {note}</p>}
          <div className="flex gap-2 pt-2">
            <Button onClick={sendOtp}>Xác nhận</Button>
            <Button variant="outline" onClick={() => setStep("form")}>
              Quay lại
            </Button>
          </div>
        </section>
      )}

      {step === "otp" && (
        <form onSubmit={verify} noValidate aria-label="Xác thực OTP" className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Bước 3 · Xác thực OTP</h2>
          <p className="text-sm text-muted-foreground">
            Mã OTP (giả lập, hiệu lực 60 giây): <b className="font-mono" data-testid="otp-hint">{otp.code}</b>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="tx-otp">Mã OTP</Label>
            <Input id="tx-otp" inputMode="numeric" autoComplete="off" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} />
          </div>
          {errEl}
          <div className="flex gap-2">
            <Button type="submit">Xác thực</Button>
            <Button type="button" variant="outline" onClick={sendOtp}>
              Gửi lại OTP
            </Button>
          </div>
        </form>
      )}

      {step === "done" && (
        <section aria-label="Kết quả" className="space-y-2 rounded-xl border border-primary p-5">
          <h2 className="text-lg font-semibold" data-testid="txn-success">
            Giao dịch thành công
          </h2>
          <p data-testid="txn-id">Mã giao dịch: {lastTx}</p>
          <Button onClick={again}>Chuyển tiếp</Button>
        </section>
      )}

      <section aria-label="Lịch sử giao dịch" className="rounded-xl border p-5">
        <h2 className="mb-2 text-lg font-semibold">Lịch sử giao dịch</h2>
        {bank.history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có giao dịch.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {bank.history.map((h) => (
              <li key={h.id} data-testid="history-row">
                {h.id} · tới {h.to} · {money(h.amount)} · phí {money(h.fee)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
