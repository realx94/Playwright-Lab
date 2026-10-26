"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import { CAPTCHA_TOKEN } from "@/lib/labs/guard-rules";

const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const makeChallenge = () => Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

/** CAPTCHA giả: gõ lại chuỗi ký tự. Chế độ ?captcha=test tự động đạt (giống khoá test của CAPTCHA thật). */
function Captcha({ testMode, onToken }: { testMode: boolean; onToken: (t: string | null) => void }) {
  const [challenge, setChallenge] = useState("");
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "bad">(testMode ? "ok" : "idle");
  const sent = useRef(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setChallenge(makeChallenge());
    if (testMode && !sent.current) {
      sent.current = true;
      onToken(CAPTCHA_TOKEN);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (testMode)
    return (
      <p className="rounded-md border p-3 text-sm" data-testid="captcha-status">
        CAPTCHA: chế độ test, tự động đạt
      </p>
    );

  return (
    <fieldset className="space-y-2 rounded-md border p-3" aria-label="CAPTCHA">
      <p className="text-sm">
        Nhập các ký tự: <b className="font-mono text-lg tracking-widest" data-testid="captcha-challenge">{challenge}</b>
      </p>
      <div className="flex gap-2">
        <Input aria-label="Ký tự CAPTCHA" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const ok = answer.trim().toUpperCase() === challenge;
            setState(ok ? "ok" : "bad");
            onToken(ok ? CAPTCHA_TOKEN : null);
            if (!ok) {
              setChallenge(makeChallenge());
              setAnswer("");
            }
          }}
        >
          Xác nhận CAPTCHA
        </Button>
      </div>
      <p className="text-sm" role="status" data-testid="captcha-status">
        {state === "ok" ? "CAPTCHA: đã xác nhận" : state === "bad" ? "CAPTCHA: sai, thử lại" : ""}
      </p>
    </fieldset>
  );
}

export function GuardApp() {
  const params = useSearchParams();
  const bugs = useBugs();
  const testMode = params.get("captcha") === "test";
  const [email, setEmail] = useState("user@lab.dev");
  const [password, setPassword] = useState("");
  const [captchaOn, setCaptchaOn] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(0);
  const [user, setUser] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const locked = secondsLeft > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await login();
    } finally {
      setPending(false);
    }
  }

  async function login() {
    const q = [...bugs].length ? `?bugs=${[...bugs].join(",")}` : "";
    const res = await fetch("/api/lab/guard/login" + q, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, captcha: captchaToken }),
    });
    const body = await res.json();
    if (res.ok) {
      setUser(body.email);
      setMessage(null);
      setCaptchaOn(false);
      return;
    }
    if (res.status === 429) {
      setLockedUntil(Date.now() + (body.retryAfter ?? 5) * 1000);
      setNow(Date.now());
      setMessage({ kind: "error", text: body.message });
    } else if (res.status === 403 && body.code === "captcha_required") {
      setCaptchaOn(true);
      setMessage({ kind: "error", text: body.message });
    } else {
      if (body.captchaRequired) setCaptchaOn(true);
      setMessage({ kind: "error", text: `${body.message}. Còn ${body.attemptsLeft} lần thử` });
    }
    setPassword("");
  }

  async function reset() {
    await fetch("/api/lab/reset", { method: "POST" });
    setUser(null);
    setMessage(null);
    setCaptchaOn(false);
    setCaptchaToken(null);
    setLockedUntil(0);
    setPassword("");
  }

  if (user)
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold" data-testid="guard-welcome">
          Đăng nhập thành công: {user}
        </h2>
        <Button variant="outline" onClick={() => setUser(null)}>
          Đăng xuất
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
          Reset dữ liệu lab
        </Button>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate aria-label="Đăng nhập an toàn" className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Đăng nhập</h2>
      <div className="space-y-1.5">
        <Label htmlFor="guard-email">Email</Label>
        <Input id="guard-email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="guard-password">Mật khẩu</Label>
        <Input id="guard-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {captchaOn && <Captcha testMode={testMode} onToken={setCaptchaToken} />}
      {message && (
        <p role="alert" className={message.kind === "error" ? "text-sm text-destructive" : "text-sm"} data-testid="guard-message">
          {message.text}
        </p>
      )}
      {locked && (
        <p className="text-sm" data-testid="guard-countdown">
          Thử lại sau {secondsLeft} giây
        </p>
      )}
      <Button type="submit" className="w-full" disabled={locked || pending}>
        Đăng nhập
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </form>
  );
}
