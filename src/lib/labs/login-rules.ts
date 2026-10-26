export const LOCK_THRESHOLD = 5;
export const LOCK_MINUTES = 15;
export const EMAIL_MAX = 254;

export const SEED_USER = { email: "user@lab.dev", password: "Passw0rd!" };

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

export function validateEmail(email: string): string | null {
  if (!email) return "Vui lòng nhập email";
  if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) return "Email không hợp lệ";
  return null;
}

/** BR-02: 8–32 ký tự, có hoa, thường, số, ký tự đặc biệt. BUG-01 cho phép 7 ký tự. */
export function validatePassword(pw: string, bugs: Set<string>): string | null {
  if (!pw) return "Vui lòng nhập mật khẩu";
  const min = bugs.has("BUG-01") ? 7 : 8;
  if (pw.length < min) return "Mật khẩu tối thiểu 8 ký tự";
  if (pw.length > 32) return "Mật khẩu tối đa 32 ký tự";
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw))
    return "Mật khẩu cần chữ hoa, chữ thường, số và ký tự đặc biệt";
  return null;
}

export const lockThreshold = (bugs: Set<string>) =>
  bugs.has("BUG-02") ? LOCK_THRESHOLD + 1 : LOCK_THRESHOLD;

export const BUGS = [
  { id: "BUG-01", hint: "Quy tắc mật khẩu" },
  { id: "BUG-02", hint: "Quy tắc khoá tài khoản" },
  { id: "BUG-03", hint: "Thông báo lỗi đăng nhập" },
];
