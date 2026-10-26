"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  ACCOUNT,
  MAX_FAILS,
  PASSWORD,
  TOTP_KEY,
  emptyTotpState,
  loadTotp,
  makeRecoveryCodes,
  matchTotp,
  randomSecret,
  type TotpState,
} from "@/lib/labs/totp-rules";

const SIX_DIGITS = /^\d{6}$/;

/** Đăng nhập hai bước bằng TOTP (RFC 6238) và mã khôi phục dùng một lần. */
export function TotpApp() {
  const bugs = useBugs();
  const [state, setState] = useState<TotpState>(emptyTotpState);
  const [ready, setReady] = useState(false);
  const [setup, setSetup] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setState(loadTotp());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function save(next: TotpState) {
    setState(next);
    try {
      localStorage.setItem(TOTP_KEY, JSON.stringify(next));
    } catch {}
  }

  function reset() {
    try {
      localStorage.removeItem(TOTP_KEY);
    } catch {}
    setState(emptyTotpState);
    setSetup(false);
    setUseRecovery(false);
    setPassword("");
    setCode("");
    setRecoveryInput("");
    setError(null);
    setInfo(null);
  }

  function startSetup() {
    save({ ...emptyTotpState, secret: randomSecret(), phase: "in" });
    setSetup(true);
    setError(null);
    setCode("");
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    if (!SIX_DIGITS.test(code)) return setError("Mã gồm đúng 6 chữ số");
    const step = await matchTotp(state.secret, code, Date.now(), bugs.has("BUG-01") ? 2 : 1);
    if (step === null) return setError("Mã không đúng");
    save({ ...state, enabled: true, recovery: makeRecoveryCodes() });
    setSetup(false);
    setCode("");
    setError(null);
    setInfo("Đã bật 2FA. Hãy lưu các mã khôi phục bên dưới.");
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== PASSWORD) return setError("Sai mật khẩu");
    save({ ...state, phase: "password" });
    setError(null);
    setPassword("");
  }

  function fail(msg: string, current: TotpState) {
    const fails = current.fails + 1;
    const locked = fails >= MAX_FAILS;
    save({ ...current, fails, locked });
    setError(locked ? "Tài khoản đã bị khóa do nhập sai quá 3 lần" : msg);
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (state.locked) return setError("Tài khoản đã bị khóa do nhập sai quá 3 lần");
    if (!SIX_DIGITS.test(code)) return setError("Mã gồm đúng 6 chữ số");
    // BR-02: lệch ±1 chu kỳ. BUG-01: chấp nhận lệch ±2.
    const step = await matchTotp(state.secret, code, Date.now(), bugs.has("BUG-01") ? 2 : 1);
    if (step === null) return fail("Mã không đúng", state);
    // BR-05: mỗi mã chỉ dùng một lần. BUG-03: bỏ kiểm tra dùng lại.
    if (step <= state.lastStep && !bugs.has("BUG-03")) return fail("Mã đã được sử dụng", state);
    save({ ...state, lastStep: Math.max(step, state.lastStep), fails: 0, phase: "in" });
    setCode("");
    setError(null);
  }

  function submitRecovery(e: React.FormEvent) {
    e.preventDefault();
    if (state.locked) return setError("Tài khoản đã bị khóa do nhập sai quá 3 lần");
    const value = recoveryInput.trim().toUpperCase();
    const item = state.recovery.find((r) => r.code === value);
    if (!item) return fail("Mã khôi phục không hợp lệ", state);
    // BR-03: mỗi mã khôi phục dùng một lần. BUG-02: không đánh dấu đã dùng.
    if (item.used) return fail("Mã khôi phục đã được sử dụng", state);
    const recovery = bugs.has("BUG-02") ? state.recovery : state.recovery.map((r) => (r.code === value ? { ...r, used: true } : r));
    save({ ...state, recovery, fails: 0, phase: "in" });
    setRecoveryInput("");
    setError(null);
  }

  function logout() {
    save({ ...state, phase: "out" });
    setUseRecovery(false);
    setInfo(null);
    setError(null);
  }

  if (!ready) return null;

  const errorEl = error && (
    <p role="alert" className="text-sm text-destructive" data-testid="totp-error">
      {error}
    </p>
  );
  const resetBtn = (
    <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
      Reset dữ liệu lab
    </Button>
  );

  // Đang thiết lập 2FA
  if (setup && !state.enabled)
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Bật xác thực hai bước</h2>
        <p className="text-sm text-muted-foreground">
          Thêm khoá này vào ứng dụng xác thực (Google Authenticator, Authy…) hoặc tự tính mã TOTP trong test.
        </p>
        <p className="rounded-md bg-muted px-3 py-2 font-mono text-sm tracking-wider" data-testid="totp-secret">
          {state.secret}
        </p>
        <form onSubmit={confirmSetup} noValidate aria-label="Xác nhận bật 2FA" className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="setup-code">Mã xác nhận</Label>
            <Input id="setup-code" inputMode="numeric" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          {errorEl}
          <Button type="submit">Xác nhận</Button>
        </form>
        {resetBtn}
      </div>
    );

  // Đã đăng nhập
  if (state.phase === "in")
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold" data-testid="totp-welcome">
          Xin chào {ACCOUNT}
        </h2>
        <p className="text-sm" data-testid="totp-status">
          2FA: {state.enabled ? "Đã bật" : "Chưa bật"}
        </p>
        {info && (
          <p role="status" className="text-sm text-muted-foreground">
            {info}
          </p>
        )}
        {state.enabled && (
          <section aria-label="Mã khôi phục" className="space-y-2">
            <h3 className="text-sm font-medium">Mã khôi phục (mỗi mã dùng một lần)</h3>
            <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
              {state.recovery.map((r) => (
                <li key={r.code} data-testid="recovery-code" data-used={r.used} className={r.used ? "line-through opacity-60" : ""}>
                  {r.code}
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex flex-wrap gap-2">
          {!state.enabled && <Button onClick={startSetup}>Bật 2FA</Button>}
          <Button variant="outline" onClick={logout}>
            Đăng xuất
          </Button>
          {resetBtn}
        </div>
      </div>
    );

  // Chưa có 2FA và chưa đăng nhập: vào thẳng để bật 2FA
  if (!state.enabled)
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Tài khoản {ACCOUNT}</h2>
        <p className="text-sm text-muted-foreground">Tài khoản chưa bật xác thực hai bước.</p>
        <Button onClick={startSetup}>Bật 2FA</Button>
        {resetBtn}
      </div>
    );

  // Bước 2: nhập mã
  if (state.phase === "password")
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Xác thực hai bước</h2>
        {!useRecovery ? (
          <form onSubmit={submitCode} noValidate aria-label="Nhập mã xác thực" className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="totp-code">Mã xác thực</Label>
              <Input id="totp-code" inputMode="numeric" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            {errorEl}
            <Button type="submit">Xác nhận</Button>
          </form>
        ) : (
          <form onSubmit={submitRecovery} noValidate aria-label="Nhập mã khôi phục" className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="recovery-input">Mã khôi phục</Label>
              <Input id="recovery-input" autoComplete="off" value={recoveryInput} onChange={(e) => setRecoveryInput(e.target.value)} />
            </div>
            {errorEl}
            <Button type="submit">Dùng mã khôi phục</Button>
          </form>
        )}
        <Button
          type="button"
          variant="link"
          className="px-0"
          onClick={() => {
            setUseRecovery(!useRecovery);
            setError(null);
          }}
        >
          {useRecovery ? "Dùng mã từ ứng dụng xác thực" : "Dùng mã khôi phục"}
        </Button>
        {resetBtn}
      </div>
    );

  // Bước 1: mật khẩu
  return (
    <form onSubmit={submitPassword} noValidate aria-label="Đăng nhập" className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Đăng nhập</h2>
      <p className="text-sm text-muted-foreground">
        Tài khoản <code>{ACCOUNT}</code>, mật khẩu <code>{PASSWORD}</code>.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="totp-password">Mật khẩu</Label>
        <Input id="totp-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {errorEl}
      <Button type="submit" className="w-full">
        Tiếp tục
      </Button>
      {resetBtn}
    </form>
  );
}
