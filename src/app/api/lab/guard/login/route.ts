import { NextResponse, type NextRequest } from "next/server";
import { bugsOf } from "@/lib/labs/books-api";
import {
  CAPTCHA_AFTER,
  CAPTCHA_TOKEN,
  GOOD_EMAIL,
  GOOD_PASSWORD,
  GUARD_COOKIE,
  LOCK_AFTER,
  LOCK_MS,
  readGuard,
  withGuard,
} from "@/lib/labs/guard-rules";

/** Đăng nhập có chống brute-force: CAPTCHA sau 2 lần sai, khóa 5 giây sau 4 lần sai (429 + Retry-After). */
export async function POST(req: NextRequest) {
  const bugs = bugsOf(req);
  const now = Date.now();
  let g = readGuard(req.cookies.get(GUARD_COOKIE)?.value);

  let body: { email?: string; password?: string; captcha?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body không phải JSON hợp lệ" }, { status: 400 });
  }
  const correct = body.email === GOOD_EMAIL && body.password === GOOD_PASSWORD;

  // BR-04: đang bị khóa thì trả 429 kèm Retry-After. BUG-03: đăng nhập đúng vẫn được qua. BUG-02: thiếu Retry-After.
  if (g.l > now && !(bugs.has("BUG-03") && correct)) {
    const retryAfter = Math.ceil((g.l - now) / 1000);
    return withGuard(
      NextResponse.json(
        { message: `Quá nhiều lần thử. Hãy thử lại sau ${retryAfter} giây`, retryAfter },
        { status: 429, headers: bugs.has("BUG-02") ? undefined : { "Retry-After": String(retryAfter) } },
      ),
      g,
    );
  }

  // BR-02: từ lần thứ 3 phải kèm CAPTCHA. BUG-01: không bao giờ đòi CAPTCHA.
  const needCaptcha = g.f >= CAPTCHA_AFTER && !bugs.has("BUG-01");
  if (needCaptcha && body.captcha !== CAPTCHA_TOKEN)
    return NextResponse.json({ code: "captcha_required", message: "Cần xác nhận CAPTCHA" }, { status: 403 });

  if (correct) return withGuard(NextResponse.json({ token: "session-ok", email: GOOD_EMAIL }), { f: 0, l: 0 });

  g = { f: g.f + 1, l: g.f + 1 >= LOCK_AFTER ? now + LOCK_MS : 0 };
  if (g.l) {
    const retryAfter = Math.ceil(LOCK_MS / 1000);
    return withGuard(
      NextResponse.json(
        { message: `Quá nhiều lần thử. Hãy thử lại sau ${retryAfter} giây`, retryAfter },
        { status: 429, headers: bugs.has("BUG-02") ? undefined : { "Retry-After": String(retryAfter) } },
      ),
      g,
    );
  }
  return withGuard(
    NextResponse.json(
      { message: "Sai email hoặc mật khẩu", attemptsLeft: LOCK_AFTER - g.f, captchaRequired: g.f >= CAPTCHA_AFTER && !bugs.has("BUG-01") },
      { status: 401 },
    ),
    g,
  );
}
