import { Suspense } from "react";
import { OauthApp } from "@/components/lab/oauth/oauth-app";

export const metadata = { title: "LAB-19 Đăng nhập OAuth" };

export default function OauthLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-19 · Đăng nhập bằng OAuth (Fake IdP)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Luồng Authorization Code với nhà cung cấp danh tính giả LabID: chuyển hướng hoặc popup, chọn tài khoản,
        Cho phép/Từ chối, tham số <code>state</code>. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <OauthApp />
        </Suspense>
      </div>
    </div>
  );
}
