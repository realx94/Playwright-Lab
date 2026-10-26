"use client";

import { useEffect, useState } from "react";
import { useBugs } from "@/lib/labs/use-bugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LOCK_MINUTES,
  SEED_USER,
  lockThreshold,
  validateEmail,
  validatePassword,
} from "@/lib/labs/login-rules";

const KEY = "lab:login";

interface State {
  fails: number;
  lockedUntil: number | null;
  session: { email: string; remember: boolean } | null;
}

const empty: State = { fails: 0, lockedUntil: null, session: null };

function load(): State {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return empty;
  }
}

export function LoginApp() {
  const bugs = useBugs();
  const [state, setState] = useState<State>(empty);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  // Đọc localStorage sau hydrate để tránh lệch SSR.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(load());
    setReady(true);
  }, []);

  function save(next: State) {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setState(empty);
    setErrors({});
    setEmail("");
    setPassword("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password, bugs);
    if (eErr || pErr) return setErrors({ email: eErr ?? undefined, password: pErr ?? undefined });

    if (state.lockedUntil && state.lockedUntil > Date.now()) {
      return setErrors({ form: `Tài khoản bị khoá. Thử lại sau ${LOCK_MINUTES} phút.` });
    }

    if (email === SEED_USER.email && password === SEED_USER.password) {
      setErrors({});
      return save({ fails: 0, lockedUntil: null, session: { email, remember } });
    }

    const fails = state.fails + 1;
    if (fails >= lockThreshold(bugs)) {
      save({ ...state, fails, lockedUntil: Date.now() + LOCK_MINUTES * 60_000 });
      return setErrors({ form: `Tài khoản bị khoá ${LOCK_MINUTES} phút do nhập sai nhiều lần.` });
    }
    save({ ...state, fails });
    setErrors({
      form: bugs.has("BUG-03") && email !== SEED_USER.email
        ? "Email không tồn tại"
        : "Email hoặc mật khẩu không đúng",
    });
  }

  if (!ready) return null;

  if (state.session) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6" data-testid="dashboard">
        <h2 className="text-xl font-semibold">Chào mừng, {state.session.email}</h2>
        <p className="text-sm text-muted-foreground">
          Phiên: {state.session.remember ? "7 ngày" : "phiên hiện tại"}
        </p>
        <Button variant="outline" onClick={() => save({ ...state, session: null })}>
          Đăng xuất
        </Button>
        <Button variant="ghost" onClick={reset} data-testid="reset-data">Reset dữ liệu lab</Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mx-auto max-w-md space-y-4 rounded-xl border p-6"
      aria-label="Đăng nhập"
    >
      <h2 className="text-xl font-semibold">Đăng nhập</h2>
      {errors.form && (
        <Alert variant="destructive" role="alert" data-testid="form-error">
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          data-testid="email"
        />
        {errors.email && <p className="text-sm text-destructive" data-testid="email-error">{errors.email}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          data-testid="password"
        />
        {errors.password && <p className="text-sm text-destructive" data-testid="password-error">{errors.password}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
        <Label htmlFor="remember">Ghi nhớ đăng nhập</Label>
      </div>
      <Button type="submit" className="w-full">Đăng nhập</Button>
      <Button type="button" variant="ghost" className="w-full" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </form>
  );
}
