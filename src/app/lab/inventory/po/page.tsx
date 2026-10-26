import { Suspense } from "react";
import { PurchaseOrdersApp } from "@/components/lab/inventory/inventory-app";

export const metadata = { title: "LAB-09 Đơn nhập hàng" };

export default function PurchaseOrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-09 · Đơn nhập hàng</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Nháp → Đã gửi → Đã nhận (cộng tồn kho) hoặc Đã huỷ. Đơn đã nhận hoặc đã huỷ không còn thao tác.
      </p>
      <div className="mt-8">
        <Suspense>
          <PurchaseOrdersApp />
        </Suspense>
      </div>
    </div>
  );
}
