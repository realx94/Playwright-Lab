"use client";

import { useEffect, useState } from "react";
import { useBugs } from "@/lib/labs/use-bugs";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { describeMirror, mirrorToRealInbox } from "@/lib/byo/mail-delivery";
import {
  MAX_FAILS,
  OTP_KEY,
  OTP_TTL_BUG_MS,
  OTP_TTL_MS,
  REGISTERED,
  RESEND_COOLDOWN_MS,
  RESEND_PER_HOUR,
  emptyOtpState,
  generateOtp,
  isEmail,
  loadJson,
  pushMail,
  pushSms,
  maskPhone,
  PHONES,
  INBOX_KEY,
  SMS_KEY,
  type Channel,
  type OtpState,
} from "@/lib/labs/otp-rules";

type Notice = { kind: "info" | "error"; text: string } | null;

export function OtpApp() {
  const params = useSearchParams();
  const bugs = useBugs();
  const seedParam = params.get("seed");
  const seed = seedParam !== null && !Number.isNaN(Number(seedParam)) ? Number(seedParam) : null;

  const [state, setState] = useState<OtpState>(emptyOtpState);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [now, setNow] = useState(0);
  const [channel, setChannel] = useState<Channel>("email");
  const [realStatus, setRealStatus] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const s = loadJson<OtpState>(OTP_KEY, emptyOtpState);
    setState(s);
    setEmail(s.email);
    setChannel(s.channel ?? "email");
    if (s.email && !s.session && (s.otp || s.sentAt.length)) setStage("code");
    setNow(Date.now());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  function save(next: OtpState) {
    setState(next);
    try {
      localStorage.setItem(OTP_KEY, JSON.stringify(next));
    } catch {}
  }

  function reset() {
    try {
      localStorage.removeItem(OTP_KEY);
      localStorage.removeItem(INBOX_KEY);
      localStorage.removeItem(SMS_KEY);
    } catch {}
    setState(emptyOtpState);
    setStage("email");
    setEmail("");
    setCode("");
    setNotice(null);
    setRealStatus(null);
  }

  const cooldownLeft = Math.max(
    0,
    Math.ceil((RESEND_COOLDOWN_MS - (now - (state.sentAt[state.sentAt.length - 1] ?? 0))) / 1000),
  );

  function sendCode() {
    const t = Date.now();
    if (!isEmail(email)) return setNotice({ kind: "error", text: "Email không hợp lệ" });

    const last = state.sentAt[state.sentAt.length - 1];
    if (last !== undefined && t - last < RESEND_COOLDOWN_MS)
      return setNotice({
        kind: "error",
        text: `Vui lòng đợi ${Math.ceil((RESEND_COOLDOWN_MS - (t - last)) / 1000)} giây để gửi lại`,
      });
    const recent = state.sentAt.filter((x) => t - x < 3_600_000);
    if (recent.length >= RESEND_PER_HOUR)
      return setNotice({ kind: "error", text: "Bạn đã yêu cầu quá nhiều lần. Hãy thử lại sau 1 giờ" });

    const sentAt = [...recent, t];
    if (REGISTERED.includes(email)) {
      const otp = generateOtp(seed === null ? null : seed + sentAt.length);
      if (channel === "sms") {
        // SMS giả: ASCII không dấu để vừa một tin nhắn 160 ký tự
        pushSms({ to: PHONES[email], body: `Ma OTP cua ban la ${otp}. Co hieu luc 5 phut. Khong chia se ma nay.`, sentAt: t });
        setRealStatus(null);
      } else {
        const mail = { to: email, subject: "Mã xác thực đăng nhập", body: `Mã đăng nhập của bạn là ${otp}. Mã có hiệu lực trong 5 phút.` };
        pushMail({ ...mail, sentAt: t });
        // Gửi thêm email thật nếu người học đã bật trong Cài đặt → Dịch vụ của tôi
        void mirrorToRealInbox(mail).then((res) => setRealStatus(res ? describeMirror(res, email) : null));
      }
      save({ ...state, email, otp, prevOtp: state.otp, issuedAt: t, fails: 0, sentAt, channel });
    } else {
      // BR-04: email chưa đăng ký vẫn nhận thông báo trung tính nhưng không có thư nào được gửi
      save({ ...state, email, otp: null, prevOtp: null, sentAt, channel });
    }
    setStage("code");
    setCode("");
    setNotice({ kind: "info", text: channel === "sms" ? "Nếu tài khoản hợp lệ, mã xác thực đã được gửi bằng SMS" : "Nếu email hợp lệ, mã xác thực đã được gửi" });
  }

  function verify() {
    const t = Date.now();
    if (!state.otp) return setNotice({ kind: "error", text: "Mã không hợp lệ hoặc đã hết hạn" });

    const ttl = bugs.has("BUG-02") ? OTP_TTL_BUG_MS : OTP_TTL_MS;
    if (t - state.issuedAt > ttl) {
      save({ ...state, otp: null, prevOtp: null });
      return setNotice({ kind: "error", text: "Mã đã hết hạn, hãy xin mã mới" });
    }

    const matchesOld = bugs.has("BUG-03") && state.prevOtp !== null && code === state.prevOtp;
    if (code === state.otp || matchesOld) {
      save({ ...state, otp: null, prevOtp: null, fails: 0, session: state.email });
      return setNotice(null);
    }

    const fails = state.fails + 1;
    const limit = bugs.has("BUG-01") ? MAX_FAILS + 1 : MAX_FAILS;
    if (fails >= limit) {
      save({ ...state, otp: null, prevOtp: null, fails });
      return setNotice({ kind: "error", text: "Bạn đã nhập sai quá 3 lần. Mã đã bị huỷ, hãy xin mã mới" });
    }
    save({ ...state, fails });
    setNotice({ kind: "error", text: `Mã không đúng. Còn ${limit - fails} lần thử` });
  }

  if (!ready) return null;

  if (state.session)
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6" data-testid="dashboard">
        <h2 className="text-xl font-semibold">Chào mừng, {state.session}</h2>
        <p className="text-sm text-muted-foreground">Bạn đã đăng nhập bằng mã OTP.</p>
        <Button variant="outline" onClick={() => save({ ...state, session: null })}>
          Đăng xuất
        </Button>
        <Button variant="ghost" onClick={reset} data-testid="reset-data">
          Reset dữ liệu lab
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
      <h2 className="text-xl font-semibold">Đăng nhập bằng mã OTP</h2>
      {notice && (
        <Alert variant={notice.kind === "error" ? "destructive" : "default"} role="alert" data-testid="otp-message">
          <AlertDescription>{notice.text}</AlertDescription>
        </Alert>
      )}

      {stage === "email" ? (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="otp-email">Email</Label>
            <Input id="otp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="otp-channel">Nhận mã qua</Label>
            <select
              id="otp-channel"
              className="h-8 w-full rounded-lg border bg-background px-2 text-sm"
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <Button type="submit" className="w-full">
            Gửi mã
          </Button>
        </form>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            {state.channel === "sms" && PHONES[state.email] ? (
              <>
                Mã đã gửi bằng SMS tới số <b data-testid="otp-phone-shown">{maskPhone(PHONES[state.email])}</b>.{" "}
                <a href="/lab/sms" target="_blank" rel="noopener" className="underline">
                  Mở hộp tin nhắn
                </a>
              </>
            ) : (
              <>
                Mã đã gửi tới <b data-testid="otp-email-shown">{state.email}</b>.{" "}
                <a href="/lab/inbox" target="_blank" rel="noopener" className="underline">
                  Mở hộp thư
                </a>
              </>
            )}
          </p>
          {realStatus && (
            <p className="text-xs text-muted-foreground" data-testid="real-mail-status">
              {realStatus}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="otp-code">Mã OTP</Label>
            <Input
              id="otp-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Xác nhận
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Button type="button" variant="outline" size="sm" onClick={sendCode} disabled={cooldownLeft > 0}>
              Gửi lại mã
            </Button>
            <span data-testid="cooldown" className="text-muted-foreground">
              {cooldownLeft > 0 ? `Gửi lại sau ${cooldownLeft}s` : "Có thể gửi lại"}
            </span>
          </div>
        </form>
      )}

      <Button type="button" variant="ghost" className="w-full" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
