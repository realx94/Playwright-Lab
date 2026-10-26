import { Suspense } from "react";
import { TableApp } from "@/components/lab/table/table-app";

export const metadata = { title: "LAB-08 Bảng dữ liệu động" };

export default function TableLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-08 · Bảng dữ liệu động (Quản lý người dùng)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>. Dùng <code>?delay=1500</code> để làm bảng tải chậm hơn
        (mặc định 300 ms).
      </p>
      <div className="mt-8">
        <Suspense>
          <TableApp />
        </Suspense>
      </div>
    </div>
  );
}
