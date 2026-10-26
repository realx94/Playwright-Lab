/** Cấu hình gửi email thật (Resend) của người học. Chỉ nằm trong trình duyệt, đi kèm từng request tới proxy. */

export const RESEND_CFG_KEY = "byo:resend";

export interface ResendConfig {
  key: string;
  from: string;
  /** Khi bật, email mà lab “gửi” sẽ được gửi thêm qua Resend (hộp thư giả vẫn luôn có thư). */
  enabled: boolean;
}

export const emptyConfig: ResendConfig = { key: "", from: "", enabled: false };

export interface SendResult {
  ok: boolean;
  message: string;
  id?: string;
  mode?: "test" | "real";
}

export function loadConfig(): ResendConfig {
  try {
    const raw = localStorage.getItem(RESEND_CFG_KEY);
    return raw ? { ...emptyConfig, ...JSON.parse(raw) } : emptyConfig;
  } catch {
    return emptyConfig;
  }
}

export function saveConfig(c: ResendConfig) {
  try {
    localStorage.setItem(RESEND_CFG_KEY, JSON.stringify(c));
  } catch {}
}

export function clearConfig() {
  try {
    localStorage.removeItem(RESEND_CFG_KEY);
  } catch {}
}

/** Che khoá khi hiển thị: chỉ giữ tiền tố và 4 ký tự cuối. */
export function maskKey(k: string): string {
  if (!k) return "";
  return k.length <= 10 ? "****" : `${k.slice(0, 3)}****${k.slice(-4)}`;
}

export async function sendViaProxy(cfg: ResendConfig, mail: { to: string; subject: string; text: string }): Promise<SendResult> {
  try {
    const res = await fetch("/api/byo/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-resend-key": cfg.key },
      body: JSON.stringify({ ...mail, from: cfg.from || undefined }),
    });
    const data = (await res.json()) as { ok: boolean; id?: string; message?: string; mode?: "test" | "real" };
    return data.ok
      ? { ok: true, message: "Đã gửi", id: data.id, mode: data.mode }
      : { ok: false, message: data.message ?? `Lỗi ${res.status}`, mode: data.mode };
  } catch {
    return { ok: false, message: "Không gọi được proxy gửi email" };
  }
}

/**
 * Gọi sau khi lab ghi thư vào hộp thư giả. Trả về null nếu người học chưa bật gửi thật,
 * ngược lại trả về kết quả để lab hiển thị. Thư giả vẫn là nguồn sự thật cho test.
 */
export async function mirrorToRealInbox(mail: { to: string; subject: string; body: string }): Promise<SendResult | null> {
  const cfg = loadConfig();
  if (!cfg.enabled || !cfg.key) return null;
  return sendViaProxy(cfg, { to: mail.to, subject: mail.subject, text: mail.body });
}

export function describeMirror(r: SendResult, to: string): string {
  if (r.ok) return r.mode === "test" ? `Gửi thử (Resend giả) tới ${to}: thành công` : `Đã gửi email thật tới ${to}`;
  return `Không gửi được email thật: ${r.message}. Thư vẫn có trong hộp thư giả`;
}
