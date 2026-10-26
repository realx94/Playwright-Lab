import { Suspense } from "react";
import { OrdersApp } from "@/components/lab/orders/orders-app";

export const metadata = { title: "LAB-21 Đơn hàng & kiểm tra DB" };

export default function OrdersLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-21 · Xác minh DB sau khi gọi API</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        API: <code>POST/GET /api/lab/orders</code>, <code>GET/DELETE /api/lab/orders/&#123;id&#125;</code> (token{" "}
        <code>Bearer admin-token</code>). Đọc DB chỉ-đọc: <code>GET /api/lab/db/&#123;bảng&#125;</code> với header{" "}
        <code>x-db-token: readonly</code>; bảng <code>products</code>, <code>orders</code>,{" "}
        <code>order_items</code>, <code>audit_log</code>; lọc bằng query như <code>?order_id=o-1001</code>. Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03,BUG-04</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <OrdersApp />
        </Suspense>
      </div>
    </div>
  );
}
