import { Suspense } from "react";
import { InsuranceApp } from "@/components/lab/insurance/insurance-app";

export const metadata = { title: "LAB-32 Báo giá bảo hiểm xe" };

export default function InsuranceLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-32 · Báo giá bảo hiểm xe</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Form 4 bước: chủ xe, thông tin xe, gói bảo hiểm, xem lại và xác nhận. Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <InsuranceApp />
        </Suspense>
      </div>
    </div>
  );
}
