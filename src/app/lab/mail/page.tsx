import { Suspense } from "react";
import { MailApp } from "@/components/lab/mail/mail-app";

export const metadata = { title: "LAB-23 Email giao dịch" };

export default function MailLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-23 · Email giao dịch</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Đặt hàng (xác nhận bằng email tiếng Việt hoặc tiếng Anh) và quên mật khẩu (liên kết dùng một lần, hiệu lực 15
        phút). Thư “gửi” vào hộp thư giả tại <a className="underline" href="/lab/inbox"><code>/lab/inbox</code></a>. Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <MailApp />
        </Suspense>
      </div>
    </div>
  );
}
