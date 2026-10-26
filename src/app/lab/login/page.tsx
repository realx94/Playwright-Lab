import { Suspense } from "react";
import { LoginApp } from "@/components/lab/login/login-app";
import { SEED_USER } from "@/lib/labs/login-rules";

export const metadata = { title: "LAB-01 Login" };

export default function LoginLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-01 · Login & Đăng ký</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tài khoản test: <code>{SEED_USER.email}</code> / <code>{SEED_USER.password}</code>. Bật bug
        bằng <code>?bugs=BUG-01,BUG-02</code>.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
        <li>BR-01 Email hợp lệ, tối đa 254 ký tự.</li>
        <li>BR-02 Mật khẩu 8–32 ký tự, có hoa, thường, số, ký tự đặc biệt.</li>
        <li>BR-03 Sai mật khẩu 5 lần liên tiếp → khoá 15 phút.</li>
        <li>BR-04 “Ghi nhớ đăng nhập” giữ phiên 7 ngày.</li>
      </ul>
      <div className="mt-8">
        <Suspense>
          <LoginApp />
        </Suspense>
      </div>
    </div>
  );
}
