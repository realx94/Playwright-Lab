import { Suspense } from "react";
import { GuardApp } from "@/components/lab/guard/guard-app";

export const metadata = { title: "LAB-24 CAPTCHA & rate limit" };

export default function GuardLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-24 · CAPTCHA &amp; giới hạn tần suất</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Đăng nhập <code>user@lab.dev</code> / <code>Passw0rd!</code>. Sai 2 lần thì phải qua CAPTCHA; sai 4 lần thì bị
        khóa 5 giây (API trả 429 kèm <code>Retry-After</code>): <code>POST /api/lab/guard/login</code>. Thêm{" "}
        <code>?captcha=test</code> để CAPTCHA tự đạt (giống khoá test của CAPTCHA thật). Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <GuardApp />
        </Suspense>
      </div>
    </div>
  );
}
