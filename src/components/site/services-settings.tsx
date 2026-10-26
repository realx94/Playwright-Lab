"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  clearConfig,
  describeMirror,
  emptyConfig,
  loadConfig,
  maskKey,
  saveConfig,
  sendViaProxy,
  type ResendConfig,
} from "@/lib/byo/mail-delivery";
import { DEFAULT_FROM, TEST_ACCOUNT_EMAIL, isResendKey } from "@/lib/byo/resend";

type Status = "none" | "saved" | "ok" | "error";

const STATUS_LABEL: Record<Status, string> = {
  none: "Chưa cấu hình",
  saved: "Đã lưu, chưa kiểm tra",
  ok: "Đã kết nối",
  error: "Lỗi",
};

/** Trang Cài đặt → Dịch vụ của tôi: hiện có Resend (email thật). Khoá chỉ nằm trong trình duyệt. */
export function ServicesSettings() {
  const [cfg, setCfg] = useState<ResendConfig>(emptyConfig);
  const [ready, setReady] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<Status>("none");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const c = loadConfig();
    setCfg(c);
    setStatus(c.key ? "saved" : "none");
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function update(next: ResendConfig) {
    setCfg(next);
    saveConfig(next);
    setStatus(next.key ? "saved" : "none");
    setMessage(null);
  }

  async function test() {
    if (!isResendKey(cfg.key)) {
      setStatus("error");
      return setMessage("API key phải bắt đầu bằng re_ (ví dụ re_xxxxxxxx)");
    }
    setBusy(true);
    const r = await sendViaProxy(cfg, {
      to: to.trim(),
      subject: "Playwright Lab: email thử",
      text: "Đây là email thử từ trang Cài đặt của Playwright Lab. Nếu bạn đọc được thư này, cấu hình đã đúng.",
    });
    setBusy(false);
    setStatus(r.ok ? "ok" : "error");
    setMessage(r.ok ? describeMirror(r, to.trim()) : r.message);
  }

  function remove() {
    clearConfig();
    setCfg(emptyConfig);
    setStatus("none");
    setMessage("Đã xoá khoá khỏi trình duyệt");
    setTo("");
  }

  if (!ready) return null;

  const envText = [
    "# Dán vào file .env của starter repo (file này đã được .gitignore, đừng commit)",
    `RESEND_API_KEY=${cfg.key || "re_..."}`,
    `MAIL_FROM=${cfg.from || DEFAULT_FROM}`,
  ].join("\n");

  return (
    <div className="space-y-6">
      <section aria-label="Resend" className="space-y-4 rounded-xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Email thật qua Resend</h2>
          <Badge variant={status === "error" ? "destructive" : "secondary"} data-testid="resend-status">
            {STATUS_LABEL[status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Khi bật, email mà các lab OTP và email giao dịch “gửi” sẽ được gửi thêm qua tài khoản Resend của bạn. Hộp thư giả vẫn luôn có thư nên test không phụ thuộc mạng.
          Khoá chỉ lưu trong trình duyệt này, đi kèm từng request tới proxy và không được lưu hay ghi log ở server.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="resend-key">Resend API key</Label>
          <div className="flex gap-2">
            <Input
              id="resend-key"
              type={reveal ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              value={cfg.key}
              onChange={(e) => update({ ...cfg, key: e.target.value.trim() })}
            />
            <Button type="button" variant="outline" onClick={() => setReveal((v) => !v)} aria-pressed={reveal}>
              {reveal ? "Ẩn khoá" : "Hiện khoá"}
            </Button>
          </div>
          {cfg.key && (
            <p className="text-xs text-muted-foreground" data-testid="resend-masked">
              Khoá đang lưu: {maskKey(cfg.key)}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resend-from">Địa chỉ gửi (From)</Label>
          <Input id="resend-from" placeholder={DEFAULT_FROM} value={cfg.from} onChange={(e) => update({ ...cfg, from: e.target.value.trim() })} />
          <p className="text-xs text-muted-foreground">
            Để trống thì dùng {DEFAULT_FROM}; địa chỉ này chỉ gửi được tới email chủ tài khoản Resend của bạn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="resend-enabled" checked={cfg.enabled} onCheckedChange={(v) => update({ ...cfg, enabled: v })} aria-label="Gửi email thật khi lab gửi thư" />
          <Label htmlFor="resend-enabled">Gửi email thật khi lab gửi thư</Label>
        </div>

        <div className="space-y-1.5 border-t pt-4">
          <Label htmlFor="resend-to">Gửi email thử tới</Label>
          <div className="flex gap-2">
            <Input id="resend-to" type="email" placeholder="email-cua-ban@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
            <Button type="button" onClick={test} disabled={busy}>
              {busy ? "Đang gửi…" : "Gửi email thử"}
            </Button>
          </div>
          {message && (
            <p role="status" className={status === "error" ? "text-sm text-red-700 dark:text-red-400" : "text-sm text-green-700 dark:text-green-400"} data-testid="resend-message">
              {message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={remove} data-testid="resend-remove">
            Xoá khoá
          </Button>
        </div>
      </section>

      <section aria-label="Hướng dẫn lấy API key" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Lấy API key Resend (khoảng 5 phút)</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Vào trang chủ Resend và tạo tài khoản bằng email của bạn (giao diện và điều kiện gói miễn phí có thể thay đổi, hãy đọc trang giá của họ).</li>
          <li>Trong dashboard, mở mục API Keys và tạo key mới với quyền gửi email (Sending access). Sao chép key ngay vì chỉ hiện một lần.</li>
          <li>Dán key vào ô phía trên. Để trống From thì thư gửi từ <code>{DEFAULT_FROM}</code>, chỉ tới được email chủ tài khoản.</li>
          <li>Nhập email của bạn vào ô “Gửi email thử tới” rồi bấm gửi, sau đó kiểm tra hộp thư (cả mục Spam).</li>
          <li>Học xong, vào dashboard Resend thu hồi key và bấm “Xoá khoá” ở đây.</li>
        </ol>
        <p className="text-sm text-muted-foreground">
          Chưa muốn đăng ký? Dùng khoá thử <code>re_test_demo</code> để chạy cả luồng mà không gửi gì ra ngoài: chỉ gửi được tới <code>{TEST_ACCOUNT_EMAIL}</code>;{" "}
          <code>re_test_invalid</code> luôn trả 401 và <code>re_test_limit</code> luôn trả 429 để bạn luyện kiểm thử lỗi.
        </p>
      </section>

      <section aria-label="Xuất .env" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Xuất .env cho starter repo</h2>
        <p className="text-sm text-muted-foreground">
          Chỉ dùng khoá free hoặc quyền tối thiểu, không dán dữ liệu thật. File .env đã được .gitignore nên không bị commit.
        </p>
        <pre tabIndex={0} className="overflow-x-auto rounded-lg bg-muted p-3 text-xs" data-testid="env-export">
          {envText}
        </pre>
      </section>

      <section aria-label="Dịch vụ khác" className="rounded-xl border p-5 text-sm">
        <h2 className="mb-2 text-lg font-semibold">Dịch vụ khác</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>SMS OTP: dùng hộp tin nhắn giả tại <a className="underline" href="/lab/sms">/lab/sms</a>, không gửi SMS thật.</li>
          <li>OAuth, thanh toán, database, CAPTCHA: đã có bản giả chạy ngay trong site.</li>
        </ul>
      </section>
    </div>
  );
}
