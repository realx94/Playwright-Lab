import { Suspense } from "react";
import { PayApp } from "@/components/lab/pay/pay-app";

export const metadata = { title: "LAB-20 Thanh toán thẻ" };

export default function PayLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-20 · Thanh toán thẻ (kiểu Stripe test mode)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Nhập thẻ trong iframe, thử các thẻ test, xác thực 3D Secure, chờ webhook cập nhật đơn và hoàn tiền một
        phần hoặc toàn phần. Thẻ test: <code>4242 4242 4242 4242</code> (thành công),{" "}
        <code>4000 0000 0000 0002</code> (bị từ chối), <code>4000 0000 0000 9995</code> (không đủ số dư),{" "}
        <code>4000 0025 0000 3155</code> (cần 3D Secure). Hết hạn là tháng bất kỳ trong tương lai, CVC 3 số. Bật bug
        bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <PayApp />
        </Suspense>
      </div>
    </div>
  );
}
