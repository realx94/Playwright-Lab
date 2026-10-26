import { NextResponse } from "next/server";

export const GUARD_COOKIE = "lab_guard";
export const CAPTCHA_AFTER = 2; // số lần sai trước khi yêu cầu CAPTCHA
export const LOCK_AFTER = 4; // số lần sai thì khóa
export const LOCK_MS = 5000;
export const CAPTCHA_TOKEN = "captcha-ok";
export const GOOD_EMAIL = "user@lab.dev";
export const GOOD_PASSWORD = "Passw0rd!";

export const BUGS = [
  { id: "BUG-01", hint: "Yêu cầu CAPTCHA sau nhiều lần sai" },
  { id: "BUG-02", hint: "Header khi bị giới hạn tần suất" },
  { id: "BUG-03", hint: "Đăng nhập đúng trong lúc đang bị khóa" },
];

export interface Guard {
  f: number; // số lần sai liên tiếp
  l: number; // thời điểm hết khóa (ms)
}

export function readGuard(raw: string | undefined): Guard {
  if (!raw) return { f: 0, l: 0 };
  try {
    const o = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Guard;
    return { f: Number(o.f) || 0, l: Number(o.l) || 0 };
  } catch {
    return { f: 0, l: 0 };
  }
}

export function withGuard(res: NextResponse, g: Guard): NextResponse {
  res.cookies.set(GUARD_COOKIE, Buffer.from(JSON.stringify(g), "utf8").toString("base64url"), {
    path: "/api/lab",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60,
  });
  return res;
}

export function resetGuard(res: NextResponse): NextResponse {
  res.cookies.set(GUARD_COOKIE, "", { path: "/api/lab", maxAge: 0 });
  return res;
}
