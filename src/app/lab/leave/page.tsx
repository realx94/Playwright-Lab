import { Suspense } from "react";
import { LeaveApp } from "@/components/lab/leave/leave-app";

export const metadata = { title: "LAB-07 Nghỉ phép & duyệt đơn" };

export default function LeaveLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-07 · Nghỉ phép & duyệt đơn (HR)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mỗi tab có vai trò riêng (Nhân viên hoặc Quản lý) nhưng dùng chung dữ liệu: mở hai tab trong cùng một
        context để mô phỏng hai người cùng làm việc. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <LeaveApp />
        </Suspense>
      </div>
    </div>
  );
}
