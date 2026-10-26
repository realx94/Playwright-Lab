import { Suspense } from "react";
import { CartApp } from "@/components/lab/cart/cart-app";

import { TestCaseWorkshop } from "@/components/lab/test-case-workshop";

export const metadata = { title: "LAB-03 Giỏ hàng & Checkout" };

export default function CartLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-03 · Giỏ hàng & Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>. Mã giảm giá thử: <code>SALE10</code>.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
        <li>BR-01 Mỗi sản phẩm tối đa 10 (và không vượt tồn kho).</li>
        <li>BR-02 SALE10 giảm 10%, đơn tối thiểu 500.000đ, giảm tối đa 100.000đ.</li>
        <li>BR-03 Miễn phí ship khi tạm tính sau giảm giá ≥ 1.000.000đ, còn lại 30.000đ.</li>
        <li>BR-04 VAT 8% tính sau giảm giá, làm tròn đến đồng.</li>
        <li>BR-05 Sản phẩm hết hàng không thêm được vào giỏ.</li>
        <li>BR-06 Trạng thái đơn: Mới → Đã thanh toán → Đang giao → Hoàn tất; chỉ huỷ khi chưa giao.</li>
      </ul>
      <div className="mt-8">
        <Suspense>
          <CartApp />
        </Suspense>
      </div>
      <TestCaseWorkshop lab="cart" />
    </div>
  );
}
