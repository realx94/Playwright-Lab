import { Suspense } from "react";
import { TotpApp } from "@/components/lab/totp/totp-app";

export const metadata = { title: "LAB-18 Đăng nhập 2FA (TOTP)" };

export default function TotpLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-18 · Xác thực hai bước (TOTP)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bật 2FA bằng khoá base32, đăng nhập bằng mã 6 số đổi mỗi 30 giây hoặc mã khôi phục dùng một lần. Dùng{" "}
        <code>page.clock</code> để kiểm soát thời gian. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <TotpApp />
        </Suspense>
      </div>
    </div>
  );
}
