import { Suspense } from "react";
import { OtpApp } from "@/components/lab/otp/otp-app";

export const metadata = { title: "LAB-17 Đăng nhập Email OTP" };

export default function OtpLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-17 · Đăng nhập bằng Email OTP</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Email đã đăng ký: <code>user@lab.dev</code>, <code>vip@lab.dev</code>. Mã được “gửi” vào hộp thư giả tại{" "}
        <code>/lab/inbox</code>. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>; dùng <code>?seed=1</code> để
        mã OTP cố định khi gỡ lỗi.
      </p>
      <div className="mt-8">
        <Suspense>
          <OtpApp />
        </Suspense>
      </div>
    </div>
  );
}
