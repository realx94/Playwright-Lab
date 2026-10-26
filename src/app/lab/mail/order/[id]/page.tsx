import { Suspense } from "react";
import { OrderPage } from "@/components/lab/mail/mail-pages";

export const metadata = { title: "Chi tiết đơn hàng" };

export default function MailOrderPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Suspense>
        <OrderPage />
      </Suspense>
    </div>
  );
}
