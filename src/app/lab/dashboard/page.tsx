import { Suspense } from "react";
import { DashboardApp } from "@/components/lab/dashboard/dashboard-app";

export const metadata = { title: "LAB-15 Dashboard & biểu đồ" };

export default function DashboardLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-15 · Dashboard doanh thu &amp; biểu đồ</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dữ liệu mô phỏng từ <code>2026-02-01</code> đến <code>2026-03-31</code>. Với ngày thứ <code>d</code> (tính từ
        2026-02-01) và danh mục <code>c</code> (Điện tử 0, Thời trang 1, Gia dụng 2): số đơn ={" "}
        <code>10 + (d×7 + c×3) mod 13</code>; doanh thu = số đơn × (giá nền + (d mod 5) × 10.000) với giá nền 500.000,
        200.000, 300.000. “Tất cả” là tổng ba danh mục. Kỳ trước là khoảng cùng độ dài ngay trước ngày bắt đầu. Bật bug
        bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <DashboardApp />
        </Suspense>
      </div>
    </div>
  );
}
