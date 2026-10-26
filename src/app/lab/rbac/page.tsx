import { Suspense } from "react";
import { RbacApp } from "@/components/lab/rbac/rbac-app";

export const metadata = { title: "LAB-26 Phân quyền RBAC & multi-tenant" };

export default function RbacLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-26 · Phân quyền RBAC &amp; nhiều tổ chức</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Năm người dùng: alice (A, admin), bob (A, manager), carol (A, staff), dave (A, guest), erin (B, admin). API:{" "}
        <code>/api/lab/rbac/docs</code> và <code>/api/lab/rbac/docs/&#123;id&#125;</code> với header{" "}
        <code>Authorization: Bearer &lt;tên người dùng&gt;</code> (ví dụ <code>Bearer alice</code>). Mở hai tab hoặc hai
        browser context để thử hai người dùng cùng lúc. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <RbacApp />
        </Suspense>
      </div>
    </div>
  );
}
