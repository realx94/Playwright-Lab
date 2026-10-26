import { Suspense } from "react";
import { InventoryApp } from "@/components/lab/inventory/inventory-app";

export const metadata = { title: "LAB-09 Quản lý kho" };

export default function InventoryLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-09 · Quản lý kho &amp; đơn nhập hàng</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Hai trang dùng chung dữ liệu: <code>/lab/inventory</code> (tồn kho, biến động) và{" "}
        <code>/lab/inventory/po</code> (đơn nhập hàng; nhận hàng cộng vào tồn kho). Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <InventoryApp />
        </Suspense>
      </div>
    </div>
  );
}
