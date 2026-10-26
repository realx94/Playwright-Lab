import { Suspense } from "react";
import { BankApp } from "@/components/lab/bank/bank-app";

export const metadata = { title: "LAB-05 Chuyển tiền ngân hàng" };

export default function BankLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-05 · Ngân hàng: chuyển tiền nhiều bước</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Số dư ban đầu 10.000.000 ₫. Tài khoản nhận: <code>0123456789</code> (Nguyễn Văn A), <code>9876543210</code>{" "}
        (Trần Thị B); <code>1122334455</code> là tài khoản của bạn. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <BankApp />
        </Suspense>
      </div>
    </div>
  );
}
