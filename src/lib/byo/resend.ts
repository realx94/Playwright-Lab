/** Dùng chung cho proxy gửi email thật (Resend) và chế độ thử không gọi mạng. */

export const KEY_RE = /^re_[A-Za-z0-9_-]{6,200}$/;
/** Khoá bắt đầu bằng tiền tố này chạy với Resend giả trong site: không gọi mạng, không gửi thật. */
export const TEST_KEY_PREFIX = "re_test_";
export const DEFAULT_FROM = "onboarding@resend.dev";
/** Trong chế độ thử, đây là email “chủ tài khoản”: địa chỉ duy nhất onboarding@resend.dev được gửi tới. */
export const TEST_ACCOUNT_EMAIL = "owner@example.com";

export interface MailPayload {
  to: string;
  subject: string;
  text: string;
  from?: string;
}

export interface Outcome {
  status: number;
  body: { id?: string; message?: string };
}

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

export const isResendKey = (k: string) => KEY_RE.test(k);

/** Trả về thông báo lỗi hoặc null nếu hợp lệ. */
export function validatePayload(p: Partial<MailPayload>): string | null {
  if (typeof p.to !== "string" || !EMAIL_RE.test(p.to) || p.to.length > 254) return "Email người nhận không hợp lệ";
  if (typeof p.subject !== "string" || p.subject.trim().length === 0 || p.subject.length > 200)
    return "Tiêu đề bắt buộc, tối đa 200 ký tự";
  if (typeof p.text !== "string" || p.text.trim().length === 0 || p.text.length > 10_000)
    return "Nội dung bắt buộc, tối đa 10.000 ký tự";
  if (p.from !== undefined && (typeof p.from !== "string" || p.from.length > 254 || /[\r\n]/.test(p.from)))
    return "Địa chỉ gửi không hợp lệ";
  return null;
}

/** Mô phỏng các phản hồi quan trọng của Resend để luyện kiểm thử mà không cần tài khoản. */
export function fakeResend(key: string, p: MailPayload): Outcome {
  if (key === `${TEST_KEY_PREFIX}invalid`) return { status: 401, body: { message: "API key is invalid" } };
  if (key === `${TEST_KEY_PREFIX}limit`) return { status: 429, body: { message: "Too many requests" } };
  const from = p.from || DEFAULT_FROM;
  if (from.toLowerCase().includes(DEFAULT_FROM) && p.to.toLowerCase() !== TEST_ACCOUNT_EMAIL)
    return {
      status: 403,
      body: { message: `You can only send testing emails to your own email address (${TEST_ACCOUNT_EMAIL})` },
    };
  return { status: 200, body: { id: `fake-${Math.abs(hash(`${p.to}${p.subject}${p.text}`)).toString(16)}` } };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/** Thông báo tiếng Việt cho mã trạng thái của Resend. */
export function explain(status: number, raw?: string): string {
  switch (status) {
    case 400:
    case 422:
      return `Resend từ chối nội dung gửi${raw ? `: ${raw}` : ""}`;
    case 401:
      return "API key không đúng hoặc đã bị thu hồi";
    case 403:
      return `Resend không cho gửi tới địa chỉ này${raw ? `: ${raw}` : ""}. Với onboarding@resend.dev chỉ gửi được tới email chủ tài khoản`;
    case 429:
      return "Vượt giới hạn tần suất của Resend, hãy đợi rồi thử lại";
    default:
      return status >= 500 ? "Resend đang lỗi, hãy thử lại sau" : `Resend trả mã ${status}${raw ? `: ${raw}` : ""}`;
  }
}
